import { json, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const daps = pgTable('daps', {
  dbid: serial('dbid').primaryKey(),
  id: varchar('id', { length: 255 }).unique().notNull(),
  did: varchar('did', { length: 255 }).unique().notNull(),
  handle: varchar('handle', { length: 64 }).unique().notNull(),
  proof: json('proof').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});