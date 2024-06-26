import type { PoolConfig } from 'pg';
import pg from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '~~/db/schema';

const { Pool } = pg;

interface DbConfig extends PoolConfig {
  migrationFolder: string;
}

class DbConnect {
  static #instance: DbConnect;
  #config: DbConfig;
  #database: NodePgDatabase<typeof schema>;
  #pool: pg.Pool;

  private constructor(config: Partial<DbConfig> = {}) {
    this.#config = this.#buildConfig(config);
    console.log('Database config:', this.#config);
    this.#pool = new Pool(this.#config);
    this.#database = drizzle(this.#pool, { schema });
  }

  #buildConfig(partialConfig: Partial<DbConfig>): DbConfig {
    const defaultConfig: DbConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      migrationFolder: 'db/migrations',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };

    return { ...defaultConfig, ...partialConfig };
  }

  public static getInstance(config?: Partial<DbConfig>) {
    if (!DbConnect.#instance) {
      DbConnect.#instance = new DbConnect(config);
    }
    return DbConnect.#instance;
  }

  public static async drainPool() {
    await DbConnect.getInstance().#pool.end();
  }

  static get database() {
    return DbConnect.getInstance().#database;
  }

  public async runMigrations() {
    try {
      const db = DbConnect.getInstance().#database;
      await migrate(db, { migrationsFolder: this.#config.migrationFolder });
    } catch (error: any) {
      console.error('Database migration failed:', error?.message || 'Unknown error');
      await drainDbPool();
      throw error;
    }
  }

}

export const drainDbPool = DbConnect.drainPool;
export const runDbMigrations = async () => {
  console.log('skipping migrations');
  // await DbConnect.getInstance().runMigrations();
};
export const useDatabase = () => DbConnect.database;