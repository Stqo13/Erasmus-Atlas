import { Pool } from 'pg';
import type { QueryResultRow } from 'pg';

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: +(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'erasmus_atlas',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'Stefkowe%3A123',
  max: 10,
});

export async function q<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const res = await pool.query<T>(sql, params);
  return res.rows;
}
