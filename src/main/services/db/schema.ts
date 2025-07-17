import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const transcriptions = sqliteTable('transcriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  timestamp: text('timestamp').default(sql`(datetime('now'))`),
  duration: integer('duration'), // in seconds
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export type Transcription = typeof transcriptions.$inferSelect;
export type NewTranscription = typeof transcriptions.$inferInsert;
