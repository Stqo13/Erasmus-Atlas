const { Pool } = require('pg')

// ---- deterministic PRNG (mulberry32) ----
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(9090)

// ---- canonical topics ----
const TOPICS = ['Food', 'Nightlife', 'Housing', 'Academics', 'Safety', 'Costs', 'Travel']
const topicFor = (i) => TOPICS[i % TOPICS.length]

// ---- reusable sentence pools per topic (neutral English) ----
const SENTENCES = {
  Food: [
    'Local bakeries open early and pastries are affordable.',
    'Lunch specials near campus are great value for students.',
    'Most cafés accept cards and have quick service.',
    'Trying regional dishes was a highlight of my semester.',
    'Cafés around the library are laptop-friendly with outlets.',
  ],
  Nightlife: [
    'Student nights midweek are friendly and lively.',
    'Venues open late, so people head out after midnight.',
    'Riverside bars get busy but the atmosphere stays relaxed.',
    'Popular clubs can have lines during exam season.',
    'Live music spots often offer student pricing.',
  ],
  Housing: [
    'Flatshares are common and usually the best value.',
    'Deposits and contracts are standard; read terms carefully.',
    'Start looking 4–6 weeks ahead for decent options.',
    'University portals are safer than random listings.',
    'Check whether utilities are included to avoid surprises.',
  ],
  Academics: [
    'Professors are approachable and helpful to exchange students.',
    'Attendance and participation influence grades more than I expected.',
    'The grading system is clear but fairly strict.',
    'Group work is common and helps you meet locals.',
    'Campus Wi-Fi is fast and reliable, even outdoors.',
  ],
  Safety: [
    'The city feels safe with normal common-sense habits.',
    'Public transport is well-lit and monitored.',
    'Pickpocketing is uncommon, but keep your bag zipped in crowds.',
    'Police presence downtown is noticeable and reassuring.',
    'Cycling at night is fine if you use lights and main routes.',
  ],
  Costs: [
    'Groceries are cheapest at markets outside the tourist areas.',
    'Student transport passes save a lot each month.',
    'Cinema tickets have weekly student discounts.',
    'Rent is the biggest cost, so budget around it.',
    'Cooking at home stretches the Erasmus grant further.',
  ],
  Travel: [
    'Weekend trips by train are easy to plan.',
    'Flights to nearby countries are cheap if booked early.',
    'A day trip with friends is great for seeing the countryside.',
    'Public bike systems are dependable and easy to use.',
    'Stations are clean and trains generally run on time.',
  ],
}

