<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
    import { Hash, Plus } from "lucide-svelte";
    import { browser } from "$app/environment";
    import state from "$lib/state.svelte";
    import type { PlaceType } from "$lib/models/Place.js";
    import type { ChannelType } from "$lib/models/Channel.js";
  import PlaceDropdown from "$lib/components/PlaceDropdown.svelte";

    export let data;
    $: getData(data.id);

    let place: PlaceType & {
        channels?: ChannelType[];
    } | null = null;

    let showServerDropDown = false;

    let showInviteModal = false;
    let inviteMaxUses = -1;

    let showCreateChannelModal = false;
    let channelName = "";
    let createChannelError = "";

    let inviteCode: {
        code: String,
        maxUses: Number,
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

                inviteCode = null;
            } else {
                window.location.href = "/app";
            }
        }
    }

    async function createChannel() {
        const res = await fetch(`/api/v1/places/${data.id}/channels`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getCookie("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: channelName,
            }),
        });

        if (res.ok) {
            showCreateChannelModal = false;
            channelName = "";
            
            const json = await res.json();

            if (!place?.channels) {
                place.channels = [];
            }

            place?.channels?.push(json);
        } else {
            createChannelError = await res.text();

            if (createChannelError.length > 100) {
                createChannelError = "An error occurred while creating the channel.";
            }
        }
    }
</script>

<div class="flex h-screen w-full">
    <SideBar />

    <div class="bg-ctp-mantle w-full max-w-48 border-r">
        <PlaceDropdown {place} />

        {#if place?.ownerId == state.user?._id}
            <button class="px-2 mt-2 flex w-full" onclick={() => showCreateChannelModal = true}>
                Create channel
                <Plus class="size-fit ml-auto" />
            </button>
        {/if}

        <div class="overflow-y-auto h-[calc(100%-7rem)]">
            {#each place?.channels! as channel}
                <div class="px-2 py-1 rounded-md mx-2 mt-2 hover:bg-ctp-surface0/25 transition-color duration-300">
                    <a href={`/app/place/${data.id}/${channel._id}`} class="unique flex">
                        <Hash width={16} height={16} class="my-auto text-ctp-subtext0" />
                        <span class="mb-0.5 ml-1 text-lg truncate">{channel.name}</span>
                    </a>
                </div> 
            {/each}
        </div>
    </div>

    {#if showCreateChannelModal}
        <div class="flex absolute w-full h-full bg-ctp-mantle/50" onclick={() => showCreateChannelModal = false}>
            <div class="border p-4 bg-ctp-mantle m-auto rounded-md text-left" onclick={e => e.stopPropagation()}>
                <h1 class="text-3xl font-bold">Create Channel :P</h1>
                <label for="channelName" class="block my-2 text-lg">Channel Name</label>
                <input id="channelName" bind:value={channelName} onkeydown={e => e.key == "Enter" && createChannel()} />

                <p class="text-ctp-red mt-1 mb-2">{createChannelError}</p>

                <button class="bg-ctp-yellow text-ctp-crust w-full p-2 rounded-md" onclick={() => createChannel()}>
                    <span class="my-auto">Create</span>
                </button>
            </div>
        </div>
    {/if}
</div>