import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamText } from 'hono/streaming'
import { serveStatic } from '@hono/node-server/serve-static'
import './env.js'
import { auth } from './auth.js'
import { casesRouter } from './modules/cases/presentation/http/cases.routes.js'
import { reportsRouter } from './modules/reports/presentation/http/reports.routes.js'
import { paymentsRouter } from './modules/payments/presentation/http/payments.routes.js'
import { packagesRouter } from './modules/packages/presentation/http/packages.routes.js'
import { aiEngineRouter } from './modules/ai-engine/presentation/http/ai-engine.routes.js'
import { adminRouter } from './modules/admin/presentation/http/admin.routes.js'
import { supporterRouter } from './modules/supporter/presentation/http/supporter.routes.js'

const app = new Hono()
const port = Number(process.env.PORT ?? 8000)

app.use('/uploads/*', serveStatic({ root: './' }))

app.use(
  '/api/*',
  cors({
    origin: (origin) =>
      /^http:\/\/localhost:(3000|3001)$/.test(origin) ? origin : null,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health', (c) => {
  return c.json({ ok: true })
})

app.get('/stream', (c) => {
  return streamText(c, async (stream) => {
    await stream.writeln('Hello')
    await stream.sleep(250)
    await stream.writeln('from Hono streaming')
  })
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

app.get('/session', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.body(null, 401)
  }

  return c.json(session)
})

// Mount Bounded Context Modules
app.route('/api/cases', casesRouter)
app.route('/api/reports', reportsRouter)
app.route('/api/payments', paymentsRouter)
app.route('/api/packages', packagesRouter)
app.route('/api/ai-engine', aiEngineRouter)
app.route('/api/admin', adminRouter)
app.route('/api/supporter', supporterRouter)

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
