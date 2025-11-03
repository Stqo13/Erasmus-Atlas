const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const EUROPEAN_COUNTRIES = [
  ['ES', 'Spain'],
  ['FR', 'France'],
  ['IT', 'Italy'],
  ['DE', 'Germany'],
  ['NL', 'Netherlands'],
  ['PL', 'Poland'],
  ['PT', 'Portugal'],
  ['BE', 'Belgium'],
  ['CZ', 'Czech Republic'],
  ['HU', 'Hungary'],
  ['FI', 'Finland'],
  ['SE', 'Sweden'],
  ['NO', 'Norway'],
  ['RO', 'Romania'],
  ['BG', 'Bulgaria'],
  ['GR', 'Greece'],
  ['IE', 'Ireland'],
  ['AT', 'Austria'],
];

function randomCoords(countryIso2) {
  const ranges = {
    ES: [-9.3, 36, 3.3, 43],
    FR: [-5, 42, 8, 50],
    IT: [7, 37, 18, 46],
    DE: [6, 47, 15, 54],
    NL: [3, 51, 7, 53],
    PL: [14, 49, 24, 54],
    PT: [-9.5, 37, -6, 42],
    BE: [2.5, 49.5, 6.5, 51.5],
    CZ: [12, 48, 19, 51],
    HU: [16, 45, 23, 48],
    FI: [20, 59, 31, 70],
    SE: [11, 55, 23, 68],
    NO: [5, 58, 30, 71],
    RO: [20, 43, 29, 48],
    BG: [22, 41, 28, 44],
    GR: [20, 35, 28, 41],
    IE: [-10, 51, -6, 55],
    AT: [9, 46, 17, 49],
  };

  const [minLng, minLat, maxLng, maxLat] = ranges[countryIso2] || [-10, 35, 30, 70];
  const lat = faker.number.float({ min: minLat, max: maxLat });
  const lng = faker.number.float({ min: minLng, max: maxLng });
  return { lat, lng };
}

(async () => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    const total = 400;
    console.log(`🌍 Inserting ${total} cities...`);

    for (let i = 0; i < total; i++) {
      const [iso2] = faker.helpers.arrayElement(EUROPEAN_COUNTRIES);
      const name = faker.location.city();
      const { lat, lng } = randomCoords(iso2);

      // NOTE: only name, country_iso2, centroid (no country_name column)
      await pool.query(
        `
        INSERT INTO cities (name, country_iso2, centroid)
        VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3::double precision, $4::double precision), 4326))
        ON CONFLICT (name, country_iso2) DO UPDATE
        SET centroid = EXCLUDED.centroid
        `,[name, iso2, lng, lat]
    );

    }

    console.log('✅ Cities seed complete.');
    await pool.end();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
