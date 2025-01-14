<script lang="ts">
    import { setCookie } from "typescript-cookie";
    import state from "$lib/state.svelte";

    let identifier = "";
    let password = "";
    let error = "";

    async function login() {
        error = "";

        if (!identifier || !password) {
            error = "Please fill in all fields";
            return;
        }

        if (password.length < 8) {
            error = "Incorrect password";
            return;
        }

        const res = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                identifier,
                password
            })
        });

        if (res.ok) {
            const data = await res.json();

            setCookie("token", data.token, { expires: 28 });

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
            <h1 class="text-3xl font-bold">Log into your account!</h1>
            <form class="mt-4 flex flex-col h-full break-all">
                <label for="username" class="my-1 text-lg">Username or Email</label>
                <input type="text" placeholder="Username or Email" bind:value={identifier} />
    
                <label for="password" class="my-1 text-lg">Password</label>
                <input type="password" placeholder="Password" bind:value={password} />
    
                <p class="text-ctp-red mt-auto pb-2 pt-1">{error}</p>
                <button class="bg-ctp-yellow text-ctp-crust text-xl rounded-md p-1 mt-auto" onclick={login}>Login</button>
                <p class="mt-1">Dont have an account? <a href="/register">Register</a></p>
            </form>
        </div>
    </div>
</div>