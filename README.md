# Email Microwave

A modern full-stack TypeScript project built with Next.js, Express, PostgreSQL, and Prisma.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: TailwindCSS
- **Language**: TypeScript (full-stack)

## 📁 Project Structure

```
email-microwave/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── shared/            # Shared types and utilities
├── package.json       # Root package.json with workspaces
└── README.md         # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### 1. Quick Setup (Recommended)

```bash
# Run the automated setup script
./setup.sh
```

### 2. Manual Setup

If you prefer to set up manually:

```bash
# Install root dependencies
npm install

# Install and build shared package
cd shared && npm install && npm run build && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Copy environment files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local

# Generate Prisma client
cd backend && npx prisma generate && cd ..
```

### 3. Environment Setup

The setup script has already copied the environment files. Update them with your configuration:

**Backend (.env):**
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Backend server port (default: 4000)

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:4000)

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed the database
npm run db:seed
```

### 5. Development

Start both frontend and backend in development mode:

```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### 6. Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client after schema changes
npm run db:generate

# Create and run new migrations
npm run db:migrate
```

## 📝 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both frontend and backend
- `npm run lint` - Run linting across all workspaces
- `npm run type-check` - Run TypeScript type checking

## 🔧 Development

### Frontend (Next.js)

The frontend is built with Next.js 14 using the App Router. Key features:

- TypeScript for type safety
- TailwindCSS for styling
- App Router for modern routing
- API routes for backend communication

### Backend (Express)

The backend provides a RESTful API with:

- Express.js with TypeScript
- Prisma ORM for database operations
- JWT authentication (ready to implement)
- CORS configuration
- Request validation

### Database

PostgreSQL with Prisma ORM provides:

- Type-safe database queries
- Automatic migrations
- Database seeding
- Prisma Studio for database management

## 🚀 Deployment

### Frontend

The Next.js app can be deployed to Vercel, Netlify, or any Node.js hosting platform.

### Backend

The Express.js API can be deployed to platforms like:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

### Database

PostgreSQL can be hosted on:
- Supabase
- Railway
- Neon
- AWS RDS
- DigitalOcean Managed Databases

## 📄 License

MIT 