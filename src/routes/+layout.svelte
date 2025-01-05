<script lang="ts">
	import '../app.css';
	import { getCookie } from 'typescript-cookie';
	import state from '$lib/state.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		let cookie = getCookie('token');

		if (cookie && state.user === null) {
			const res = await fetch('/api/v1/users/@me', {
				headers: {
					Authorization: `Bearer ${cookie}`,
				},
			});

			if (res.ok) {
				const data = await res.json();

				state.user = data.user;
			} else {
				if (window.location.pathname === '/app') {
					window.location.href = '/login';
				}
			}
		} else {
			if (window.location.pathname === '/app') {
				window.location.href = '/login';
			}
		}
	})
</script>

{@render children()}
