import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
    },
  });

  console.log('✅ Users created:', { user1: user1.email, user2: user2.email });

  // Create sample emails
  const emails = await Promise.all([
    prisma.email.upsert({
      where: { id: 'email-1' },
      update: {},
      create: {
        id: 'email-1',
        subject: 'Welcome to Email Microwave!',
        content: 'Thank you for joining our platform. We hope you enjoy using our email service.',
        fromEmail: user1.email,
        toEmail: 'welcome@example.com',
        status: 'SENT',
        sentAt: new Date(),
      },
    }),
    prisma.email.upsert({
      where: { id: 'email-2' },
      update: {},
      create: {
        id: 'email-2',
        subject: 'Meeting Reminder',
        content: 'Don\'t forget about our team meeting tomorrow at 2 PM.',
        fromEmail: user2.email,
        toEmail: 'team@example.com',
        status: 'PENDING',
      },
    }),
    prisma.email.upsert({
      where: { id: 'email-3' },
      update: {},
      create: {
        id: 'email-3',
        subject: 'Project Update',
        content: 'Here\'s the latest update on our ongoing project.',
        fromEmail: user1.email,
        toEmail: 'project@example.com',
        status: 'SENT',
        sentAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    }),
  ]);

  console.log('✅ Emails created:', emails.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample login credentials:');
  console.log('Email: john@example.com, Password: password123');
  console.log('Email: jane@example.com, Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 