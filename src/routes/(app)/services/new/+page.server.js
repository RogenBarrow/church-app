import { redirect, fail, error } from '@sveltejs/kit';


/** @type {import('./$types').PageServerLoad} */
export const load = async ({ parent }) => {
        const { profile } = await parent();
        if ( profile?.role !== 'pastor' ) {
            error(403, { message: 'Only pastors has access'});
        }     
};

/** @satisfies {import('./$types').Actions} */
export const actions = {
    default: async ({ request, locals }) => {
        const formdata = await request.formData();

        const service_date = formdata.get('service_date');
        const theme = formdata.get('theme');
        const program_starts_at = formdata.get('program_starts_at');

        if (typeof service_date !== 'string' || typeof program_starts_at !== 'string' || !service_date || !program_starts_at) {
			return fail(400, {
				service_date: typeof service_date === 'string' ? service_date : '',
				message: 'Date and time is invalid'
			});
		}
        
        const { data: service, error: serviceError } = await locals.supabase
                                .from('services')
                                .insert({ service_date, theme: theme || null, program_starts_at})
                                .select('id')
                                .single();

        if (serviceError) {
            return fail(400, { message: serviceError.message })
        }


        const { error: assignmentsError } = await locals.supabase
                                .from('service_assignments')
                                .insert([{
                                    service_id: service.id,
                                    role_name: 'Service coordinator',
                                    person_label: formdata.get('coordinator') || null,
                                    position: 1
                                },
                                {
                                    service_id: service.id,
                                    role_name: 'Preacher',
                                    person_label: formdata.get('preacher') || null,
                                    position: 2
                                },
                                {
                                    service_id: service.id,
                                    role_name: 'Open church',
                                    person_label: formdata.get('open_church') || null,
                                    position: 3
                                },
                                {
                                    service_id: service.id,
                                    role_name: 'Close church',
                                    person_label: formdata.get('close_church') || null,
                                    position: 4
                                },
                            ])


        if (assignmentsError) {
            return fail(400, { message: 'Error inserting roles'})
        }

                    redirect(303, '/services');


    }
}