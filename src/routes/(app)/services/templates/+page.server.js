import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	const { data: templates, error: queryError } = await locals.supabase
		.from('services')
		.select('id, title')
		.eq('is_template', true)
		.order('title');

	if (queryError) {
		return error(500, { message: 'Could not load templates' });
	}

	return { templates };
};
