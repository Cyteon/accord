<script lang="ts">
    import { Home, Cog, Plus } from "lucide-svelte";
    import state from "$lib/state.svelte"; 
    import { getCookie } from "typescript-cookie";

    let showCreatePlaceModal = false;
    let placeName = "";
    let inviteCode = "";
    let joinPlaceError = "";

    async function createPlace() {
        const res = await fetch("/api/v1/places", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify({ name: placeName }),
        });

        if (res.ok) {
            showCreatePlaceModal = false;
            placeName = "";

            const json = await res.json();

            state.places[json._id] = json;
        }
    }

    async function joinPlace() {
        joinPlaceError = "";

        const res = await fetch(`/api/v1/invites/${inviteCode}/accept`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            const json = await res.json();

            state.places[json._id] = json;
        } else {
            joinPlaceError = await res.text();

            if (joinPlaceError.length > 100) {
                joinPlaceError = "An error occurred while joining the place.";
            }
        }
    }
</script>

<nav class="bg-ctp-crust p-2 flex flex-col">
    <a href="/app">
        <Home class="size-full" />
    </a>

    <span class="mx-1 mt-2 bg-ctp-base h-1 rounded-md"></span>

    {#each Object.values(state.places) as place}
        <div class="group flex relative">
            <a class="unique" href={`/app/place/${place._id}`} aria-label={place.name}>
                <img src={place.iconUrl} alt="server-icon" class="rounded-md w-16 h-16 mt-2" />
            </a>

            <p 
                class="group-hover:visible invisible absolute left-full top-6 transform font-bold text-lg ml-4 bg-ctp-crust py-1 px-2 border border-ctp-surface0 rounded-md w-fit max-w-48 truncate"
            >{place.name}</p>
        </div>
    {/each}

    <button on:click={() => showCreatePlaceModal = true} class="my-2 text-ctp-yellow">
        <Plus class="size-full" />
    </button>

    <span class="mx-1 mb-2 mt-auto bg-ctp-base h-1 rounded-md"></span>

    <a href="/app/settings">
        <Cog class="size-full" />
    </a>
</nav>

{#if showCreatePlaceModal}
    <div class="absolute w-full h-screen bg-ctp-mantle/50 flex" on:click={() => showCreatePlaceModal = false}>
        <div class="bg-ctp-mantle m-auto p-6 rounded-md border border-ctp-surface0" on:click={e => e.stopPropagation()}>
            <h1 class="text-4xl font-bold">Create a new place</h1>
            <input type="text" placeholder="Place name" class="w-full p-2 my-4 bg-ctp-crust border border-ctp-surface0 rounded-md text-lg" bind:value={placeName} />
            <button on:click={createPlace} class="unique w-full mt-2 bg-ctp-yellow text-ctp-crust rounded-md p-2 text-lg">Create</button>

            <div class="flex mt-2 mb-1">
                <hr class="flex-1 my-auto border-2 border-ctp-surface0" />
                <h1 class="mx-2 text-ctp-subtext1 text-lg">or</h1>
                <hr class="flex-1 my-auto border-2 border-ctp-surface0" />
            </div>

            <h1 class="text-4xl font-bold">Join a place</h1>
            <input type="text" placeholder="Invite Code" class="w-full p-2 mt-4 bg-ctp-crust border border-ctp-surface0 rounded-md text-lg" bind:value={inviteCode} />
            <p class="text-ctp-red mb-1 mt-2">{joinPlaceError}</p>
            <button on:click={joinPlace} class="unique w-full mt-2 bg-ctp-yellow text-ctp-crust rounded-md p-2 text-lg">Join</button>
        </div>
    </div>
{/if}

<style>
    a:not(.unique), button:not(.unique) {
        display: flex;
        padding: .8rem;
        border-radius: 0.5rem;
        transition: all 300ms;
        width: 4rem;
        height: 4rem;

        @apply bg-ctp-mantle hover:text-ctp-blue;
    }
</style>