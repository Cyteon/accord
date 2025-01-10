<script lang="ts">
    import { setCookie } from "typescript-cookie";
    import state from "$lib/state.svelte";

    let email = "";
    let username = "";
    let displayName = "";
    let password = "";

    let error = "";

    async function register() {
        error = "";

        if (!email || !username || !displayName || !password) {
            error = "Please fill in all fields";
            return;
        }

        if (/[^a-zA-Z0-9_]/.test(username)) {
            error = "Username can only contain letters and numbers";
            return;
        }

        if (password.length < 8) {
            error = "Password must be at least 8 characters long";
            return;
        }

        if (username.length > 20) {
            error = "Username must be less than 20 characters long";
            return;
        }

        if (displayName.length > 30) {
            error = "Display name must be less than 30 characters long";
            return;
        }

        const res = await fetch("/api/v1/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                username,
                displayName,
                password
            })
        });

        if (res.ok) {
            const data = await res.json();

            setCookie("token", data.token, {
                expires: 1000 * 60 * 60 * 24 * 28,
            });

            state.user = data.user;

            window.location.href = "/app";
        } else {
            const text = await res.text();

            error = text.length > 100 ? "An unknown error occurred" : text;
        }
    }
</script>

<div class="flex h-screen w-full">
    <div class="mx-2 md:mx-0 flex w-full">
        <div class="m-auto bg-ctp-mantle p-6 rounded-md border border-ctp-surface0 w-full md:w-1/2 xl:w-1/4 h-fit flex flex-col">
            <h1 class="text-3xl font-bold">Create an Account</h1>
            <form class="mt-4 flex flex-col h-full break-words">
                <label for="username" class="my-1 text-lg">Username</label>
                <input type="text" placeholder="Username" bind:value={username} />

                <label for="displayName" class="my-1 text-lg">Display Name</label>
                <input type="text" placeholder="Display Name" bind:value={displayName} />

                <label for="email" class="my-1 text-lg">Email</label>
                <input type="email" placeholder="Email" bind:value={email} />
    
                <label for="password" class="my-1 text-lg">Password</label>
                <input type="password" placeholder="Password" bind:value={password} />
    
                <p class="text-ctp-red mt-auto pb-2 pt-1">{error}</p>
                <button class="bg-ctp-yellow text-ctp-crust text-xl rounded-md p-1 mt-auto" onclick={register}>Register</button>
                <p class="mt-1">Already have an account? <a href="/login">Log in</a></p>
            </form>
        </div>
    </div>
</div>