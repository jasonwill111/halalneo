const BASE = 'http://127.0.0.1:4174';
async function dump(path) {
	const res = await fetch(BASE + path);
	console.log(`\n=== ${path} → ${res.status} ===`);
	if (res.status === 200) {
		const t = await res.text();
		console.log(t.slice(0, 300));
	} else {
		const t = await res.text();
		// find error detail
		const m = t.match(/"error"[:\s]*"([^"]{0,500})/);
		if (m) console.log('error:', m[1]);
		else console.log(t.slice(0, 800));
	}
}
const path = process.argv[2];
dump(path);
