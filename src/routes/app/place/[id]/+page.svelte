<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
    import { Hash, Plus } from "lucide-svelte";
    import { browser } from "$app/environment";
    import state from "$lib/state.svelte";
    import type { PlaceType } from "$lib/models/Place.js";
    import type { ChannelType } from "$lib/models/Channel.js";

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
            } else {
                window.location.href = "/app";
            }
        }
    }

    async function generateCode() {
        if (inviteCode && inviteCode.maxUses == inviteMaxUses) {
            return;
        }

        const res = await fetch(`/api/v1/places/${data.id}/invites`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getCookie("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                maxUses: inviteMaxUses,
            }),
        });

        if (res.ok) {
            inviteCode = await res.json();
        } else {
            const err = await res.json();
            inviteCode = {
                code: err.error,
                maxUses: -2, // conflict = so it dosent return at start if this where to be same as inviteMaxUses
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
        }
    }
</script>

<div class="flex h-screen w-full">
    <SideBar />

    <div class="bg-ctp-mantle w-full max-w-48 border-r">
        <div class="relative">
            <button class="px-5 py-2 border-b text-xl font-bold hover:bg-ctp-surface0/25 transition-color duration-300 w-full text-left" onclick={() => showServerDropDown = !showServerDropDown}>
                <span class="block my-auto truncate">{place?.name}</span>
            </button>

            <div class="absolute w-full">
                <div class={`${showServerDropDown ? "block" : "hidden"} bg-ctp-crust border rounded-md m-2 p-1`}>
                    <button class="scb text-ctp-yellow" onclick={() => showInviteModal = true}>
                        <span class="my-auto">Create Invite</span>
                    </button>
                </div>
            </div>
        </div>

        {#if place?.ownerId == state.user?._id}
            <button class="px-2 mt-2 flex w-full" onclick={() => showCreateChannelModal = true}>
                Create channel
                <Plus class="size-fit ml-auto" />
            </button>
        {/if}

        {#each place?.channels! as channel}
            <div class="px-2 py-1 rounded-md mx-2 mt-2 hover:bg-ctp-surface0/25 transition-color duration-300">
                <a href={`/app/place/${data.id}/${channel._id}`} class="unique flex">
                    <Hash width={16} height={16} class="my-auto text-ctp-subtext0" />
                    <span class="mb-0.5 ml-1 text-lg truncate">{channel.name}</span>
                </a>
            </div> 
        {/each}
    </div>

    {#if showInviteModal}
        <div class="flex absolute w-full h-full bg-ctp-mantle/50" onclick={() => showInviteModal = false}>
            <div class="border p-4 bg-ctp-mantle m-auto rounded-md text-left" onclick={e => e.stopPropagation()}>
                <h1 class="text-3xl font-bold">Create Invite!</h1>
                <label for="inviteMaxUses" class="block my-2 text-lg">Max Uses (-1 = unlimited)</label>
                <input type="number" min={-1} id="inviteMaxUses" bind:value={inviteMaxUses} class="" />

                <button class="mt-2 bg-ctp-yellow text-ctp-crust w-full p-2 rounded-md" onclick={() => generateCode()}>
                    <span class="my-auto">Generate</span>
                </button>

                {#if inviteCode}
                    <p class="border p-2 bg-ctp-crust mt-2 rounded-md">
                        {inviteCode.code}
                    </p>
                {/if}
            </div>
        </div>
    {/if}

    {#if showCreateChannelModal}
        <div class="flex absolute w-full h-full bg-ctp-mantle/50" onclick={() => showCreateChannelModal = false}>
            <div class="border p-4 bg-ctp-mantle m-auto rounded-md text-left" onclick={e => e.stopPropagation()}>
                <h1 class="text-3xl font-bold">Create Channel :P</h1>
                <label for="channelName" class="block my-2 text-lg">Channel Name</label>
                <input id="channelName" bind:value={channelName} onkeydown={e => e.key == "Enter" && createChannel()} />

                <button class="mt-2 bg-ctp-yellow text-ctp-crust w-full p-2 rounded-md" onclick={() => createChannel()}>
                    <span class="my-auto">Create</span>
                </button>
            </div>
        </div>
    {/if}
</div>