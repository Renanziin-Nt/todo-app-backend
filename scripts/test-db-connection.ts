const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('🔄 Testing Prisma database connection...');
    

    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    

    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log(`🕒 Current time: ${result[0].current_time}`);
    

    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma%'
    `;
    
    console.log(`📋 Found ${tables.length} application tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    

    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM _prisma_migrations 
        ORDER BY finished_at DESC 
        LIMIT 5
      `;
      
      console.log(`🔄 Recent migrations: ${migrations.length}`);
      migrations.forEach(migration => {
        console.log(`   - ${migration.migration_name} (${migration.finished_at})`);
      });
    } catch (migrationError) {
      console.log('⚠️  No migrations table found - run "npx prisma migrate deploy" first');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();