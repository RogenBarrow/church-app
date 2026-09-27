import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals, parent }) => {
	const { user } = await parent();

	if (!user) {
		return redirect(303, '/login');
	}

	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('full_name, role, phone')
		.eq('id', user.id)
		.single();

	return { profile };
};
