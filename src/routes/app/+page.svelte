<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { PersonStanding } from "lucide-svelte";

    let currentView = "friends";
    let currentFriendView = "online";
</script>

<div class="flex h-screen w-full">
    <SideBar />

    <div class="p-2 bg-ctp-mantle">
        <button 
            class={`change-view-btn ${currentView === "friends" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
            on:click={() => currentView = "friends"}
        >
            <PersonStanding class="w-8 h-8" />
            <span class="my-auto">Friends</span>
        </button>
    </div>

    {#if currentView === "friends"}
        <div class="w-full">
            <div class="bg-ctp-mantle w-full p-2 flex">
                <button 
                    class={`change-view-btn-sm ${currentFriendView === "online" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
                    on:click={() => currentFriendView = "online"}
                >Online</button>

                <button 
                    class={`change-view-btn-sm ml-2 ${currentFriendView === "all" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
                    on:click={() => currentFriendView = "all"}
                >All</button>

                <button 
                    class={`change-view-btn-sm ml-2 ${currentFriendView === "pending" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
                    on:click={() => currentFriendView = "pending"}
                >Pending</button>

                <button 
                    class={`change-view-btn-sm text-ctp-green ml-2 ${currentFriendView === "add" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
                    on:click={() => currentFriendView = "add"}
                >Add Friend</button>
            </div>
        </div>
    {/if}
</div>

<style>
    .change-view-btn {
        display: flex;
        transition: all 300ms;
        padding: 0.5rem 2rem;
        font-size: 1.2rem;
        border-radius: 0.5rem;
    }

    .change-view-btn-sm {
        display: flex;
        transition: all 300ms;
        padding: 0.25rem 0.8rem;
        font-size: 1rem;
        border-radius: 0.5rem;
    }
</style>