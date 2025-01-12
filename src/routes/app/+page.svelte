<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { PersonStanding } from "lucide-svelte";

    let currentView = "friends";
    let currentFriendView = "online";
</script>

<div class="flex h-screen w-full">
    <SideBar />

    <div class="p-2 bg-ctp-mantle border-r w-[14.1rem]">
        <!--
        <button 
            class={`change-view-btn ${currentView === "friends" ? "bg-ctp-surface0/25" : "hover:bg-ctp-surface0/20"}`}
            on:click={() => currentView = "friends"}
        >
            <PersonStanding class="w-8 h-8" />
            <span class="my-auto">Friends</span>
        </button>
        -->
    </div>

    <div class="w-full h-full flex flex-col">
        <!--
        {#if currentView === "friends"}
            <div class="bg-ctp-mantle w-full h-fit border-b p-2 flex">
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
        {/if}
        -->

        <div class="text-center mt-4 flex flex-col h-full">
            <div class="my-auto">
                <h2 class="text-6xl font-bold">Welcome to Accord!</h2>
                <p class="text-2xl">Get started by heading to a server and going into a channel</p>
                <div class="mt-4">
                    <a href="https://github.com/cyteon/accord" target="_blank" class="text-lg">View the source code</a>
                </div>
            </div>
        </div>
    </div>
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