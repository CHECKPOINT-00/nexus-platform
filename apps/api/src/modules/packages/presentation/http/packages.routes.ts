import { Hono } from 'hono'

export const packagesRouter = new Hono()

packagesRouter.get('/', (c) => {
  return c.json([])
})
