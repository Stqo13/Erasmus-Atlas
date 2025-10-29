const { Client } = require('pg');

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randRange = (min, max) => Math.random() * (max - min) + min;

;(async () => {
  const conn =
    process.env.DATABASE_URL ||
    'postgres://postgres:Stefkowe%3A123@localhost:5432/erasmus_atlas';
  const client = new Client({ connectionString: conn });
  await client.connect();

  console.log('🌱 Starting realistic seed...');

  await client.query(`
    TRUNCATE TABLE posts, cities, users RESTART IDENTITY CASCADE;
  `);

  const users = [
    ['Alice Martin', 'alice@example.com'],
    ['Bob Rossi', 'bob@example.com'],
    ['Clara Müller', 'clara@example.com'],
    ['David Smith', 'david@example.com'],
    ['Ella Lopez', 'ella@example.com'],
  ];

  for (const [name, email] of users) {
    await client.query(
      `INSERT INTO users (name, email, created_at)
       VALUES ($1, $2, NOW()) ON CONFLICT (email) DO NOTHING;`,
      [name, email]
    );
  }

  const cities = [
    { name: 'Madrid', country: 'ES', lon: -3.70379, lat: 40.41678 },
    { name: 'Rome', country: 'IT', lon: 12.49637, lat: 41.90278 },
    { name: 'Paris', country: 'FR', lon: 2.35222, lat: 48.85661 },
    { name: 'Berlin', country: 'DE', lon: 13.4050, lat: 52.5200 },
  ];

  for (const city of cities) {
    await client.query(
      `INSERT INTO cities (name, country_iso2, centroid)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3,$4),4326))
       ON CONFLICT (name) DO NOTHING;`,
      [city.name, city.country, city.lon, city.lat]
    );
  }

  const categories = ['Food', 'Nightlife', 'Housing', 'Academics', 'Safety', 'Travel'];
  const titles = [
    'Best tapas spots',
    'Student nightlife report',
    'My Erasmus housing experience',
    'University life review',
    'Exploring local culture',
  ];
  const bodies = [
    'Really enjoyed this place during my Erasmus semester!',
    'Great experience overall, locals were very friendly.',
    'Some housing issues but resolved quickly by the agency.',
    'Nightlife here is amazing, lots of student events.',
    'Campus is modern and international students are well supported.',
  ];

  const { rows: userRows } = await client.query('SELECT id, name FROM users;');
  const { rows: cityRows } = await client.query('SELECT id, name, centroid FROM cities;');

  for (let i = 0; i < 20; i++) {
    const user = random(userRows);
    const city = random(cityRows);
    const title = random(titles);
    const body = random(bodies);
    const category = random(categories);

    const lon = randRange(-0.05, 0.05);
    const lat = randRange(-0.05, 0.05);
    await client.query(
      `INSERT INTO posts (user_id, title, body, topics, geom, city_id, status, created_at)
       VALUES ($1,$2,$3,$4,ST_Translate($5::geometry,$6,$7),$8,'PUBLISHED',NOW());`,
      [
        user.id,
        `${title} (${category})`,
        body,
        [category],
        city.centroid,
        lon,
        lat,
        city.id,
      ]
    );
  }

  console.log('✅ Seed completed:');
  console.log(`   → ${users.length} users`);
  console.log(`   → ${cities.length} cities`);
  console.log(`   → 20 posts`);

  await client.end();
})();
