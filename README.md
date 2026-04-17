# Algo Trading

A full-stack algorithmic trading platform with live market data, strategy management, backtesting, analytics, and multi-broker integration. **JavaScript version.**

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Local Development

```bash
# 1. Start databases
docker-compose up -d postgres redis

# 2. Backend setup
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Demo Credentials
- **Email:** demo@algotradehub.com
- **Password:** demo123456

## 📁 Structure

```
algo-trading/
├── frontend/          # Next.js 14 (JavaScript, Tailwind CSS)
├── backend/           # Express.js (JavaScript, Prisma)
├── nginx/             # Reverse proxy config
├── docker-compose.yml # Local dev services
└── .github/           # CI/CD pipeline
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, JavaScript, Tailwind CSS, Recharts |
| Backend | Express.js, JavaScript, Prisma ORM, Socket.io |
| Database | PostgreSQL + TimescaleDB, Redis |
| Auth | JWT + Refresh Tokens + TOTP 2FA |
| Infra | Docker, Nginx, GitHub Actions |


