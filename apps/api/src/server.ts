import './env';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import health from './routes/health';
import citiesRoutes from './routes/cities';

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: ['http://localhost:5173'] });
  await app.register(authRoutes);
  await app.register(postsRoutes);
  await app.register(health);
  await app.register(citiesRoutes);

  const port = +(process.env.PORT || 8080);
  app.listen({ port }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`API listening at ${address}`);
  });
}

main();
