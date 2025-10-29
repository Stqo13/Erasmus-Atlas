
exports.up = (pgm) => {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS postgis;`);
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  // USERS
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true, unique: true },
    password_hash: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
        CREATE TYPE post_status AS ENUM ('PENDING','PUBLISHED','FLAGGED','REMOVED');
      END IF;
    END$$;
  `);

  pgm.createTable('cities', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'text', notNull: true, unique: true },
    country_iso2: { type: 'char(2)', notNull: true },
    centroid: { type: 'geometry(Point,4326)', notNull: true }
  });
  pgm.createIndex('cities', 'centroid', { method: 'gist' });

  pgm.createTable('posts', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true, references: '"users"(id)' },
    title: { type: 'text', notNull: true },
    body: { type: 'text', notNull: true },
    sentiment: { type: 'double precision' },
    topics: { type: 'text[]', notNull: true, default: '{}' },
    image_key: { type: 'text' },
    status: { type: 'post_status', notNull: true, default: 'PUBLISHED' },
    geom: { type: 'geometry(Point,4326)' },
    city_id: { type: 'uuid', references: '"cities"(id)' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });
  pgm.createIndex('posts', 'geom', { method: 'gist' });
  pgm.createIndex('posts', ['status', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropIndex('posts', ['status', 'created_at'], { ifExists: true });
  pgm.dropIndex('posts', 'geom', { ifExists: true });
  pgm.dropTable('posts', { ifExists: true });

  pgm.dropIndex('cities', 'centroid', { ifExists: true });
  pgm.dropTable('cities', { ifExists: true });

  pgm.dropTable('users', { ifExists: true });
};
