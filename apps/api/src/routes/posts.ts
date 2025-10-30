import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { q } from '../db';
import { verify } from '../auth';

export default async function postsRoutes(app: FastifyInstance) {
  app.get('/posts', async (req) => {
    const schema = z.object({
      minLng: z.coerce.number().optional(),
      minLat: z.coerce.number().optional(),
      maxLng: z.coerce.number().optional(),
      maxLat: z.coerce.number().optional(),
      limit: z.coerce.number().min(1).max(200).default(50),
      offset: z.coerce.number().min(0).default(0),
    });

    const s = schema.parse(req.query);

    const rows = await q(
      `
      SELECT id,
             title,
             body,
             COALESCE(ST_X(geom), NULL)::float AS lng,
             COALESCE(ST_Y(geom), NULL)::float AS lat,
             created_at
      FROM posts
      WHERE ($1::float IS NULL OR geom && ST_MakeEnvelope($1,$2,$3,$4,4326))
      ORDER BY created_at DESC
      LIMIT $5 OFFSET $6
      `,
      [
        s.minLng ?? null,
        s.minLat ?? null,
        s.maxLng ?? null,
        s.maxLat ?? null,
        s.limit,
        s.offset,
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
    });

    let b;
    try {
      b = schema.parse(req.body);
    } catch (err: any) {
      return rep.code(400).send({ error: err?.issues?.[0]?.message || 'Invalid body' });
    }

    // auth
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

    const hasCoords = typeof b.lat === 'number' && typeof b.lng === 'number';
    const cityId = b.cityId ?? null;

    try {
      let rows;
      if (hasCoords) {
        rows = await q(
          `
          INSERT INTO posts (user_id, title, body, geom, city_id, status, created_at)
          VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4,$5),4326), $6, 'PUBLISHED', now())
          RETURNING id
          `,
          [userId, b.title, b.body, b.lng, b.lat, cityId]
        );
      } else {
        rows = await q(
          `
          INSERT INTO posts (user_id, title, body, geom, city_id, status, created_at)
          VALUES ($1, $2, $3, NULL, $4, 'PUBLISHED', now())
          RETURNING id
          `,
          [userId, b.title, b.body, cityId]
        );
      }

      return { id: rows[0].id };
    } catch (err: any) {
      req.log.error({ err }, 'post_create_failed');
      return rep.code(500).send({ error: err?.message || 'Failed to create post' });
    }
  });
}
