# Research Report: Backend Architecture & Integrations

Date: 2026-06-25
Author: Antigravity Researcher 1

## Objective
Analyze Hono integration with Better Auth, database transactions with PostgreSQL, and Vercel AI SDK for streaming audit responses.

## Key Insights

### 1. Better Auth on Hono
- Better Auth runs cleanly in Hono by mounting the router using `app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))`.
- Session retrieval in Hono endpoints is done via `auth.api.getSession({ headers: c.req.raw.headers })`.
- Role verification will be implemented as a custom Hono middleware that checks `session.user.role`.

### 2. Database & Prisma Transactions
- The project uses Prisma 7 with Postgres. In multi-step creation flows (e.g. creating a case + starting a checkpoint + logging a case event), we will wrap operations in `prisma.$transaction()` to ensure atomicity.
- Since we use `@prisma/adapter-pg`, database queries run with native node-postgres connection pooling.

### 3. Vercel AI SDK Streaming
- Hono supports native streaming via `hono/streaming` helper `streamText`.
- We will integrate Vercel AI SDK using `streamText` from `@ai-sdk/openai` to process ideas/documents and yield real-time audit suggestions to the client.
- Model of choice: `gpt-4o-mini` for fast and cost-effective preprocessing/audits; `gpt-4o` for deep final audits.

## Citations
- [Hono Streaming Docs](https://hono.dev/docs/helpers/streaming)
- [Vercel AI SDK Text Streaming](https://sdk.vercel.ai/docs/ai-sdk-core/generating-text#streaming-text)
- [Better Auth Session Helpers](https://www.better-auth.com/docs/concepts/session-management)
