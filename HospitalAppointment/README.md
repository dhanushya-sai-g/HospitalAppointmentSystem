# Hospital Appointment (Next.js + PostgreSQL)

Minimal full-stack hospital appointment system with role-based doctor/patient flows.

Quick start (development using Docker Compose):

1. Copy `.env.example` to `.env` and ensure it has:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hospital?schema=public"
JWT_SECRET=your-secret-key-here
```

2. Start Postgres using Docker Compose:

```bash
docker-compose up -d
```

3. Install and prepare DB:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

4. Run dev server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

Testing:

Tests use `jest` with a local sqlite file (for isolation). Run:

```bash
DATABASE_URL="file:./dev-test.db" npm test
```

Stop Postgres:

```bash
docker-compose down
```

Notes and architecture:
- Prisma for DB models and transactions (atomic appointment booking)
- Basic JWT auth, password hashing with bcrypt
- APIs under `pages/api/*`
- Minimal frontend pages under `pages/` demonstrating signup, login, browsing, booking, and dashboards

Next steps you might request:
- Add richer UI (React components, calendar picker)
- Add pagination/search for doctors
- Add email notifications integration
- Harden auth (refresh tokens, CSRF protection)
# HospitalAppointment