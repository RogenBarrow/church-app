import { error, fail } from '@sveltejs/kit';




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

/** @satisfies {import('./$types').Actions} */
export const actions = {
    addSection: async ({ request, locals, params }) => {
        const formdata = await request.formData();
		const title = formdata.get('title');
		const leader_label = formdata.get('leader_label');
		const position = Number(formdata.get('position'));

        if (typeof title !== 'string' || !title) {
			return fail(400, {
				title: typeof title === 'string' ? title : '',
				message: 'Title cannot be empty'
			});
        }

        const { error: insertError } = await locals.supabase
                            .from('service_sections')
                            .insert({ service_id: params.id, title, leader_label: leader_label || null, position })
		if (insertError) {
            return fail(400, { message: insertError.message})
        }

        return { success: true }
    },

    addItem: async ({ request, locals }) => {
        const formdata = await request.formData();
        const section_id = formdata.get('section_id');
        const action = formdata.get('action');
        const duration = formdata.get('duration_min');
        const fixed_start = formdata.get('fixed_start');
        const position = Number(formdata.get('position'));

        if (typeof section_id !== 'string' || !section_id || typeof action !== 'string' || !action) {
            return fail(400, { message: 'Action is required' });
        }

        const { error: insertError } = await locals.supabase
                        .from('service_items')
                        .insert(
                            { section_id, action, position,
                                who: formdata.get('who') || null,
                                sound: formdata.get('sound') || null, 
                                screen: formdata.get('screen') || null, 
                                fixed_start: fixed_start || null,
                                duration_min: duration ? Number(duration) : null }
                        )
    
        if (insertError) {
            return fail(400, { message: insertError.message})
        }
    
        return { success: true }
    
    
    },

    deleteItem: async ({ request, locals }) => {
        const formData = await request.formData();
        const item_id = formData.get('item_id');

        if (typeof item_id !== 'string' || !item_id ) {
            return fail(400, { message: 'Item ID is missing' })
        }

    const { error: deleteError } =  await locals.supabase.from('service_items').delete().eq('id', item_id)

    if (deleteError) {
        return fail(400, { message: deleteError.message});
    }

    return { success: true }

    },

    deleteSection: async ({ request, locals }) => {
        const formData = await request.formData();
        const section_id = formData.get('section_id');

        if (typeof section_id !== 'string' || !section_id ) {
            return fail(400, { message: 'Section ID is missing' })
        }

    const { error: deleteSectionError } =  await locals.supabase.from('service_sections').delete().eq('id', section_id)

    if (deleteSectionError) {
        return fail(400, { message: deleteSectionError.message});
    }

    return { success: true }

    },

    



}

