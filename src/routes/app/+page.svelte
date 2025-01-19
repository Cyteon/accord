<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { PersonStanding, X, Check } from "lucide-svelte";
    import { getCookie } from "typescript-cookie";
    import { RelationStatus } from "$lib/models/Relation";
    import state from "$lib/state.svelte";

    let currentView = "";
    let currentFriendView = "online";

    let addFriendError = "";
    let addFriendSuccess = "";
    let addFriendUsername = "";

    async function addFriend() {
        addFriendError = "";
        addFriendSuccess = "";

        const res = await fetch(`/api/v1/users/${addFriendUsername}/friend`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`
            }
        });

        if (res.ok) {
            const json = await res.json();
            
            if (json.status == RelationStatus.PENDING) {
                addFriendSuccess = "Friend request sent!";
                state.relations.pendingOut?.push(json);
            } else {
                addFriendSuccess = "Friend added!";
                state.relations.friends?.push(json);
            }
        } else {
            addFriendError = (await res.json()).error;

            if (addFriendError.length > 100) {
                addFriendError = "An error occurred while adding the friend.";
            }
        }
    }

    async function removeFriend(targetId: string) {
        const res = await fetch(`/api/v1/users/${targetId}/friend`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`
            }
        });

        if (res.ok) {
            state.relations.pendingIn = state.relations.pendingIn?.filter((relation) => relation.userId._id !== targetId);
            state.relations.pendingOut = state.relations.pendingOut?.filter((relation) => relation.targetId._id !== targetId);
            state.relations.friends = state.relations.friends?.filter((relation) => relation.targetId._id !== targetId);
        }
    }

    async function acceptFriendRequest(targetId: string) {
        const res = await fetch(`/api/v1/users/${targetId}/friend`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`
            }
        });

        if (res.ok) {
            state.relations.pendingIn = state.relations.pendingIn?.filter((relation) => relation.userId._id !== targetId);

            if (!state.relations.friends) {
                state.relations.friends = {};
            }

            state.relations.friends.push(await res.json());
        }
    }
</script>

<div class="flex h-screen w-full">
    <SideBar />

    <div class="p-2 bg-ctp-mantle border-r">
        <button 
            class={`change-view-btn ${currentView === "friends" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
            on:click={() => {
                if (currentView !== "friends") {
                    currentView = "friends";
                } else {
                    currentView = "";
                }
            }}
        >
            <PersonStanding class="w-8 h-8" />
            <span class="my-auto">Friends</span>
        </button>
    </div>

    <div class="w-full h-full flex flex-col">
        {#if currentView === "friends"}
            <div class="bg-ctp-mantle w-full h-fit border-b p-2 flex">
                <!--
                <button 
                    class={`change-view-btn-sm ${currentFriendView === "online" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
                    on:click={() => currentFriendView = "online"}
                >Online</button>
                -->

                <button 
                    class={`change-view-btn-sm ml-2 ${currentFriendView === "all" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
                    on:click={() => currentFriendView = "all"}
                >All</button>

                <button 
                    class={`change-view-btn-sm ml-2 ${currentFriendView === "requests" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
                    on:click={() => currentFriendView = "requests"}
                >Requests</button>

                <button 
                    class={`change-view-btn-sm text-ctp-green ml-2 ${currentFriendView === "add" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
                    on:click={() => currentFriendView = "add"}
                >Add Friend</button>
            </div>
            
            <div class="p-4">
                {#if currentFriendView === "online"}
                    <h1 class="text-3xl font-bold">Online Friends</h1>
                {:else if currentFriendView === "all"}
                    <h1 class="text-3xl font-bold">All Friends</h1>

                    {#each Object.values(state.relations.friends!) as relation}
                        <div class="flex mt-2">
                            <img src={relation.targetId.pfpUrl} class="w-14 h-14 rounded-full" />
                            <div class="ml-2 mt-[-2px]">
                                <h2 class="text-2xl font-bold">{relation.targetId.displayName}</h2>
                                <p>@{relation.targetId.username}</p>
                            </div>

                            <button class="hover:text-ctp-red ml-auto mr-2" on:click={() => removeFriend(relation.targetId._id)}>
                                <X class="w-8 h-8" />
                            </button>
                        </div>
                    {/each}
                {:else if currentFriendView === "requests"}
                    <h1 class="text-3xl font-bold">Friend Requests</h1>

                    <p class="mt-4">Incoming - {state.relations.pendingIn?.length}</p>
                    {#each Object.values(state.relations.pendingIn!) as relation}
                        <div class="flex mt-2">
                            <img src={relation.userId.pfpUrl} class="w-14 h-14 rounded-full" />
                            <div class="ml-2 mt-[-2px]">
                                <h2 class="text-2xl font-bold">{relation.userId.displayName}</h2>
                                <p>@{relation.userId.username}</p>
                            </div>

                            <button class="hover:text-ctp-red ml-auto mr-2" on:click={() => removeFriend(relation.userId._id)}>
                                <X class="w-8 h-8" />
                            </button>
                            <button class="hover:text-ctp-green" on:click={() => acceptFriendRequest(relation.userId._id)}>
                                <Check class="w-8 h-8" />
                            </button>
                        </div>
                    {/each}

                    <hr class="mt-3" />

                    <p class="mt-2">Outgoing - {state.relations.pendingOut?.length}</p>
                    {#each Object.values(state.relations.pendingOut!) as relation}
                        <div class="flex mt-2">
                            <img src={relation.targetId.pfpUrl} class="w-14 h-14 rounded-full" />
                            <div class="ml-2 mt-[-2px]">
                                <h2 class="text-2xl font-bold">{relation.targetId.displayName}</h2>
                                <p>@{relation.targetId.username}</p>
                            </div>

                            <button class="hover:text-ctp-red ml-auto" on:click={() => removeFriend(relation.targetId._id)}>
                                <X class="w-8 h-8" />
                            </button>
                        </div>
                    {/each}
                {:else if currentFriendView === "add"}
                    <h1 class="text-3xl font-bold">Add a Friend</h1>

                    <div class="mt-4">
                        <input type="text" class="w-full p-2 border" placeholder="Enter a username" bind:value={addFriendUsername} />
                        <p class="text-ctp-red mt-1">{addFriendError}</p>
                        <p class="text-ctp-green mt-1">{addFriendSuccess}</p>
                        <button 
                            class={`${addFriendUsername.length == 0 ? "bg-ctp-mantle" : "bg-ctp-green text-ctp-crust"} p-2 rounded-md w-full text-lg mt-1`} 
                            disabled={addFriendUsername.length == 0}
                            on:click={addFriend}
                        >
                            Add Friend
                        </button>
                    </div>
                {/if}
            </div>
        {:else}
            <div class="text-center mt-4 flex flex-col h-full">
                <div class="my-auto">
                    <h2 class="text-6xl font-bold">Welcome to Accord!</h2>
                    <p class="text-2xl">Get started by heading to a server and going into a channel</p>
                    <div class="mt-4">
                        <a href="https://github.com/cyteon/accord" target="_blank" class="text-lg">View the source code</a>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .change-view-btn {
        display: flex;
        padding: 0.5rem 2.25rem;
        font-size: 1.2rem;
        border-radius: 0.5rem;
    }

    .change-view-btn-sm {
        display: flex;
        padding: 0.25rem 0.8rem;
        font-size: 1rem;
        border-radius: 0.5rem;
    }
</style>