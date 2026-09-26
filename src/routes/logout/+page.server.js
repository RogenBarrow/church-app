import { redirect } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
    default: async ({ locals }) => {
        await locals.supabase.auth.signOut();

        redirect (303, '/login');
    }
}