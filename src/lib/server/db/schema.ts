import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const media = sqliteTable('media', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	key: text('key').notNull().unique(),
	filename: text('filename').notNull(),
	contentType: text('content_type').notNull(),
	size: integer('size').notNull(),
	uploadedBy: text('uploaded_by').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

export * from './auth.schema';
