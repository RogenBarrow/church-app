<script>
	import { page } from '$app/state';

	/** @type {import('./$types').PageProps} */
	let { form } = $props();
</script>

{#if page.url.searchParams.has('confirm_error')}
	<p class="text-red-600">
		That confirmation link is invalid or has expired. Please sign up again or log in.
	</p>
{/if}

<form method="POST" action="?/login">
	<label for="email">Email</label>
	<input type="email" name="email" id="email" value={form?.email ?? ''} required />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" required />
	{#if form?.message}
		<p class={form?.success ? 'text-green-700' : 'text-red-600'}>{form.message}</p>
	{/if}


	<button>Login</button>
	<button formaction="?/signup">Signup</button>
</form>
