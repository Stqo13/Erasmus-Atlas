// db/seeds/seed_large.cjs
const { faker } = require('@faker-js/faker');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const TOPICS = ['Food', 'Nightlife', 'Housing', 'Academics', 'Safety', 'Costs', 'Travel'];
const TOTAL = 1500;
const PCT_NO_GEOM = 0.08;  // some posts without geom on purpose
const BATCH = 200;

function pickTopics() {
  const n = faker.number.int({ min: 1, max: 2 });
  const set = new Set();
  while (set.size < n) set.add(faker.helpers.arrayElement(TOPICS));
  return Array.from(set);
}

function jitter(lat, lng) {
  const dLat = faker.number.float({ min: -0.0025, max: 0.0025 });
  const dLng = faker.number.float({ min: -0.0025, max: 0.0025 });
  return { lat: lat + dLat, lng: lng + dLng };
}

(async () => {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    // need at least one user
    const u = await pool.query('SELECT id FROM users ORDER BY created_at DESC LIMIT 1');
    if (u.rowCount === 0) {
      console.error('No users found. Please create/seed a user first.');
      process.exit(1);
    }
    const userId = u.rows[0].id;

    // load cities with centroid
    const citiesRes = await pool.query(`
      SELECT id,
             COALESCE(ST_Y(centroid), NULL)::double precision AS lat,
             COALESCE(ST_X(centroid), NULL)::double precision AS lng
      FROM cities
      WHERE centroid IS NOT NULL
      ORDER BY random()
      LIMIT 500
    `);
    const cities = citiesRes.rows;
    if (!cities.length) {
      console.error('No cities with centroids found. Run seed_cities first.');
      process.exit(1);
    }

    // build posts in memory
    const posts = [];
    for (let i = 0; i < TOTAL; i++) {
      const city = faker.helpers.arrayElement(cities);
      const title = faker.helpers.arrayElement([
        'First impressions',
        'Best places to eat',
        'Housing tips',
        'Nightlife recap',
        'Campus life',
        'Cost breakdown',
        'Weekend trips',
      ]);
      const body = faker.lorem.sentences(faker.number.int({ min: 2, max: 5 }));
      const topics = pickTopics();

      let lat = null, lng = null;
      const noGeom = Math.random() < PCT_NO_GEOM || city.lat == null || city.lng == null;
      if (!noGeom) {
        const j = jitter(city.lat, city.lng);
        lat = j.lat;
        lng = j.lng;
      }

      posts.push({
        user_id: userId,
        title,
        body,
        lat, lng,
        city_id: city.id,
        topics, // text[]
      });
    }

    console.log(`Inserting ${posts.length} posts in batches of ${BATCH}...`);
    for (let i = 0; i < posts.length; i += BATCH) {
      const slice = posts.slice(i, i + BATCH);

      // Row shape:
      // ($1::uuid, $2::text, $3::text,
      //  CASE WHEN $4::double precision IS NULL OR $5::double precision IS NULL
      //       THEN NULL
      //       ELSE ST_SetSRID(ST_MakePoint($5::double precision, $4::double precision), 4326)
      //  END,
      //  $6::uuid, $7::text[], 'PUBLISHED'::post_status, now())
      const values = [];
      const params = [];
      let p = 1;

      for (const r of slice) {
        values.push(
          `($${p}::uuid, $${p + 1}::text, $${p + 2}::text,
             CASE
               WHEN $${p + 3}::double precision IS NULL OR $${p + 4}::double precision IS NULL
               THEN NULL
               ELSE ST_SetSRID(ST_MakePoint($${p + 4}::double precision, $${p + 3}::double precision), 4326)
             END,
             $${p + 5}::uuid, $${p + 6}::text[], 'PUBLISHED'::post_status, now())`
        );
        params.push(
          r.user_id,      // p
          r.title,        // p+1
          r.body,         // p+2
          r.lat,          // p+3
          r.lng,          // p+4
          r.city_id,      // p+5
          r.topics        // p+6
        );
        p += 7; // note: 7 (no status param anymore)
      }

      const sql = `
        INSERT INTO posts
          (user_id, title, body, geom, city_id, topics, status, created_at)
        VALUES
          ${values.join(',')}
      `;
      await pool.query(sql, params);
      console.log(`Inserted ${Math.min(i + BATCH, posts.length)}/${posts.length}`);
    }

    console.log('✅ Large seed complete.');
    await pool.end();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
