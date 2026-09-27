import { fail } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals }) => {
		const formdata = await request.formData();
		const full_name = formdata.get('full_name');
		const phone = formdata.get('phone');

		if (typeof full_name !== 'string' || typeof phone !== 'string' || !full_name || !phone) {
			return fail(400, {
				full_name: typeof full_name === 'string' ? full_name : '',
				phone: typeof phone === 'string' ? phone : '',
				message: 'Try filling your information again'
			});
		}

		const { user } = await locals.safeGetSession();
		if (!user) {
			return fail(401, { message: 'user is not present' });
		}
		const { error } = await locals.supabase
			.from('profiles')
			.update({ full_name, phone })
			.eq('id', user.id);
		if (error) {
			return fail(400, { message: error.message });
		}
		return { success: true };
	}
};
