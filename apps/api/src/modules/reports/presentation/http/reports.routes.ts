import { Hono } from 'hono'

export const reportsRouter = new Hono()

reportsRouter.get('/', (c) => {
  return c.json([])
})
