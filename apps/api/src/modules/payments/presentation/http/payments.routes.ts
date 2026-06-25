import { Hono } from 'hono'

export const paymentsRouter = new Hono()

paymentsRouter.get('/', (c) => {
  return c.json([])
})
