import type { PoolConfig } from 'pg';

import pg from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';

import * as schema from '~~/db/schema';

const { Pool } = pg;

class DbConnect {
  static #instance: DbConnect;
  #database: NodePgDatabase<typeof schema>;
  #pool: pg.Pool;

  private constructor(config: PoolConfig = {}) {
    const defaultConfig: PoolConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      database: process.env.DB_NAME,
    };

    this.#pool = new Pool({ ...defaultConfig, ...config });
    this.#database = drizzle(this.#pool, { schema });
  }

  public static getInstance() {
    if (!DbConnect.#instance) {
      DbConnect.#instance = new DbConnect();
    }
    return DbConnect.#instance;
  }

  public static async drainPool() {
    await DbConnect.getInstance().#pool.end();
  }

  static get database() {
    return DbConnect.getInstance().#database;
  }
}

export const drainDbPool = DbConnect.drainPool;
export const useDatabase = () => DbConnect.database;

export const runDbMigrations = async () => {
  const client = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME,
  });
  await client.connect();
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: 'db/migrations' });
  await client.end();
}