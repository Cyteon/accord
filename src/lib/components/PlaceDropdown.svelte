<script lang="ts">
    import { getCookie } from "typescript-cookie";
    import state_ from "$lib/state.svelte";

    let { place } = $props();

    let showServerDropDown = $state(false);

    let showInviteModal = $state(false);
    let inviteMaxUses = $state(-1);
    let inviteCode = $state(null);

    async function generateCode() {
        if (inviteCode && inviteCode.maxUses == inviteMaxUses) {
            return;
        }

        const res = await fetch(`/api/v1/places/${place._id}/invites`, {
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

    async function leaveServer() {
        const res = await fetch(`/api/v1/places/${place._id}/leave`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            delete state_.places[place._id];
            window.location.href = "/app";
        }
    }
</script>

<div class="relative">
    <button class="px-5 py-2 border-b text-xl font-bold hover:bg-ctp-surface0/25 transition-color duration-300 w-full text-left" onclick={() => showServerDropDown = !showServerDropDown}>
        <span class="block my-auto truncate">{place?.name}</span>
    </button>

    <div class="absolute w-full">
        <div class={`${showServerDropDown ? "block" : "hidden"} bg-ctp-crust border rounded-md m-2 p-1`}>
            <button class="scb text-ctp-yellow" onclick={() => showInviteModal = true}>
                <span class="my-auto">Create Invite</span>
            </button>

            {#if state_.user?._id != place?.ownerId}
                <button class="scb text-ctp-red" onclick={() => leaveServer()}>
                    <span class="my-auto">Leave Server</span>
                </button>
            {/if}
        </div>
    </div>
</div>

{#if showInviteModal}
    <div class="flex absolute top-0 left-0 w-full h-full bg-ctp-mantle/50" onclick={() => showInviteModal = false}>
        <div class="border p-4 bg-ctp-mantle m-auto rounded-md text-left" onclick={e => e.stopPropagation()}>
            <h1 class="text-3xl font-bold">Create Invite!</h1>
            <label for="inviteMaxUses" class="block my-2 text-lg">Max Uses (-1 = unlimited)</label>
            <input type="number" min={-1} id="inviteMaxUses" bind:value={inviteMaxUses} />

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