import { error, fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	const today = new Date().toISOString().slice(0, 10);
    const { user } = await locals.safeGetSession();

    const { data: blocks, error: queryError} = await locals.supabase
                .from('availability_blocks')
                .select('id, starts_on, ends_on, note')
                .eq('profile_id', user?.id)
                .gte('ends_on',today)
                .order('starts_on')

    if (queryError) {
        return error(500, { message: queryError.message })
    }

    return { blocks }
};

/** @satisfies {import('./$types').Actions} */
export const actions = {
	add: async ({ request, locals }) => {
        const formdata = await request.formData();
	    const starts_on = formdata.get('starts_on');
	    const ends_on = formdata.get('ends_on');
	    const note = formdata.get('note');
		
        if (typeof starts_on !== 'string' || typeof ends_on !== 'string' || !starts_on|| !ends_on) {
			return fail(400, {
				message: 'Pick a start and an end date'
			});
		}
		
        if (ends_on < starts_on) {
            return fail(400, { message: 'The end date must be on or after the start date'})
        }

        const { error: insertError } = await locals.supabase
                .from('availability_blocks')
                .insert({starts_on, ends_on, note: note || null})

        if (insertError) {
            return fail(400, { message: insertError.message })
        }

        return { success: true }
	},

	delete: async ({ request, locals }) => {
	
        const formdata = await request.formData();
	    const block_id = formdata.get('block_id');

        if (typeof block_id !== 'string' || !block_id) {
			return fail(400, {
				message: 'The block id is invalid'
			});
		}

        const { error: deleteError } = await locals.supabase
            .from('availability_blocks')
            .delete()
            .eq('id', block_id)

        if (deleteError) {
            return fail(400, { message: deleteError.message})
        }

        return { success: true }

	}
};

