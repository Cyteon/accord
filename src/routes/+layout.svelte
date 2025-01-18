<script lang="ts">
	import '../app.css';
	import { getCookie } from 'typescript-cookie';
	import state from '$lib/state.svelte';
	import { onMount } from 'svelte';
  	import type { PlaceType } from '$lib/models/Place';
  import { RelationStatus } from '$lib/models/Relation';

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
				
				data.places.map((place: PlaceType) => {
					state.places[place._id.toString()] = place;
				});

				state.relations.pendingIn = data.friendReqs.filter((request) => request.status === RelationStatus.PENDING && request.targetId === state.user._id);
				state.relations.pendingOut = data.friendReqs.filter((request) => request.status === RelationStatus.PENDING && request.userId === state.user._id);
				state.relations.friends = data.friends;
			} else {
				if (window.location.pathname.startsWith("/app")) {
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
