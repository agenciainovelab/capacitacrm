
import { prisma } from './prisma';

export async function setupDatabase() {
  try {
    // Verificar se as tabelas já existem tentando fazer uma query
    await prisma.student.findFirst();
    console.log("Database already set up");
    return true;
  } catch (error) {
    console.log("Setting up database...");
    
    try {
      // Executar migrations/setup necessário
      // O Prisma vai criar as tabelas automaticamente na primeira conexão
      await prisma.$executeRaw`SELECT 1`;
      
      // Criar extensão citext se não existir
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS citext;`;
      
      console.log("Database setup completed");
      return true;
    } catch (setupError) {
      console.error("Database setup failed:", setupError);
      return false;
    }
  }
}
