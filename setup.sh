#!/bin/bash

echo "🚀 Setting up Email Microwave project..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install shared dependencies
echo "📦 Installing shared dependencies..."
cd shared && npm install && npm run build && cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Copy environment files
echo "⚙️ Setting up environment files..."
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd backend && npx prisma generate && cd ..

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your PostgreSQL database URL"
echo "2. Run 'npm run db:migrate' to create database tables"
echo "3. Run 'npm run db:seed' to populate with sample data"
echo "4. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔗 Backend will be available at: http://localhost:4000"
echo ""
echo "📝 Sample login credentials (after seeding):"
echo "Email: john@example.com, Password: password123"
echo "Email: jane@example.com, Password: password123" 