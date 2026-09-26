<script>
    /** @type {import('./$types').PageProps} */
    let { data } = $props();
</script>


    {#if  data.user}
        <p>Welcome, { data.user.email }</p>
        <form action="/logout" method="POST">
        <button>Logout</button>
        </form>
        {:else}
        <a href="/login">Login</a>
    {/if}
