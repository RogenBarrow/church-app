import { error, fail } from '@sveltejs/kit';
import { format } from 'prettier';




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
		

        if (typeof title !== 'string' || !title) {
			return fail(400, {
				title: typeof title === 'string' ? title : '',
				message: 'Title cannot be empty'
			});
        }

        const { data: last } = await locals.supabase
	            .from('service_sections')
	            .select('position')
	            .eq('service_id', params.id)
	            .order('position', { ascending: false })   
	            .limit(1)                                  
	            .maybeSingle(); 

        const position = (last?.position ?? 0) + 1;

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
        

        if (typeof section_id !== 'string' || !section_id || typeof action !== 'string' || !action) {
            return fail(400, { message: 'Action is required' });
        }


        const { data: last } = await locals.supabase
                                .from('service_items')
                                .select('position')
                                .order('position', { ascending: false } )
                                .eq('section_id', section_id)
                                .limit(1)
                                .maybeSingle();

        const position = (last?.position ?? 0) + 1;

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

    moveItem: async ({ request, locals }) => {
        const formData = await request.formData();
        const item_id = formData.get('item_id');
        const direction = formData.get('direction')

        if (typeof item_id !== 'string' || !item_id || direction !== 'up' && direction !== 'down'  ) {
            return fail(400, { message: 'Invalid request' })
        }
        
        const { data: item } = await locals.supabase
                                .from('service_items').
                                select('id, section_id, position')
                                .eq('id', item_id)
                                .single()

        if (!item) {
            return fail(404, { message: 'Item not found' });
        }

        let neighborQuery = locals.supabase
                        .from('service_items')
                        .select('id, position')
                        .eq('section_id', item.section_id);

        if (direction === 'up') {
            neighborQuery = neighborQuery
                        .lt('position', item.position)
                        .order('position', { ascending: false })
        } else {
            neighborQuery = neighborQuery
                        .gt('position', item.position)
                        .order('position', { ascending: true })
        }

        const { data: neighbour } = await neighborQuery.limit(1).maybeSingle();

        if (!neighbour) {
            return { success: true };
        }

        const { error: firstError } = await locals.supabase
	                            .from('service_items')
	                            .update({ position: neighbour.position })
	                            .eq('id', item.id);

const { error: secondError } = await locals.supabase
	                            .from('service_items')
	                            .update({ position: item.position })
	                            .eq('id', neighbour.id);

const updateError = firstError ?? secondError;
if (updateError) {
    return fail(400, { message: updateError.message })
}

return { success: true };


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

    updateItem: async ({ request, locals}) => {
        const formdata = await request.formData();
	    const item_id = formdata.get('item_id');
        const action = formdata.get('action');
        const duration = formdata.get('duration_min');
        const fixed_start = formdata.get('fixed_start');

        if (typeof item_id !== 'string' || !item_id || typeof action !== 'string' || !action) {
            return fail(400, { message: 'Action is required' })
        }

        const { error: updateError } = await locals.supabase.from('service_items').update({ action, duration_min: duration ? Number(duration) : null, 
            fixed_start: fixed_start || null,
            who: formdata.get('who') || null,
            sound: formdata.get('sound') || null,
            screen: formdata.get('screen') || null,
             }).eq('id', item_id)

        if (updateError) {
            return fail(400, { message: updateError.message })
        }

        return { success: true }
        
    }



}

