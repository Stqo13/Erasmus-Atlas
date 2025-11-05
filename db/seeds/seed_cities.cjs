// Deterministic set of real EU cities/towns. Coordinates are WGS84 (lat/lng).

const { Pool } = require('pg')

const CITIES = [
  // SPAIN (ES)
  { name: 'Madrid',        country_iso2: 'ES', lat: 40.4168, lng: -3.7038 },
  { name: 'Barcelona',     country_iso2: 'ES', lat: 41.3851, lng:  2.1734 },
  { name: 'Valencia',      country_iso2: 'ES', lat: 39.4699, lng: -0.3763 },
  { name: 'Seville',       country_iso2: 'ES', lat: 37.3891, lng: -5.9845 },

  // ITALY (IT)
  { name: 'Rome',          country_iso2: 'IT', lat: 41.9028, lng: 12.4964 },
  { name: 'Milan',         country_iso2: 'IT', lat: 45.4642, lng:  9.1900 },
  { name: 'Bologna',       country_iso2: 'IT', lat: 44.4949, lng: 11.3426 },
  { name: 'Florence',      country_iso2: 'IT', lat: 43.7696, lng: 11.2558 },

  // FRANCE (FR)
  { name: 'Paris',         country_iso2: 'FR', lat: 48.8566, lng:  2.3522 },
  { name: 'Lyon',          country_iso2: 'FR', lat: 45.7640, lng:  4.8357 },
  { name: 'Bordeaux',      country_iso2: 'FR', lat: 44.8378, lng: -0.5792 },
  { name: 'Toulouse',      country_iso2: 'FR', lat: 43.6047, lng:  1.4442 },

  // GERMANY (DE)
  { name: 'Berlin',        country_iso2: 'DE', lat: 52.5200, lng: 13.4050 },
  { name: 'Munich',        country_iso2: 'DE', lat: 48.1351, lng: 11.5820 },
  { name: 'Hamburg',       country_iso2: 'DE', lat: 53.5511, lng:  9.9937 },
  { name: 'Heidelberg',    country_iso2: 'DE', lat: 49.3988, lng:  8.6724 },

  // PORTUGAL (PT)
  { name: 'Lisbon',        country_iso2: 'PT', lat: 38.7223, lng: -9.1393 },
  { name: 'Porto',         country_iso2: 'PT', lat: 41.1579, lng: -8.6291 },
  { name: 'Coimbra',       country_iso2: 'PT', lat: 40.2033, lng: -8.4103 },
  { name: 'Braga',         country_iso2: 'PT', lat: 41.5454, lng: -8.4265 },

  // NETHERLANDS (NL)
  { name: 'Amsterdam',     country_iso2: 'NL', lat: 52.3676, lng:  4.9041 },
  { name: 'Utrecht',       country_iso2: 'NL', lat: 52.0907, lng:  5.1214 },
  { name: 'Groningen',     country_iso2: 'NL', lat: 53.2194, lng:  6.5665 },
  { name: 'Leiden',        country_iso2: 'NL', lat: 52.1601, lng:  4.4970 },

  // POLAND (PL)
  { name: 'Warsaw',        country_iso2: 'PL', lat: 52.2297, lng: 21.0122 },
  { name: 'Kraków',        country_iso2: 'PL', lat: 50.0647, lng: 19.9450 },
  { name: 'Gdańsk',        country_iso2: 'PL', lat: 54.3520, lng: 18.6466 },
  { name: 'Wrocław',       country_iso2: 'PL', lat: 51.1079, lng: 17.0385 },

  // CZECHIA (CZ)
  { name: 'Prague',        country_iso2: 'CZ', lat: 50.0755, lng: 14.4378 },
  { name: 'Brno',          country_iso2: 'CZ', lat: 49.1951, lng: 16.6068 },
  { name: 'Olomouc',       country_iso2: 'CZ', lat: 49.5938, lng: 17.2509 },
  { name: 'Plzeň',         country_iso2: 'CZ', lat: 49.7384, lng: 13.3736 },

  // SWEDEN (SE)
  { name: 'Stockholm',     country_iso2: 'SE', lat: 59.3293, lng: 18.0686 },
  { name: 'Gothenburg',    country_iso2: 'SE', lat: 57.7089, lng: 11.9746 },
  { name: 'Lund',          country_iso2: 'SE', lat: 55.7047, lng: 13.1910 },
  { name: 'Uppsala',       country_iso2: 'SE', lat: 59.8586, lng: 17.6389 },

  // GREECE (GR)
  { name: 'Athens',        country_iso2: 'GR', lat: 37.9838, lng: 23.7275 },
  { name: 'Thessaloniki',  country_iso2: 'GR', lat: 40.6401, lng: 22.9444 },
  { name: 'Patras',        country_iso2: 'GR', lat: 38.2466, lng: 21.7346 },
  { name: 'Heraklion',     country_iso2: 'GR', lat: 35.3387, lng: 25.1442 },
]

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()
  try {
    console.log('🌍 Inserting hard-coded cities…')

    // Optional reset:
    // await client.query('TRUNCATE TABLE cities RESTART IDENTITY CASCADE;')

    for (const c of CITIES) {
      await client.query(`
        INSERT INTO cities (name, country_iso2, centroid)
        VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3,$4),4326))
        ON CONFLICT (name, country_iso2) DO NOTHING;`
        ,[c.name, c.country_iso2, c.lng, c.lat]
      )
    }

    const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM cities;')
    console.log(`✅ Cities present: ${rows[0].n}`)
  } finally {
    client.release()
    await pool.end()
  }
}

if (!process.env.DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1) }
main().catch(e => { console.error('Seed failed:', e); process.exit(1) })