import { prisma } from "./src/app/config/prisma"; // ajusta la ruta

async function testConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Conectado a la base");

        const result = await prisma.$queryRaw`SELECT DB_NAME() as db`;
        console.log("📦 Base actual:", result);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();