import type { PoolConfig } from 'pg';

import pg from 'pg';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';

import * as schema from '~~/db/schema';

const { Pool } = pg;

class DbConnect {
  private static instance: DbConnect;
  private database: NodePgDatabase<typeof schema>;

  private constructor(config: PoolConfig) {
    const defaultConfig: PoolConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      database: process.env.DB_NAME,
    };

    const pool = new Pool({ ...defaultConfig, ...config });

    this.database = drizzle(pool, { schema });
  }

  public static getInstance(name?: string) {
    if (!DbConnect.instance) {
      DbConnect.instance = new DbConnect({ database: name });
    }
    return DbConnect.instance.database;
  }
}

export const useDatabase = (name?: string) => DbConnect.getInstance(name);