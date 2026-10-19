import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ url, locals }) => {
	const token_hash = url.searchParams.get('token_hash');
	const nextParam = url.searchParams.get('next') ?? '/';
	const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';
	const type = /** @type {import('@supabase/supabase-js').EmailOtpType | null} */ (
		url.searchParams.get('type')
	);

	if (token_hash && type) {
		const { error } = await locals.supabase.auth.verifyOtp({ token_hash, type });

		if (!error) {
			redirect(303, next);
		}
	}

	redirect(303, '/login?confirm_error=1');
};
