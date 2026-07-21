import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// URL de conexión con fallback de Postgres para evitar fallos de inicialización en el build
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres"

const prismaClientSingleton = () => {
  const isLocalhost = connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
  const pool = new Pool({ 
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false }
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: any | undefined;
} & typeof global;

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db
