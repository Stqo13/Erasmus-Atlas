// db/seeds/seed_users.cjs
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

(async () => {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error('Missing DATABASE_URL (set db/.env.local)');
    process.exit(1);
  }
  const client = new Client({ connectionString: conn });
  await client.connect();

  try {
    console.log('👤 Seeding users...');

    // If your users table has password_hash (common), use bcrypt.
    const hash = await bcrypt.hash('secret123', 10);

    // Upsert helper (works if you have UNIQUE(email))
    const UPSERT = `
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;

    const users = [
      ['Alice Martin', 'alice@example.com', hash],
      ['Bob Rossi', 'bob@example.com', hash],
      ['Clara Müller', 'clara@example.com', hash],
      ['David Smith', 'david@example.com', hash],
      ['Ella Lopez', 'ella@example.com', hash],
      ['Demo User', 'demo@demo.com', hash], // <- login with secret123
    ];

    for (const u of users) {
      await client.query(UPSERT, u);
    }

    console.log('✅ Users seeded (demo@demo.com / secret123).');
  } catch (err) {
    console.error('Seed users failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
