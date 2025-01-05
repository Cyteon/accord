<script lang="ts">
    import { Home, Cog } from "lucide-svelte";

    let showCreatePlaceModal = false;
</script>

<nav class="bg-ctp-crust p-2 flex flex-col">
    <a href="/app">
        <Home class="w-12 h-12" />
    </a>

    <span class="mx-1 mt-2 bg-ctp-base h-1 rounded-md"></span>

    <span class="mx-1 mb-2 mt-auto bg-ctp-base h-1 rounded-md"></span>

    <a href="/app/settings">
        <Cog class="w-12 h-12" />
    </a>
</nav>

<style>
    a, button {
        display: flex;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: all 300ms;

        @apply bg-ctp-mantle hover:text-ctp-blue;
    }
</style>