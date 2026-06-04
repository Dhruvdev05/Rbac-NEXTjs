import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function checkDatabaseConnection(): Promise<boolean> {
try {
await prisma.$queryRaw`Select 1`;
return true;
}
catch (error) {
console.error('Database connection failed:', error);
return false;
}
};