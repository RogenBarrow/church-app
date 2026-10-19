import { error } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';

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
			.insert({ service_id: params.id, title, leader_label: leader_label || null, position });
		if (insertError) {
			return fail(400, { message: insertError.message });
		}

		return { success: true };
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
			.order('position', { ascending: false })
			.eq('section_id', section_id)
			.limit(1)
			.maybeSingle();

		const position = (last?.position ?? 0) + 1;

		const { error: insertError } = await locals.supabase
			.from('service_items')
			.insert({
				section_id,
				action,
				position,
				who: formdata.get('who') || null,
				sound: formdata.get('sound') || null,
				screen: formdata.get('screen') || null,
				fixed_start: fixed_start || null,
				duration_min: duration ? Number(duration) : null
			});

		if (insertError) {
			return fail(400, { message: insertError.message });
		}

		return { success: true };
	},

	deleteItem: async ({ request, locals }) => {
		const formData = await request.formData();
		const item_id = formData.get('item_id');

		if (typeof item_id !== 'string' || !item_id) {
			return fail(400, { message: 'Item ID is missing' });
		}

		const { error: deleteError } = await locals.supabase
			.from('service_items')
			.delete()
			.eq('id', item_id);

		if (deleteError) {
			return fail(400, { message: deleteError.message });
		}

		return { success: true };
	},

	moveItem: async ({ request, locals }) => {
		const formData = await request.formData();
		const item_id = formData.get('item_id');
		const direction = formData.get('direction');

		if (typeof item_id !== 'string' || !item_id || (direction !== 'up' && direction !== 'down')) {
			return fail(400, { message: 'Invalid request' });
		}

		const { data: item } = await locals.supabase
			.from('service_items')
			.select('id, section_id, position')
			.eq('id', item_id)
			.single();

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
				.order('position', { ascending: false });
		} else {
			neighborQuery = neighborQuery
				.gt('position', item.position)
				.order('position', { ascending: true });
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
			return fail(400, { message: updateError.message });
		}

		return { success: true };
	},

	deleteSection: async ({ request, locals }) => {
		const formData = await request.formData();
		const section_id = formData.get('section_id');

		if (typeof section_id !== 'string' || !section_id) {
			return fail(400, { message: 'Section ID is missing' });
		}

		const { error: deleteSectionError } = await locals.supabase
			.from('service_sections')
			.delete()
			.eq('id', section_id);

		if (deleteSectionError) {
			return fail(400, { message: deleteSectionError.message });
		}

		return { success: true };
	},

	updateItem: async ({ request, locals }) => {
		const formdata = await request.formData();
		const item_id = formdata.get('item_id');
		const action = formdata.get('action');
		const duration = formdata.get('duration_min');
		const fixed_start = formdata.get('fixed_start');

		if (typeof item_id !== 'string' || !item_id || typeof action !== 'string' || !action) {
			return fail(400, { message: 'Action is required' });
		}

		const { error: updateError } = await locals.supabase
			.from('service_items')
			.update({
				action,
				duration_min: duration ? Number(duration) : null,
				fixed_start: fixed_start || null,
				who: formdata.get('who') || null,
				sound: formdata.get('sound') || null,
				screen: formdata.get('screen') || null
			})
			.eq('id', item_id);

		if (updateError) {
			return fail(400, { message: updateError.message });
		}

		return { success: true };
	},

	copy: async ({ request, locals, params }) => {
		const formdata = await request.formData();
		const new_date = formdata.get('new_date');

		if (typeof new_date !== 'string' || !new_date) {
			return fail(400, { message: 'Date is required' });
		}

		const { data: newId, error: copyError } = await locals.supabase.rpc('copy_service', {
			source_id: params.id,
			new_date,
			as_template: false
		});

		if (copyError) {
			return fail(400, { message: copyError.message });
		}

		return redirect(303, `/services/${newId}?copied=1`);
	},

	deleteService: async ({ locals, params }) => {
		const { data: deleted, error: deleteError } = await locals.supabase
			.from('services')
			.delete()
			.eq('id', params.id)
			.select('id');

		if (deleteError) {
			return fail(400, { message: deleteError.message });
		}

		if (deleted.length === 0) {
			return fail(403, { message: 'You are not allowed to delete this service' });
		}

		return redirect(303, '/services?deleted=1');
	},

	saveTemplate: async ({ request, locals, params }) => {
		const formdata = await request.formData();
		const title = formdata.get('title');

		if (typeof title !== 'string' || !title) {
			return fail(400, { message: 'Give the template a name' });
		}

		const { data: newId, error: copyError } = await locals.supabase.rpc('copy_service', {
			source_id: params.id,
			new_date: null,
			as_template: true,
			new_title: title
		});

		if (copyError) {
			return fail(400, { message: copyError.message });
		}

		return redirect(303, `/services/${newId}?template=1`);
	},

	updateDetails: async ({ request, locals, params }) => {
		const formdata = await request.formData();
		const title = formdata.get('title');
		const theme = formdata.get('theme');
		const service_date = formdata.get('service_date');
		const program_starts_at = formdata.get('program_starts_at');

		if (
			typeof title !== 'string' ||
			!title ||
			typeof program_starts_at !== 'string' ||
			!program_starts_at
		) {
			return fail(400, { message: 'Title and start time are required' });
		}

		const { error: queryError } = await locals.supabase
			.from('services')
			.update({
				title,
				theme: theme || null,
				service_date: service_date || null,
				program_starts_at
			})
			.eq('id', params.id);

		if (queryError) {
			return fail(400, { message: queryError.message });
		}

		const ids = formdata.getAll('assignment_id');
		const profileIds = formdata.getAll('profile_id').map(String);
		const labels = formdata.getAll('person_label');

		const chosen = profileIds.filter((id) => id);
		const { data: chosenMembers } = await locals.supabase
			.from('profiles')
			.select('id, full_name')
			.in('id', chosen);

		/** @type {Record<string, string>} */
		const nameById = {};
		for (const m of chosenMembers ?? []) nameById[m.id] = m.full_name ?? '';

		for (let i = 0; i < ids.length; i++) {
			const profile_id = profileIds[i] || null;

			const { error: assignmentsError } = await locals.supabase
				.from('service_assignments')
				.update({
					profile_id,
					person_label: profile_id ? nameById[profile_id] : labels[i] || null
				})
				.eq('id', ids[i]);

			if (assignmentsError) {
				return fail(400, { message: assignmentsError.message });
			}
		}

		return { success: true };
	},

	approve: async ({ locals, params }) => {
		const { data: updated, error: approveError } = await locals.supabase
			.from('services')
			.update({ status: 'approved' })
			.eq('id', params.id)
			.select('id');

		if (approveError) {
			return fail(400, { message: approveError.message });
		}

		if (updated.length === 0) {
			return fail(403, { message: 'Only pastors can approve a service' });
		}

		return { success: true };
	},

	unapprove: async ({ locals, params }) => {
		const { data: updated, error: approveError } = await locals.supabase
			.from('services')
			.update({ status: 'draft' })
			.eq('id', params.id)
			.select('id');

		if (approveError) {
			return fail(400, { message: approveError.message });
		}

		if (updated.length === 0) {
			return fail(403, { message: 'Only pastors can unapprove a service' });
		}

		return { success: true };
	}
};

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals, parent }) => {
	const { service, profile } = await parent();

	// Members only see the program, so they don't need any of this
	if (profile?.role !== 'pastor') {
		return { members: [], unavailableIds: [] };
	}

	const { data: members, error: membersError } = await locals.supabase
		.from('profiles')
		.select('id, full_name')
		.order('full_name');

	if (membersError) {
		error(500, { message: membersError.message });
	}

	if (!service.service_date) {
		return { members: members ?? [], unavailableIds: [] };
	}

	const { data: blocks, error: blocksError } = await locals.supabase
		.from('availability_blocks')
		.select('profile_id')
		.lte('starts_on', service.service_date)
		.gte('ends_on', service.service_date);

	if (blocksError) {
		error(500, { message: blocksError.message });
	}

	return {
		members: members ?? [],
		unavailableIds: (blocks ?? []).map((b) => b.profile_id)
	};
};
