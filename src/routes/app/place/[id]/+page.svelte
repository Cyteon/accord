<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
    import { Hash } from "lucide-svelte";
    import { browser } from "$app/environment";
    import state from "$lib/state.svelte";
    import type { PlaceType } from "$lib/models/Place.js";
    import type { ChannelType } from "$lib/models/Channel.js";

    export let data;
    $: getData(data.id);

    let place: PlaceType & {
        channels?: ChannelType[];
    } | null = null;

    async function getData(id: string) {
        if (state.places[id]) {
            // some temp data until load finished
            place = state.places[id];
        } 
        
        // check if it has all the other values, rn just channels
        if (browser && !place?.channels) {
            const res = await fetch(`/api/v1/places/${data.id}`, {
                headers: {
                    Authorization: `Bearer ${getCookie("token")}`,
                },
            });

            if (res.ok) {
                place = await res.json();

                // cause this may have some more data
                state.places[place?._id.toString()!] = place as any;
            } else {
                window.location.href = "/app";
            }
        }
    }
</script>

<div class="flex h-screen w-full">
    <SideBar />

    <div class="bg-ctp-mantle w-full max-w-48 border-r">
        <div class="px-5 py-2 border-b text-xl font-bold">
            <span class="my-auto truncate">{place?.name}</span>
        </div>

        {#each place?.channels! as channel}
            <div class="px-2 py-1 rounded-md mx-2 mt-2 hover:bg-ctp-surface0/25 transition-color duration-300">
                <a href={`/app/place/${data.id}/${channel._id}`} class="unique flex">
                    <Hash width={16} height={16} class="my-auto text-ctp-subtext0" />
                    <span class="mb-1 ml-1 text-lg truncate">{channel.name}</span>
                </a>
            </div> 
        {/each}
    </div>
</div>