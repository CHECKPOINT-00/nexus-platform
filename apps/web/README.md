# Web

Next.js 16 app for the product UI.

## Stack

- Next.js App Router
- HeroUI v3
- `next-themes`
- TanStack Query
- TanStack Virtual

## Setup

Run from repo root:

```bash
npm install
```

Set root `.env`:

- `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Run

```bash
npm run dev --workspace=apps/web
```

Open `http://localhost:3000`.

## Build and checks

```bash
npm run build --workspace=apps/web
npm run check-types --workspace=apps/web
npm run lint --workspace=apps/web
```

## Notes

- HeroUI setup lives in `app/theme-provider.tsx` and `app/globals.css`.
- `app/home-client.tsx` reads API health and renders the virtual list.
- `app/page.tsx` stays split between server UI and client data.
