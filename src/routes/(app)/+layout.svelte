<script>
	import { page } from '$app/state';

	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();
</script>

<nav class="flex items-center gap-4 border-b px-4 py-3">
	<a href="/" class={{ 'font-bold': page.url.pathname === '/' }}>Home</a>
	{#if data.profile?.role === 'pastor'}
		<a href="/members" class={{ 'font-bold': page.url.pathname === '/members' }}>Members</a>
	{/if}
	<div class="ml-auto flex items-center gap-4">
		<p>{data.profile?.full_name ?? data.user?.email}</p>
		<a href="/profile" class={{ 'font-bold': page.url.pathname === '/profile' }}>My Profile</a>
		<form action="/logout" method="POST">
			<button>Logout</button>
		</form>
	</div>
</nav>

<main>
	{@render children()}
</main>
