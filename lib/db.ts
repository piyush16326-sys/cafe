// lib/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Falls back automatically if Vercel uses POSTGRES_URL or DATABASE_URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    throw new Error('Database connection string is missing in environment variables.');
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });