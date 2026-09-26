/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals }) => {
    const { user } = await locals.safeGetSession()

    return { user }
}