import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { q } from '../db';
import { verify } from '../auth';

export default async function postsRoutes(app: FastifyInstance) {

  app.get('/posts', async (req) => {
  const s = z.object({
    minLng: z.coerce.number().optional(),
    minLat: z.coerce.number().optional(),
    maxLng: z.coerce.number().optional(),
    maxLat: z.coerce.number().optional(),
    limit: z.coerce.number().min(1).max(500).default(200),
  }).parse(req.query);

  const rows = await q(
    `
    WITH filtered AS (
      SELECT
        id,
        title,
        body,
        topics,
        COALESCE(ST_X(geom), NULL)::float AS lng,
        COALESCE(ST_Y(geom), NULL)::float AS lat,
        city_id,
        created_at
      FROM posts
      WHERE ($1::float IS NULL OR geom && ST_MakeEnvelope($1,$2,$3,$4,4326))
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
    [s.minLng ?? null, s.minLat ?? null, s.maxLng ?? null, s.maxLat ?? null, s.limit]
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
      topic: z.string().optional(),
    });

    let b: z.infer<typeof schema>;
    try {
      b = schema.parse(req.body);
    } catch (err: any) {
      return rep.code(400).send({ error: err?.issues?.[0]?.message || 'Invalid body' });
    }

    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return rep.code(401).send({ error: 'Missing token' });
    }
    let userId: string;
    try {
      const payload = verify(auth.slice(7)) as any;
      userId = payload.sub as string;
    } catch {
      return rep.code(401).send({ error: 'Invalid token' });
    }

    let geomSql: string | null = null;
    let geomParams: any[] = [];
    let cityId: string | null = b.cityId ?? null;

    if (typeof b.lat === 'number' && typeof b.lng === 'number') {
      geomSql = 'ST_SetSRID(ST_MakePoint($geomLng,$geomLat),4326)';
      geomParams = [b.lng, b.lat];
    }
    else if (cityId) {
      const cityRows = await q<{ id: string; centroid: any }>(
        'SELECT id, centroid FROM cities WHERE id = $1',
        [cityId]
      );
      if (!cityRows.length) {
        return rep.code(400).send({ error: 'City not found' });
      }
      geomSql = '($cityCentroid)::geometry';
      geomParams = [cityRows[0].centroid];
    }
    else if (b.cityName && b.countryIso2) {
      const cityRows = await q<{ id: string; centroid: any }>(
        'SELECT id, centroid FROM cities WHERE LOWER(name) = LOWER($1) AND country_iso2 = $2 LIMIT 1',
        [b.cityName, b.countryIso2.toUpperCase()]
      );
      if (!cityRows.length) {
        return rep.code(400).send({ error: 'City not found for that country' });
      }
      cityId = cityRows[0].id;
      geomSql = '($cityCentroid)::geometry';
      geomParams = [cityRows[0].centroid];
    }

    const topicsArray = b.topic ? [b.topic] : [];


    try {
      let rows;
      if (geomSql) {
        rows = await q(
          `
          INSERT INTO posts (user_id, title, body, geom, city_id, topics, status, created_at)
          VALUES (
            $1, $2, $3,
            ${geomSql.replace('$geomLng', '$4').replace('$geomLat', '$5').replace('$cityCentroid', '$4')},
            $6,
            $7,
            'PUBLISHED',
            now()
          )
          RETURNING id
          `,
          geomParams.length === 2
            ? [userId, b.title, b.body, geomParams[0], geomParams[1], cityId, topicsArray]
            : [userId, b.title, b.body, geomParams[0], cityId, topicsArray]
        );
      } else {
        rows = await q(
          `
          INSERT INTO posts (user_id, title, body, geom, city_id, topics, status, created_at)
          VALUES ($1, $2, $3, NULL, $4, $5, 'PUBLISHED', now())
          RETURNING id
          `,
          [userId, b.title, b.body, cityId, topicsArray]
        );
      }

      return { id: rows[0].id };
    } catch (err: any) {
      req.log.error({ err }, 'post_create_failed');
      return rep.code(500).send({ error: err?.message || 'Failed to create post' });
    }
  });
}
