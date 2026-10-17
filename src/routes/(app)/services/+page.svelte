<script>
	import { page } from '$app/state';
    /** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

{#if page.url.searchParams.has('deleted')}
	<p class="rounded bg-green-100 px-3 py-2 text-green-800">
		✓ Service deleted.
	</p>
{/if}

<h1>{data.past ? 'Past services' : 'Upcoming services'}</h1>

{#if data.past }
<a href="/services">Show upcoming</a>

{:else}

<a href="/services?past=1">Show past services</a>

{/if}

<a href="/services/templates">Templates</a>



<ul>
{#each data.services as service }
    <li><a href="/services/{service.id}">{service.service_date} {service.theme ?? service.title}</a></li>
{:else}
	<li>{data.past ? 'No past services' : 'No upcoming services'}</li>

{/each}
</ul>

