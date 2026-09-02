/**
 * Basic HTML sanitization to strip dangerous elements and attributes.
 * For production-grade sanitization, consider using DOMPurify or a dedicated library.
 */
export function sanitizeHtml(html: string): string {
	if (!html) return '';
	// Strip script tags, event handlers, and dangerous attributes
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
		.replace(/on\w+="[^"]*"/gi, '')
		.replace(/on\w+='[^']*'/gi, '')
		.replace(/javascript:/gi, '')
		.replace(/data:text\/html/gi, '');
}
