<script lang="ts">
    import { removeCookie, getCookie } from "typescript-cookie";
    import state from "$lib/state.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

    const views = [
        "Account",
        //"Appearance",
    ]

    let view = "Account";

    let username = state.user?.username;
    let displayName = state.user?.displayName;
    let error = "";

    onMount(() => {
        // the inputs were empty sometimes
        setTimeout(() => {
            if (!username || !displayName) {
                username = state.user?.username;
                displayName = state.user?.displayName;
            }
        }, 100);
    });

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

    async function updateSettings() {
        const body = {};

        if (username != state.user?.username) {
            body.username = username;
        }

        if (displayName != state.user?.displayName) {
            body.displayName = displayName;
        }

        if (document.getElementById("avatar")!.files.length > 0) {
            const file = document.getElementById("avatar")!.files[0];

            if (file.size > 2048 * 1024) {
                error = "File size must be less than 2MB";
                return;
            }

            if (!file.type.startsWith("image/")) {
                error = "File must be an image";
                return;
            }

            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();

                reader.onload = () => resolve(reader.result as string);

                reader.readAsDataURL(file);
            });

            body.avatar = base64;
        }

        const res = await fetch("/api/v1/users/@me", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            state.user = await res.json();
            document.getElementById("saveBtn")!.setAttribute("disabled", "");
        } else {
            error = (await res.json()).error;
        }
    }

    if (browser) {
        document.addEventListener("input", (e) => {
            if (username != state.user?.username || displayName != state.user?.displayName || document.getElementById("avatar")!.files.length > 0) {
                document.getElementById("saveBtn")!.removeAttribute("disabled");
            } else {
                document.getElementById("saveBtn")!.setAttribute("disabled", "");
            }
        });
    }
</script>

<div class="flex w-full h-screen">
    <div class="p-4 md:px-32 md:py-8 flex w-full">
        <div class="bg-ctp-mantle border p-2 rounded-md h-full flex flex-col min-w-48">
            <a href="/app" class="unique svb hover:bg-ctp-surface0/25">Back Home</a>

            {#each views as v}
                <button class={`svb mt-2 ${view == v ? "bg-ctp-surface0/30" : "hover:bg-ctp-surface0/25"}`} on:click={() => view = v}>{v}</button>
            {/each}

            <button class="svb hover:bg-ctp-surface0/25 text-ctp-red mt-auto" on:click={() => logOut()}>Logout</button>
        </div>

        <div class="bg-ctp-mantle border ml-2 md:ml-8 p-2 px-4 rounded-md w-full flex flex-col">
            {#if view == "Account"}
                <h1 class="text-3xl font-bold">Account</h1>

                <div class="mt-4 w-96 flex flex-col">
                    <label for="username" class="text-xl">Username</label>
                    <input 
                        type="text" 
                        placeholder="Username..." 
                        id="username" 
                        class="input text-xl mt-1" 
                        bind:value={username} 
                        on:input={() => {
                            username = username.toLowerCase()
                                .replace(/[^a-z0-9_]/g, "")
                                .slice(0, 20);
                        }}
                    />

                    <label for="displayName" class="text-xl mt-2">Display Name</label>
                    <input 
                        type="text" 
                        placeholder="Display Name..." 
                        id="displayName" 
                        class="input text-xl mt-1" 
                        bind:value={displayName} 
                        on:input={() => {
                            displayName = displayName.slice(0, 30);
                        }}
                    />

                    <label for=avatar class="text-xl mt-2">Avatar</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        id="avatar" 
                        class="mt-1 file:bg-ctp-mantle file:px-2 file:py-1 file:rounded-md file:border-none file:text-ctp-text" 
                    />
                </div>
            {:else if view == "Appearance"}
                <h1 class="text-3xl font-bold">Appearance</h1>
            {/if}

            <p class="text-ctp-red mb-2 mt-auto">{error}</p>
            
            <button id="saveBtn" class="transition-color duration-300 unique bg-ctp-green enabled:text-ctp-crust rounded-md p-2 mb-1 text-2xl font-semibold disabled:bg-ctp-surface0" disabled on:click={() => updateSettings()}>Save</button>
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
        font-size: 1.5rem;
    }
</style>