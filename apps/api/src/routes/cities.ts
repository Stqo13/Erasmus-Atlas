import { FastifyInstance } from 'fastify';
import { q } from '../db';

export default async function citiesRoutes(app: FastifyInstance) {
  app.get('/cities', async () => {
    const rows = await q(`
      SELECT id, name, country_iso2
      FROM cities
      ORDER BY name ASC
      LIMIT 200
    `);
    return { items: rows };
  });
}
