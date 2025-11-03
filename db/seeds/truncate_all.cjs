const { Client } = require('pg');

(async () => {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error('Missing DATABASE_URL (set it in db/.env.local)');
    process.exit(1);
  }
  const client = new Client({ connectionString: conn });
  await client.connect();
  try {
    console.log('🔪 Truncating tables (with CASCADE) and resetting identities...');
    await client.query('BEGIN');
    await client.query(`
      TRUNCATE TABLE posts, cities, users
      RESTART IDENTITY CASCADE;
    `);
    await client.query('COMMIT');
    console.log('✅ Truncate complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Truncate failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
