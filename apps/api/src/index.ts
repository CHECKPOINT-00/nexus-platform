import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamText } from 'hono/streaming'
import './env.js'
import { auth } from './auth.js'

const app = new Hono()
const port = Number(process.env.PORT ?? 8000)

app.use(
  '/api/auth/*',
  cors({
    origin: (origin) =>
      /^http:\/\/localhost:(3000|3001)$/.test(origin) ? origin : null,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
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

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
