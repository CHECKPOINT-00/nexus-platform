import pino from 'pino'
import path from 'node:path'
import fs from 'node:fs'

/**
 * Base Pino logger for Nexus API.
 *
 * - Dev: pretty-print to stdout + file
 * - Prod: JSON to stdout, ship to Grafana Cloud Loki if configured
 * - ENABLE_LOKI=false → logs/combined.log + logs/error.log
 * - ENABLE_LOKI=true  → push to Grafana Cloud Loki
 * - Redacted: auth headers, passwords, tokens, secrets
 */
const level = process.env.LOG_LEVEL ?? 'info'
const service = process.env.SERVICE_NAME ?? 'nexus-api'
const enableLoki = process.env.ENABLE_LOKI === 'true'

const targets: pino.TransportTargetOptions[] = [
  // Always write JSON to stdout (container logs, Promtail scrape)
  { target: 'pino/file', options: { destination: 1 }, level },
]

// Development pretty-print
if (process.env.NODE_ENV !== 'production') {
  targets.push({
    target: 'pino-pretty',
    options: { colorize: true, ignore: 'pid,hostname' },
    level,
  })
}

// File logging when Loki is disabled
if (!enableLoki) {
  const logDir = path.resolve(process.cwd(), 'logs')
  fs.mkdirSync(logDir, { recursive: true })

  targets.push(
    { target: 'pino/file', options: { destination: path.join(logDir, 'combined.log') }, level },
    { target: 'pino/file', options: { destination: path.join(logDir, 'error.log') }, level: 'error' },
  )
}

// Optional Loki shipping (Grafana Cloud or self-hosted)
if (enableLoki) {
  const lokiUrl = process.env.LOKI_URL
  const lokiUser = process.env.LOKI_USER
  const lokiPass = process.env.LOKI_PASSWORD

  if (!lokiUrl || !lokiUser || !lokiPass) {
    console.warn('[logger] ENABLE_LOKI=true but LOKI_URL/USER/PASSWORD missing — Loki transport disabled')
  } else {
    targets.push({
      target: 'pino-loki',
      level,
      options: {
        host: lokiUrl,
        basicAuth: { username: lokiUser, password: lokiPass },
        labels: { service, env: process.env.NODE_ENV ?? 'development' },
        batching: true,
        interval: 5,
        replaceTimestamp: true,
      },
    })
  }
}

const baseLogger = pino({
  level,
  transport: { targets },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.secret',
      '*.credit_card',
      '*.ccv',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  base: { service, env: process.env.NODE_ENV ?? 'development' },
})

/**
 * Create a child logger with request-scoped context.
 * Use in middleware to attach correlationId, actor_id, etc.
 */
export function childLogger(context: Record<string, unknown>) {
  return baseLogger.child(context)
}

export default baseLogger
