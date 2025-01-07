<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
    import { Hash } from "lucide-svelte";
    import { browser } from "$app/environment";

    export let data;
    $: getData(data.id);

    let place = {};

    async function getData(id: string) {
        if (browser) {
            const res = await fetch(`/api/v1/places/${data.id}`, {
                headers: {
                    Authorization: `Bearer ${getCookie("token")}`,
                },
            });

            if (res.ok) {
                place = await res.json();
            } else {
                window.location.href = "/app";
            }
        }
    }
</script>

<div class="flex h-screen w-full">
    <SideBar />

    <div class="bg-ctp-mantle w-48">
        <div class="px-5 py-2 border-b border-b-ctp-surface0 text-xl font-bold">
            <span class="my-auto truncate">{place?.name}</span>
        </div>

        {#each place?.channels as channel}
            <div class="px-2 py-1 rounded-md mx-2 mt-2 hover:bg-ctp-surface0/25 transition-color duration-300">
                <a href={`/app/place/${data.id}/${channel._id}`} class="unique flex">
                    <Hash width={16} height={16} class="my-auto text-ctp-subtext0" />
                    <span class="mb-1 ml-1 text-lg truncate">{channel.name}</span>
                </a>
            </div> 
        {/each}
    </div>
</div>