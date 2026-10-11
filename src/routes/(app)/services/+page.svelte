<script>
    /** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1>{data.past ? 'Past services' : 'Upcoming services'}</h1>

{#if data.past }
<a href="/services">Show upcoming</a>

{:else}

<a href="/services?past=1">Show past services</a>

{/if}



<ul>
{#each data.services as service }
    <li><a href="/services/{service.id}">{service.service_date} {service.theme ?? service.title}</a></li>
{:else}
	<li>{data.past ? 'No past services' : 'No upcoming services'}</li>

{/each}
</ul>

