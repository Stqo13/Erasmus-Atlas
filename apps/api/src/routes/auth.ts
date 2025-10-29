import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { q } from '../db';
import { hash, check, sign } from '../auth';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (req, rep) => {
    const body = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
    }).parse(req.body);

    const exists = await q('SELECT 1 FROM users WHERE email=$1', [body.email]);
    if (exists.length) return rep.code(409).send({ error: 'Email exists' });

    const rows = await q(
      'INSERT INTO users (name,email,password_hash,created_at) VALUES ($1,$2,$3,now()) RETURNING id,name,email',
      [body.name, body.email, await hash(body.password)]
    );
    const user = rows[0];
    const token = sign({ sub: user.id, email: user.email });
    return { token, user };
  });

  app.post('/auth/login', async (req, rep) => {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }).parse(req.body);

    const rows = await q('SELECT id,name,email,password_hash FROM users WHERE email=$1', [body.email]);
    if (!rows.length || !rows[0].password_hash || !(await check(body.password, rows[0].password_hash))) {
      return rep.code(401).send({ error: 'Invalid credentials' });
    }
    const u = rows[0];
    const token = sign({ sub: u.id, email: u.email });
    return { token, user: { id: u.id, name: u.name, email: u.email } };
  });
}