// ---- landmark & university snippets per city (short, factual mentions) ----
const CITY_SNIPPETS = {
  // ES
  Madrid: [
    'I studied near Complutense University and often walked through Retiro Park between classes.',
    'Gran Vía is crowded but safe, and the Prado Museum is worth multiple visits.',
    'Hanging out around Plaza Mayor after lectures became a weekly habit.',
  ],
  Barcelona: [
    'Campus sessions near Universitat de Barcelona were central and convenient.',
    'Evening walks by La Sagrada Família felt surprisingly calm on weekdays.',
    'We met for group work around El Born and sometimes on Barceloneta beach.',
  ],
  Valencia: [
    'Classes near the City of Arts and Sciences made every commute scenic.',
    'The Turia Park bike paths are perfect for getting to campus.',
    'We used the university library close to the old town for quiet study.',
  ],
  Seville: [
    'The area around the University of Seville and the cathedral is lively but relaxed.',
    'Triana felt authentic and friendly after evening seminars.',
    'Plaza de España is an amazing spot to unwind after group meetings.',
  ],

  // IT
  Rome: [
    'Sapienza University’s campus is busy but well organized; Termini is a quick hop away.',
    'Study breaks at the Colosseum and the Roman Forum never got old.',
    'Trastevere has great spots for late group study and quick food.',
  ],
  Milan: [
    'Politecnico di Milano labs were modern and well equipped.',
    'The Duomo area is crowded but the metro makes it manageable.',
    'Navigli is great for meeting classmates and debriefing projects.',
  ],
  Bologna: [
    'The University of Bologna around Via Zamboni is full of student life.',
    'Porticoes keep you dry walking to lectures even on rainy days.',
    'Piazza Maggiore was our go-to after presentations.',
  ],
  Florence: [
    'Study sessions near the University of Florence often ended by the Arno.',
    'The Duomo and Uffizi are close enough for quick culture breaks.',
    'Oltrarno cafés are calmer for reading days.',
  ],

  // FR
  Paris: [
    'Libraries near Sorbonne fill up fast before exams.',
    'Crossing the Seine after seminars at the Latin Quarter was a ritual.',
    'The Louvre area is busy, but Tuileries are great for a quiet pause.',
  ],
  Lyon: [
    'Université Lyon 2 had helpful orientation for exchange students.',
    'Vieux Lyon is lovely for late afternoon walks after tutorials.',
    'We met near Place Bellecour for group planning.',
  ],
  Bordeaux: [
    'Tram lines made it simple to reach campus and the riverfront.',
    'The historic center is calm, great after lab sessions.',
    'We studied near Place de la Bourse and grabbed food by the Garonne.',
  ],
  Toulouse: [
    'Université Toulouse Jean Jaurès had welcoming staff.',
    'Place Saint-Pierre is lively but felt safe in the evenings.',
    'Garonne riverside paths made bike commutes easy.',
  ],

  // DE
  Berlin: [
    'Humboldt University seminars were close to Museum Island.',
    'Alexanderplatz connections made commuting simple.',
    'Tempelhofer Feld became our favorite weekend hangout.',
  ],
  Munich: [
    'TUM’s study spaces were excellent during exam season.',
    'We often met near Marienplatz before heading to labs.',
    'The English Garden is ideal for clearing your head after classes.',
  ],
  Hamburg: [
    'The university is well connected by U-Bahn and S-Bahn.',
    'Alster paths are safe and perfect for an evening run.',
    'HafenCity is modern and quiet for group work sessions.',
  ],
  Heidelberg: [
    'Ruprecht-Karls-Universität has stunning historic buildings.',
    'Philosophenweg overlooks the city — perfect spot after lectures.',
    'The old town is calm and student-friendly.',
  ],

  // PT
  Lisbon: [
    'Universidade de Lisboa orientation was clear and concise.',
    'The tram to Alfama is scenic but crowded; metro is quicker to campus.',
    'Belém was our favorite weekend stroll after deadlines.',
  ],
  Porto: [
    'University of Porto buildings are walkable and well signed.',
    'Ribeira stays busy but felt comfortable after evening classes.',
    'Dom Luís I Bridge views are unbeatable after study days.',
  ],
  Coimbra: [
    'The University of Coimbra library is strict but inspiring.',
    'Hilly streets are great exercise on the way to lectures.',
    'Mondego riverside is peaceful for breaks between classes.',
  ],
  Braga: [
    'The campus is compact and easy to navigate.',
    'Bom Jesus do Monte is a popular weekend trip among students.',
    'The historic center is calm and friendly.',
  ],

  // NL
  Amsterdam: [
    'The UvA buildings around the canals are beautiful and practical.',
    'Cycling to class felt safe thanks to dedicated bike lanes.',
    'Vondelpark is perfect for a quick reset after long labs.',
  ],
  Utrecht: [
    'Utrecht Science Park is modern and well connected by tram.',
    'The old canals are relaxing to walk after tutorials.',
    'Bike parking near the stations is massive but well organized.',
  ],
  Groningen: [
    'The university area is compact and truly student-oriented.',
    'Biking everywhere was effortless and safe.',
    'Noorderplantsoen is a peaceful study escape.',
  ],
  Leiden: [
    'Leiden University facilities are close to the old canals.',
    'Everything is reachable by bike within minutes.',
    'The botanical garden is a great reading spot.',
  ],

  // PL
  'Warsaw': [
    'University of Warsaw buildings around Krakowskie Przedmieście are central.',
    'Łazienki Park is calm and ideal for study breaks.',
    'The metro makes cross-city commutes predictable.',
  ],
  'Kraków': [
    'Jagiellonian University is historic and well organized.',
    'The Main Square stays active but felt safe after classes.',
    'Along the Vistula we found great spots for group work.',
  ],
  'Gdańsk': [
    'The university tram lines are reliable.',
    'The old town is lively and welcoming.',
    'Walks by the Motława River helped reset after lectures.',
  ],
  'Wrocław': [
    'Campus buildings are spread out but easy by tram.',
    'Ostrów Tumski is beautiful for evening walks.',
    'Rynek is busy but comfortable after tutorials.',
  ],

  // CZ
  Prague: [
    'Charles University sites around the old town are inspiring.',
    'Trams are frequent and simple to navigate for classes.',
    'The Vltava riverside is peaceful after labs.',
  ],
  Brno: [
    'Masaryk University had an efficient Erasmus desk.',
    'The city center is compact and student-friendly.',
    'Špilberk Park is great for reading days.',
  ],
  Olomouc: [
    'Palacký University facilities are accessible and tidy.',
    'The old town squares are calm and inviting.',
    'Trams make it easy to get to seminars on time.',
  ],
  'Plzeň': [
    'University areas are well marked and connected by tram.',
    'The historical center is relaxed after classes.',
    'Parks around the city are safe and green.',
  ],

  // SE
  Stockholm: [
    'KTH and SU campuses are modern and bright.',
    'Waterfront paths feel safe even after dark.',
    'The metro and ferries made commuting enjoyable.',
  ],
  Gothenburg: [
    'Chalmers University labs were well equipped.',
    'Avenyn is lively but comfortable at night.',
    'Slottsskogen Park is perfect for a short mental break.',
  ],
  Lund: [
    'Lund University areas are truly bike-first.',
    'The old town streets are calm and charming.',
    'Campus libraries have plenty of quiet spaces.',
  ],
  Uppsala: [
    'Uppsala University traditions are a fun surprise.',
    'The river area is a favorite for reading outdoors.',
    'Biking around campus felt safe and simple.',
  ],

  // GR
  Athens: [
    'National and Kapodistrian University campuses are welcoming.',
    'The Acropolis area is busy but safe in the evening.',
    'Metro lines are handy for reaching lectures on time.',
  ],
  Thessaloniki: [
    'Aristotle University has friendly staff and modern halls.',
    'The waterfront promenade is great after seminars.',
    'Neighborhood cafés are perfect for group work.',
  ],
  Patras: [
    'The university is easy to reach by bus.',
    'Rio–Antirrio Bridge views are amazing on weekend trips.',
    'The old town is relaxed and student-oriented.',
  ],
  Heraklion: [
    'University of Crete facilities are straightforward and helpful.',
    'The Venetian harbor is nice for evening walks.',
    'City buses are reliable for getting to classes.',
  ],
}

