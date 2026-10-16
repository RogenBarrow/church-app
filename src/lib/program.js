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
 * @returns {Record<string, { start: number, end: number, overlap: boolean }>}   item id → its times
 */
export function computeSchedule(programStartsAt, sections) {
	/** @type {Record<string, { start: number, end: number, overlap: boolean }>} */
	const times = {};

	// The "cursor": where the next item will start if it has no fixed time
	let cursor = toMinutes(programStartsAt);

	for (const section of sections) {
		for (const item of section.service_items) {
            const start = item.fixed_start ? toMinutes(item.fixed_start) : cursor;
            const end = start + (item.duration_min ?? 0);
			times[item.id] = { start, end, overlap: start < cursor };
			cursor = end;
		}
	}

	return times;
}

/**
 * 225 → "3h 45m"
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins}m`;
}

/**
 * The end of the program: the latest end of any item,
 * or the program start if there are no items.
 * @param {number} programStart
 * @param {Record<string, { end: number }>} schedule
 * @returns {number}
 */
export function computeProgramEnd(programStart, schedule) {
	return Math.max(programStart, ...Object.values(schedule).map((t) => t.end));
}


