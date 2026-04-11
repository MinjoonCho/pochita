# Pochita Frontend

Next.js frontend for the Pochita distraction-tracking app. The app now talks to the Spring backend in [/Users/minjooncho/SandBox/pochita-server](/Users/minjooncho/SandBox/pochita-server).

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4

## Environment

Create `.env.local` from [.env.example](/Users/minjooncho/SandBox/pochita/.env.example):

```bash
cp /Users/minjooncho/SandBox/pochita/.env.example /Users/minjooncho/SandBox/pochita/.env.local
```

Default API target:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Run

Start the backend:

```bash
cd /Users/minjooncho/SandBox/pochita
npm run backend:start
```

Start the frontend:

```bash
cd /Users/minjooncho/SandBox/pochita
npm run dev
```

Health-check the backend:

```bash
cd /Users/minjooncho/SandBox/pochita
npm run backend:health
```

## Useful Scripts

- `npm run dev`: frontend dev server
- `npm run dev:web`: same as `dev`
- `npm run backend:start`: starts Spring backend with `gradlew`, `gradle`, or Docker fallback
- `npm run backend:health`: calls `/api/health`
- `npm run lint`: ESLint
- `npm run build:webpack`: production build without Turbopack

## Notes

- In this workspace, plain `next build` may fail because Turbopack hits sandbox process/port restrictions.
- `npm run build:webpack` is the reliable production verification path here.
- For Docker deployment of frontend + backend together, see [DEPLOY.md](/Users/minjooncho/SandBox/DEPLOY.md).
- For production deployment on Vercel + Railway, see [DEPLOY_VERCEL_RAILWAY.md](/Users/minjooncho/SandBox/DEPLOY_VERCEL_RAILWAY.md).
