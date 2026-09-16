import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getBindings } from '#lib/server/bindings.js';
import { performanceMetrics } from '#lib/server/db/schema.js';

export const GET: RequestHandler = async (event) => {
	const db = getBindings() as unknown as { DB: D1Database };
	
	if (!db.DB) {
		return json({ error: 'Database unavailable' }, { status: 503 });
	}
	
	const { page, metric, limit } = event.params;
	const limitCount = Math.min(parseInt(limit || '50'), 1000);
	
	try {
		let query = db.DB.prepare(`
			SELECT pm.*, 
				COALESCE(u.country, 'unknown') as user_country,
				COALESCE(u.device_type, dap.device) as collected_device_type
			FROM performance_metrics pm
			LEFT JOIN users u ON pm.user_id = u.id
			WHERE 1=1
			${page ? `AND pm.page = '${page}'` : ''}
			${metric ? `AND pm.metric = '${metric}'` : ''}
			ORDER BY pm.createdAt DESC
			LIMIT ?
		`).bind(limitCount);
		
		const results = await query.all();
		
		return json({
			success: true,
			data: results.map(row => ({
				...row,
				pageSize: parseFloat(row.pageSize) || 0,
				loadTime: parseFloat(row.loadTime) || 0,
				sessionId: row.sessionId,
				userId: row.userId,
				country: row.country,
				deviceType: row.deviceType
			})),
			count: results.length,
			limit: limitCount
		});
	} catch (error) {
		return json({ error: 'Failed to fetch performance metrics', details: error }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const db = getBindings() as unknown as { DB: D1Database };
	
	if (!db.DB) {
		return json({ error: 'Database unavailable' }, { status: 503 });
	}
	
	let payload: any;
	try {
		payload = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
	
	const { 
		page, 
		metric, 
		value, 
		pageSize, 
		loadTime, 
		sessionId, 
		userId, 
		country, 
		deviceType 
	} = payload;
	
	// Validate inputs
	if (!page || !metric || typeof value !== 'number') {
		return json({ error: 'Missing required fields: page, metric, value' }, { status: 400 });
	}
	
	try {
		await db.DB.prepare(`
			INSERT INTO performance_metrics (
				page, metric, value, page_size_bytes, load_time_ms, 
				session_id, user_id, country, device_type
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			page,
			metric,
			value,
			pageSize || 0,
			loadTime || 0,
			sessionId,
			userId || null,
			country || null,
			deviceType || 'desktop'
		).run();
		
		return json({ success: true, data: { page, metric, value } });
	} catch (error) {
		return json({ error: 'Failed to save performance metric', details: error }, { status: 500 });
	}
};
