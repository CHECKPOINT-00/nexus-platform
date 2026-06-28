import { createMiddleware } from 'hono/factory'
import { auth } from '../../../auth.js'

export type SessionUser = typeof auth.$Infer.Session.user
export type Session = typeof auth.$Infer.Session.session

export interface AuthEnv {
  Variables: {
    user: SessionUser
    session: Session
  }
}

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })

    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('user', session.user)
    c.set('session', session.session)
    await next()
  } catch (error) {
    console.error("Middleware requireAuth error:", error);
    return c.json({ error: 'Unauthorized' }, 401)
  }
})
