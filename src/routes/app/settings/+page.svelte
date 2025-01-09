<script lang="ts">
    import { removeCookie, getCookie } from "typescript-cookie";

    const views = [
        
    ]

    let view = "Appearance";

    async function logOut() {
        await fetch("/api/v1/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: getCookie("token")
            })
        });

        removeCookie("token");
        window.location.href = "/";
    }
</script>

<div class="flex w-full h-screen">
    <div class="p-4 md:px-32 md:py-8">
        <div class="bg-ctp-mantle border p-2 rounded-md h-full flex flex-col">
            <a href="/app" class="unique svb hover:bg-ctp-surface0/25">Back Home</a>

            {#each views as v}
                <button class={`svb mt-2 ${view == v ? "bg-ctp-surface0/30" : "hover:bg-ctp-surface0/25"}`} on:click={() => view = v}>{v}</button>
            {/each}

            <button class="svb hover:bg-ctp-surface0/25 text-ctp-red mt-auto" on:click={() => logOut()}>Logout</button>
        </div>
    </div>
</div>

<style>
    .svb { /* set view button */
        transition: all 300ms;
        border-radius: 0.35rem;
        padding: 0.25rem 0.8rem;
        text-align: start;
        font-weight: bold;
        font-size: 1.2rem;
    }
</style>