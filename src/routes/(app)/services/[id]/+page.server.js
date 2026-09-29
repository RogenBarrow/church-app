import { error } from '@sveltejs/kit';




/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, locals }) => {
        const { data: service, error: queryError } = await locals.supabase
                                                .from('services')
                                                .select(`
			id, title, service_date, theme, program_starts_at,
			service_assignments ( role_name, person_label, position ),
			service_sections (
				id, title, leader_label, position,
				service_items ( id, position, fixed_start, duration_min, action, who, sound, screen )
			)
		`)
                                                .eq('id', params.id)
                                                .order('position', { referencedTable: 'service_assignments' })
		                                        .order('position', { referencedTable: 'service_sections' })
		                                        .order('position', { referencedTable: 'service_sections.service_items' })
                                                .maybeSingle();

                if (queryError || !service ) {
                    error(404, 'Service not found' )
                }

                return { service }
}