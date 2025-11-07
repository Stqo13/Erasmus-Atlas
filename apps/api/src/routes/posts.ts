  import { FastifyInstance } from 'fastify';
  import { z } from 'zod';
  import { q } from '../db';
  import { verify } from '../auth';

  function getUserId(req: any) {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) throw new Error('401')
    try { return (verify(auth.slice(7)) as any).sub as string } catch { throw new Error('401') }
  }

  export default async function postsRoutes(app: FastifyInstance) {

    app.get('/posts', async (req) => {
    const s = z.object({
      minLng: z.coerce.number().optional(),
      minLat: z.coerce.number().optional(),
      maxLng: z.coerce.number().optional(),
      maxLat: z.coerce.number().optional(),
      limit: z.coerce.number().min(1).max(500).default(200),
      topic: z.string().optional(), 
    }).parse(req.query);

  const rows = await q(
    `
    WITH filtered AS (
      SELECT
        id, title, body, topics,
        COALESCE(ST_X(geom), NULL)::float AS lng,
        COALESCE(ST_Y(geom), NULL)::float AS lat,
        city_id, created_at
      FROM posts
      WHERE ($1::float IS NULL OR geom && ST_MakeEnvelope($1,$2,$3,$4,4326))
        AND (
          $6::text IS NULL
          OR $6 = ANY(COALESCE(topics, ARRAY[]::text[]))
        )
    )
    SELECT
      round(lat::numeric, 4) AS lat,
      round(lng::numeric, 4) AS lng,
      json_agg(
        json_build_object(
          'id', id,
          'title', title,
          'body', body,
          'topics', topics,
          'city_id', city_id,
          'created_at', created_at
        )
        ORDER BY created_at DESC
      ) AS posts
    FROM filtered
    WHERE lat IS NOT NULL AND lng IS NOT NULL
    GROUP BY round(lat::numeric, 4), round(lng::numeric, 4)
    LIMIT $5
    `,
    [
      s.minLng ?? null,
      s.minLat ?? null,
      s.maxLng ?? null,
      s.maxLat ?? null,
      s.limit,
      s.topic ?? null,
    ]
  );

    return { items: rows };
    });

    app.post('/posts', async (req, rep) => {
      const schema = z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        lat: z.number().optional(),
        lng: z.number().optional(),
        cityId: z.string().uuid().optional(),
        cityName: z.string().optional(),
        countryIso2: z.string().length(2).optional(),
        topics: z.array(z.string()).default([]),
        topic: z.string().optional(), // legacy single-topic support
      });

    // 1) validate
    let b: z.infer<typeof schema>;
    try {
      b = schema.parse(req.body);
    } catch (err: any) {
      return rep.code(400).send({ error: err?.issues?.[0]?.message || 'Invalid body' });
    }

    // 2) auth
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return rep.code(401).send({ error: 'Missing token' });
    let userId: string;
    try {
      const payload = verify(auth.slice(7)) as any; // your verify util
      userId = payload.sub as string;
    } catch {
      return rep.code(401).send({ error: 'Invalid token' });
    }

    // 3) resolve city id if provided as name+country
    let cityId: string | null = b.cityId ?? null;
    if (!cityId && b.cityName && b.countryIso2) {
      const cityRows = await q<{ id: string }>(
        `SELECT id FROM cities WHERE LOWER(name)=LOWER($1) AND country_iso2=$2 LIMIT 1`,
        [b.cityName, b.countryIso2.toUpperCase()]
      );
    if (!cityRows.length) return rep.code(400).send({ error: 'City not found for that country' });
    cityId = cityRows[0].id;
    }

    // 4) normalize topics (support legacy 'topic')
    const topicsArray: string[] = Array.isArray(b.topics) && b.topics.length
      ? b.topics
      : b.topic ? [b.topic] : [];

    try {
      // Build dynamic INSERT safely
      const cols: string[] = ['user_id', 'title', 'body', 'topics', 'status', 'created_at'];
      const vals: string[] = ['$1', '$2', '$3', '$4::text[]', `'PUBLISHED'`, 'now()'];
      const params: any[] = [userId, b.title, b.body, topicsArray];

     // Optional geom (prefer explicit lat/lng if provided)
      if (typeof b.lat === 'number' && typeof b.lng === 'number') {
        cols.push('geom');
        vals.push(`ST_SetSRID(ST_MakePoint($${params.length + 1}::double precision, $${params.length + 2}::double precision),4326)`);
        params.push(b.lng, b.lat); // note: lng, lat order
      } else if (cityId) {
        // use city centroid as geom
        cols.push('geom');
        vals.push(`(SELECT centroid FROM cities WHERE id = $${params.length + 1})`);
        params.push(cityId);
      }

      // Optional city_id
      if (cityId) {
        cols.push('city_id');
        vals.push(`$${params.length + 1}::uuid`);
        params.push(cityId);
      }

      const sql = `
        INSERT INTO posts (${cols.join(', ')})
        VALUES (${vals.join(', ')})
        RETURNING id
      `;

      const rows = await q<{ id: string }>(sql, params);
      return rep.send({ id: rows[0].id });
    } catch (err: any) {
      req.log.error({ err }, 'post_create_failed');
      return rep.code(500).send({ error: err?.message || 'Failed to create post' });
    }
    });

    app.get('/me/posts', async (req, rep) => {
    let userId: string
    try { userId = getUserId(req) } catch { return rep.code(401).send({ error: 'Unauthorized' }) }

    const qp = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    }).parse(req.query)

    const offset = (qp.page - 1) * qp.limit
    const items = await q<any>(`
      SELECT p.id, p.title, p.body, p.topics, p.status, p.created_at, p.city_id,
             COALESCE(ST_Y(p.geom), NULL)::double precision AS lat,
             COALESCE(ST_X(p.geom), NULL)::double precision AS lng,
             c.name AS city_name, c.country_iso2
      FROM posts p
      LEFT JOIN cities c ON c.id = p.city_id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, qp.limit, offset])

    const [{ count }] = await q<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM posts WHERE user_id = $1`, [userId]
    )

    return { items, page: qp.page, limit: qp.limit, total: Number(count) }
    });

    app.get('/me/posts/:id', async (req, rep) => {
    let userId: string
    try { userId = getUserId(req) } catch { return rep.code(401).send({ error: 'Unauthorized' }) }
    const id = (req.params as any).id as string

    const rows = await q<any>(`
      SELECT p.id, p.title, p.body, p.topics, p.status, p.created_at, p.city_id,
             COALESCE(ST_Y(p.geom), NULL)::double precision AS lat,
             COALESCE(ST_X(p.geom), NULL)::double precision AS lng
      FROM posts p
      WHERE p.id = $1 AND p.user_id = $2
      LIMIT 1
    `, [id, userId])

    if (!rows.length) return rep.code(404).send({ error: 'Post not found' })
    return rows[0]
    });

    app.post('/posts/:id/edit', async (req, rep) => {
      let userId: string
      try { userId = getUserId(req) } catch { return rep.code(401).send({ error: 'Unauthorized' }) }
      const id = (req.params as any).id as string

      const bodySchema = z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        topics: z.array(z.string()).default([]),
        cityId: z.string().uuid().nullable().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        status: z.enum(['PUBLISHED','DRAFT']).optional(),
      })
    const b = bodySchema.parse(req.body)

      const own = await q<{ id: string }>(
        `SELECT id FROM posts WHERE id = $1 AND user_id = $2`, [id, userId]
      )
      if (!own.length) return rep.code(404).send({ error: 'Post not found' })

      const sets: string[] = []
      const params: any[] = []
      let p = 1
      const add = (col: string, val: any, cast?: string) => {
        if (val === undefined) return
        if (val === null && cast) { sets.push(`${col} = NULL`); return }
        if (cast) sets.push(`${col} = $${p}::${cast}`); else sets.push(`${col} = $${p}`)
        params.push(val); p++
      }

      add('title', b.title)
      add('body', b.body)
      add('topics', b.topics, 'text[]')
      if (b.status) add('status', b.status)
      if (b.cityId === null) sets.push('city_id = NULL')
      else if (typeof b.cityId === 'string') add('city_id', b.cityId, 'uuid')

      if (typeof b.lat === 'number' && typeof b.lng === 'number') {
       sets.push(`geom = ST_SetSRID(ST_MakePoint($${p}::double precision, $${p+1}::double precision),4326)`)
       params.push(b.lng, b.lat); p += 2
      }

      const sql = `UPDATE posts SET ${sets.join(', ')} WHERE id = $${p} AND user_id = $${p+1} RETURNING id`
      params.push(id, userId)

      const rows = await q<{ id: string }>(sql, params)
      if (!rows.length) return rep.code(400).send({ error: 'Nothing updated' })
      return { id: rows[0].id }
    });
    
    app.post('/posts/:id/delete', async (req, rep) => {
    let userId: string
    try { userId = getUserId(req) } catch { return rep.code(401).send({ error: 'Unauthorized' }) }
    const id = (req.params as any).id as string

    const rows = await q<{ id: string }>(
      `DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]
    )
    if (!rows.length) return rep.code(404).send({ error: 'Post not found' })
    return { ok: true }
    });
}
