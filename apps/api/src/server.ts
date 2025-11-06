import './env';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import health from './routes/health';
import citiesRoutes from './routes/cities';
import analyticsRoutes from './routes/analytics'

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, 
    { origin: ['http://localhost:5173'], 
      methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization'],
      credentials: true
    });
    
  await app.register(authRoutes);
  await app.register(postsRoutes);
  await app.register(health);
  await app.register(citiesRoutes);
  await app.register(analyticsRoutes, { prefix: '/analytics' })

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