// build a title for a topic/city (varied but deterministic)
function makeTitle(city, topic) {
  const bank = {
    Food: [
      `Eating like a local in ${city}`,
      `Student-friendly bites around ${city}`,
      `Budget lunches that actually taste good in ${city}`,
    ],
    Nightlife: [
      `Nightlife notes from ${city}`,
      `Where students go out in ${city}`,
      `Bars and late nights around ${city}`,
    ],
    Housing: [
      `My housing search in ${city}`,
      `Renting in ${city}: what I learned`,
      `Room hunting tips for ${city}`,
    ],
    Academics: [
      `Study rhythms on campus in ${city}`,
      `How classes work in ${city}`,
      `Academic life I found in ${city}`,
    ],
    Safety: [
      `How safe ${city} felt to me`,
      `Getting around ${city} safely`,
      `Safety impressions living in ${city}`,
    ],
    Costs: [
      `Real costs of living in ${city}`,
      `Monthly budget that worked in ${city}`,
      `Saving money as a student in ${city}`,
    ],
    Travel: [
      `Weekend trips from ${city}`,
      `Getting around ${city} without stress`,
      `My favorite day trip near ${city}`,
    ],
  }
  const arr = bank[topic]
  return arr[Math.floor(rand() * arr.length)]
}

function composeBody(topic, cityName, ci, k) {
  const pool = SENTENCES[topic]
  // pick 2–3 neutral topic sentences (deterministically)
  const a = pool[(ci + k) % pool.length]
  const b = pool[(ci * 3 + k) % pool.length]
  const c = pool[(ci + k * 2) % pool.length]
  const base = `${a} ${b !== a ? b : ''} ${c !== a && c !== b ? c : ''}`.trim()

  // append a city-specific snippet (rotate through list)
  const snippets = CITY_SNIPPETS[cityName] || []
  const addon = snippets.length ? ` ${snippets[(ci + k) % snippets.length]}` : ''
  return (base + addon).trim()
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  try {
    console.log('📝 Inserting 250 unique posts with local landmarks…')

    // ensure one user
    const u = await client.query('SELECT id FROM users ORDER BY created_at DESC LIMIT 1')
    let userId = u.rows[0]?.id
    if (!userId) {
      const ins = await client.query(`
        INSERT INTO users (name,email,created_at)
        VALUES ('Demo User','demo@example.com',now())
        RETURNING id
      `)
      userId = ins.rows[0].id
    }

    // get cities
    const { rows: cities } = await client.query(`
      SELECT id, name,
             COALESCE(ST_Y(centroid), NULL)::double precision AS lat,
             COALESCE(ST_X(centroid), NULL)::double precision AS lng
      FROM cities
      ORDER BY id
    `)
    if (!cities.length) throw new Error('No cities found. Run seed_hard_cities.cjs first.')

    // optional: clear posts
    // await client.query('TRUNCATE TABLE posts RESTART IDENTITY CASCADE;')

    // distribute exactly 250 across cities
    const N = cities.length
    const TOTAL = 250
    const base = Math.floor(TOTAL / N)
    let remainder = TOTAL - base * N

    let inserted = 0
    for (let ci = 0; ci < N; ci++) {
      const c = cities[ci]
      let count = base + (remainder > 0 ? 1 : 0)
      if (remainder > 0) remainder--

      for (let k = 0; k < count; k++) {
        const topic = topicFor(inserted)
        const title = makeTitle(c.name, topic)
        const body = composeBody(topic, c.name, ci, k)

        // spread over last ~150 days deterministically
        const dayOffset = Math.floor(rand() * 150)

        await client.query(
          `
          INSERT INTO posts
            (user_id, title, body, topics, geom, city_id, status, created_at)
          VALUES
            ($1, $2, $3, $4::text[],
             ST_SetSRID(ST_MakePoint($5::double precision, $6::double precision), 4326),
             $7, 'PUBLISHED', now() - ($8 || ' days')::interval
            )
          `,
          [userId, title, body, [topic], c.lng, c.lat, c.id, dayOffset]
        )
        inserted++
      }
    }

    console.log(`✅ Inserted ${inserted} posts across ${N} cities (expected 250).`)
  } finally {
    client.release()
    await pool.end()
  }
}

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL'); process.exit(1)
}
main().catch((e) => { console.error('Seed failed:', e); process.exit(1) })