// apps/api/src/routes/analytics.ts
import { FastifyInstance } from 'fastify'
import { q } from '../db'

export default async function analyticsRoutes(app: FastifyInstance) {
  // GET /analytics/overview
  app.get('/overview', async (req, reply) => {
    const { country } = (req.query as any) || {}

    const [{ total }] = await q<{ total: number }>(
      `
      SELECT COUNT(*)::int AS total
      FROM posts p
      ${country ? 'JOIN cities c ON c.id = p.city_id WHERE c.country_iso2 = $1' : ''}
      `,
      country ? [country] : []
    )

    const topics = await q<{ topic: string; count: number }>(
      `
      SELECT t AS topic, COUNT(*)::int AS count
      FROM (
        SELECT unnest(p.topics) AS t
        FROM posts p
        ${country ? 'JOIN cities c ON c.id = p.city_id WHERE c.country_iso2 = $1' : ''}
      ) sub
      GROUP BY t
      ORDER BY count DESC
      `,
      country ? [country] : []
    )

    const series = await q<{ month: string; count: number }>(
      `
      SELECT to_char(date_trunc('month', p.created_at), 'YYYY-MM') AS month,
             COUNT(*)::int AS count
      FROM posts p
      ${country ? 'JOIN cities c ON c.id = p.city_id WHERE c.country_iso2 = $1' : ''}
      GROUP BY 1
      ORDER BY 1
      `,
      country ? [country] : []
    )

    const insights = topics[0]?.topic
      ? [`${topics[0].topic} is currently the most active topic.`]
      : ['Add more posts to see trends.']

    return { total, topics, series, insights }
  })

  // GET /analytics/timeseries
  app.get('/timeseries', async (req, reply) => {
    const { country } = (req.query as any) || {}
    const points = await q<{ month: string; count: number }>(
      `
      SELECT to_char(date_trunc('month', p.created_at), 'YYYY-MM') AS month,
             COUNT(*)::int AS count
      FROM posts p
      ${country ? 'JOIN cities c ON c.id = p.city_id WHERE c.country_iso2 = $1' : ''}
      GROUP BY 1
      ORDER BY 1
      `,
      country ? [country] : []
    )
    return { points }
  })

  // GET /analytics/compare
  app.get('/compare', async (req, reply) => {
    const { left, right } = (req.query as any) || {}
    const one = async (iso?: string) =>
      iso
        ? (await q<{ count: number }>(
            `SELECT COUNT(*)::int AS count
             FROM posts p JOIN cities c ON c.id = p.city_id
             WHERE c.country_iso2 = $1`,
            [iso]
          ))[0]?.count ?? 0
        : 0
    return {
      metric: 'posts',
      left: { code: left, value: await one(left) },
      right: { code: right, value: await one(right) },
    }
  })
}