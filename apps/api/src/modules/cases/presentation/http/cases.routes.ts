import { Hono } from 'hono'

export const casesRouter = new Hono()

casesRouter.get('/', (c) => {
  return c.json([])
})
