# LMS Frontend (Next.js)

## Environment

- Node.js 20+, npm 10+ (installed via `npx create-next-app`).
- Add `.env.local` with:
  ```bash
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
  NEXT_PUBLIC_PUSHER_APP_KEY=local
  NEXT_PUBLIC_PUSHER_HOST=localhost
  NEXT_PUBLIC_PUSHER_PORT=6001
  NEXT_PUBLIC_PUSHER_TLS=false
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
  ```
- Ensure Laravel is broadcasting over the same key/host/port (Laravel WebSockets, Soketi, or Pusher). Sanctum bearer token is passed automatically for private-channel auth.

## Getting Started

```bash
npm install
npm run dev
```

## Integration Plan

1. **Auth Layer**  
   - Create `/auth/login` page that posts to `POST /auth/login` and stores the returned bearer token in memory (TanStack Query + React Context).  
   - Middleware to guard `/dashboard` routes by checking token presence.

2. **Data Fetching**  
   - Configure TanStack Query base client with interceptors that attach `Authorization: Bearer <token>`.  
   - Implement reusable hook `useApiQuery(path, options)` that prepends `/api/v1`.

3. **Realtime**  
   - Install `laravel-echo` + Pusher client.  
   - Establish connection after successful login; subscribe to `private.leads.{id}` for detail views and to a team channel for aggregated notifications.

4. **Dashboards & Maps**  
   - Use `@tanstack/react-charts` or Recharts for KPI widgets (conversion rate, avg time-to-convert).  
   - Integrate Mapbox GL JS for geospatial view; load data via `/leads?territory_code=...` filters.

5. **Imports/Exports UI**  
   - Build stepper modal for file upload and mapping; poll `/imports/{id}` for progress using React Query polling.

Track progress with dedicated issues/linear tasks per feature to keep parity with backend API contract.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
