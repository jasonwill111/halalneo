import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getBindings } from '#lib/server/bindings.js';
import { costMetrics } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async (event) => {
	const db = getBindings() as unknown as { DB: D1Database };
	
	if (!db.DB) {
		return json({ error: 'Database unavailable' }, { status: 503 });
	}
	
	const { date: dateParam, limit: limitParam, resourceType } = event.params;
	const limit = Math.min(parseInt(limitParam || '30'), 90);
	
	try {
		let query = db.DB.prepare(`
			SELECT 
				date,
				printf('%0.2f', costUSD) as cost_usd_str,
				worker_requests,
				actor_requests,
				worker_duration,
				worker_minor_r2_ops,
				worker_major_r2_ops,
				d1_read_operations,
				d1_write_operations,
				d1_storage_bytes,
				time_in_ms,
				worker_united_state_requests
			FROM cost_metrics 
			WHERE date >= date('now', '-${limit} days')
			${resourceType ? `AND resource_type = '${resourceType}'` : ''}
			ORDER BY date DESC
			LIMIT 100
		`);
		
		const results = await query.all();
		
		return json({
			success: true,
			data: results.map(row => ({
				...row,
				cost_usd: parseFloat(row.cost_usd_str) || 0,
				date: row.date
			})),
			limit
		});
	} catch (error) {
		return json({ error: 'Failed to fetch cost metrics', details: error }, { status: 500 });
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
		date, 
		workerRequests, 
		workerDuration, 
		workerMinorR2Ops, 
		workerMajorR2Ops, 
		d1ReadOperations, 
		d1WriteOperations, 
		d1StorageBytes,
		costUSD,
		resourceType
	} = payload;
	
	const formattedDate = date || new Date().toISOString().slice(0, 10);
	
	try {
		// Check if record exists for the date
		const existing = await db.DB.prepare(`
			SELECT * FROM cost_metrics WHERE date = ?
		`).bind(formattedDate).first();
		
		if (existing) {
			// Update existing
			await db.DB.prepare(`
				UPDATE cost_metrics SET
					worker_requests = COALESCE(?, worker_requests),
					worker_duration = COALESCE(?, worker_duration),
					worker_minor_r2_ops = COALESCE(?, worker_minor_r2_ops),
					worker_major_r2_ops = COALESCE(?, worker_major_r2_ops),
					d1_read_operations = COALESCE(?, d1_read_operations),
					d1_write_operations = COALESCE(?, d1_write_operations),
					d1_storage_bytes = COALESCE(?, d1_storage_bytes),
					cost_usd = COALESCE(?, cost_usd),
					resource_type = COALESCE(?, resource_type),
					updated_at = CURRENT_TIMESTAMP
				WHERE date = ?
			`).bind(
				workerRequests,
				workerDuration,
				workerMinorR2Ops,
				workerMajorR2Ops,
				d1ReadOperations,
				d1WriteOperations,
				d1StorageBytes,
				costUSD,
				resourceType || 'cloudflare',
				formattedDate
			).run();
		} else {
			// Insert new
			await db.DB.prepare(`
				INSERT INTO cost_metrics (
					date, worker_requests, worker_duration, worker_minor_r2_ops, 
					worker_major_r2_ops, d1_read_operations, d1_write_operations, 
					d1_storage_bytes, cost_usd, resource_type
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`).bind(
				formattedDate,
				workerRequests,
				workerDuration,
				workerMinorR2Ops,
				workerMajorR2Ops,
				d1ReadOperations,
				d1WriteOperations,
				d1StorageBytes,
				costUSD,
				resourceType || 'cloudflare'
			).run();
		}
		
		return json({ success: true, date: formattedDate, action: existing ? 'updated' : 'created' });
	} catch (error) {
		return json({ error: 'Failed to save cost metrics', details: error }, { status: 500 });
	}
};
