<script>
    /** @type {import('./$types').PageProps} */
    let { form } = $props();
</script>

<form method="POST" action="?/login">
<label for="email">Email</label>
<input type="email" name="email" id="email" value={form?.email ?? ''} required>
<label for="password">Password</label>
<input type="password" name="password" id="password" required>
{#if form?.message }
    <p class="text-red-600">Message: {form?.message}</p>
{/if}

<button>Login</button>
<button formaction="?/signup">Signup</button>
</form>