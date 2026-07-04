import { Hono } from 'hono'

export const aiEngineRouter = new Hono()

aiEngineRouter.get('/', (c) => {
  return c.json([])
})
