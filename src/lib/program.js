/**
 * "08:30:00" (or "08:30") → 510
 * @param {string} time
 * @returns {number}
 */
export function toMinutes(time) {

    const [h, m] = time.split(':');
    const hours = Number(h);
    const minutes = Number(m);

    return hours * 60 + minutes;
}

/**
 * 510 → "08:30"
 * @param {number} minutes
 * @returns {string}
 */
export function formatMinutes(minutes) {
	
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculates start and end (in minutes) for every item.
 * @param {string} programStartsAt   e.g. "08:30:00"
 * @param {{ service_items: { id: string, fixed_start: string | null, duration_min: number | null }[] }[]} sections
 * @returns {Record<string, { start: number, end: number }>}   item id → its times
 */
export function computeSchedule(programStartsAt, sections) {
	/** @type {Record<string, { start: number, end: number }>} */
	const times = {};

	// The "cursor": where the next item will start if it has no fixed time
	let cursor = toMinutes(programStartsAt);

	for (const section of sections) {
		for (const item of section.service_items) {
            const start = item.fixed_start ? toMinutes(item.fixed_start) : cursor;
            const end = start + (item.duration_min ?? 0);
			times[item.id] = { start, end };
			cursor = end;
		}
	}

	return times;
}
