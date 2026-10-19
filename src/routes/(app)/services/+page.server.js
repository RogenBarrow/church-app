import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals, url }) => {
	const today = new Date().toISOString().slice(0, 10);
	const past = url.searchParams.has('past');

	let query = locals.supabase
		.from('services')
		.select('id, title, service_date, theme, status')
		.eq('is_template', false);

	if (past) {
		query = query.lt('service_date', today).order('service_date', { ascending: false });
	} else {
		query = query.gte('service_date', today).order('service_date');
	}

	const { data: services, error: queryError } = await query;

	if (queryError) {
		error(500, { message: 'Data is not available' });
	}

	return { services, past };
};
