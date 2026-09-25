import { fail, redirect } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	login: async ({ request, locals }) => {
		const formdata = await request.formData();
		const email = formdata.get('email');
		const password = formdata.get('password');

		if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
			return fail(400, {
				email: typeof email === 'string' ? email : '',
				message: 'Email i kontraseña ta rekerí'
			});
		}

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
		if (error) {
			return fail(400, { email, message: error.message });
		}
		redirect(303, '/');
	},

	signup: async ({ request, locals }) => {
		const formdata = await request.formData();
		const email = formdata.get('email');
		const password = formdata.get('password');

		if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
			return fail(400, {
				email: typeof email === 'string' ? email : '',
				message: 'Email i kontraseña ta rekerí'
			});
		}

		const { error } = await locals.supabase.auth.signUp({ email, password });
		if (error) {
			return fail(400, { email, message: error.message });
		}
		redirect(303, '/');
	}
};
