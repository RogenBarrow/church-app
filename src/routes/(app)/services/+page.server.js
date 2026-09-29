import { error } from '@sveltejs/kit';


/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {

const today = new Date().toISOString().slice( 0, 10 );

const { data: services, error: queryError } = await locals.supabase
                        .from('services')
                        .select('id, title, service_date, theme')
                        .eq('is_template', false)
                        .gte('service_date', today)
                        .order('service_date')
    if (queryError) {
        error(500, { message: 'Data is not available' })
    }

return { services }


}