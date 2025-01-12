<script lang="ts">
    import { ExternalLink, Copyright, CircleDollarSign, Megaphone, Code } from "lucide-svelte";
    import state from "$lib/state.svelte";

    let getStartedHovered = false;

    const features = [
        {
            title: "Open Source",
            description: "Licensed under the AGPL-3.0",
            icon: Copyright
        },
        {
            title: "100% Free",
            description: "We wont ask for a cent",
            icon: CircleDollarSign
        },
        {
            title: "Privacy",
            description: "We dont sell your data to meanies (or anyone)",
            icon: Megaphone
        },
        {
            title: "WIP",
            description: "New features are being added all the time",
            icon: Code
        }
    ]
</script>

<div class="flex flex-col h-screen w-full">
    <div class="text-center w-full mt-2">
        <h1 class="bg-gradient-to-r text-transparent bg-clip-text from-ctp-yellow to-ctp-green from-20% font-bold text-8xl">Accord</h1>
        <p class="text-xl mt-2 mb-5">It's time to ditch Discord and Slack</p>

        <a 
            href={state.user ? "/app" : "/register"}
            class="unique w-fit mx-auto flex bg-ctp-yellow text-xl text-ctp-crust py-2 px-3 rounded-md"
            on:mouseenter={() => getStartedHovered = true} on:mouseleave={() => getStartedHovered = false}
        >
            {state.user ? "Open Accord" : "Get Started"}
            <ExternalLink class={`my-auto ${getStartedHovered ? "w-5 h-5 ml-2" : "w-0 h-0"} transition-all duration-300`} />
        </a>
        
        <div class="flex flex-col mt-24">
            <div class="grid grid-cols-1 md:grid-cols-2 md:mx-auto px-2 md:w-1/2 gap-4">
                {#each features as f}
                    <div class="bg-ctp-mantle p-4 rounded-md m-2 flex flex-col border hover:border-ctp-blue transition-all duration-500">
                        <div class="flex">
                            <h2 class="text-2xl font-bold">{f.title}</h2>
                            <f.icon class="w-12 h-12 p-2 border rounded-md bg-ctp-base ml-auto mb-2" />
                        </div>
                        
                        <p class="text-xl text-start">{f.description}</p>
                    </div>
                {/each}
            </div>
        </div> 
    </div>
</div>