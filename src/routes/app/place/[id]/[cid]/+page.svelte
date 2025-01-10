<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
    import { Hash, Send, Plus } from "lucide-svelte";
    import { browser } from "$app/environment";
    import state_ from "$lib/state.svelte";
    import type { PlaceType } from "$lib/models/Place";
    import type { ChannelType } from "$lib/models/Channel";
    import type { MessageType } from "$lib/models/Message";
    import { generateTimeString } from "$lib/utils";
    import { onMount, tick } from "svelte";
    import { source } from "sveltekit-sse";

    let { data }: { data: { id: string, cid: string } } = $props();
    let { id, cid } = data;

    $effect(() => {
        getData(data.id, data.cid);
    });

    let place: PlaceType & {
        channels?: ChannelType[];
    } | null = $state(null);

    let channel: ChannelType & {
        messages?: MessageType[];
    } | null = $state(null);

    let messageContent = $state("");
    let sendMessageError = $state("");

    let showServerDropDown = $state(false);
    let showInviteModal = $state(false);
    let inviteMaxUses = $state(-1);
    let inviteCode: {
        code: string,
        maxUses: number,
    } | null = $state(null);

    let showCreateChannelModal = $state(false);
    let channelName = $state("");

    let offset = 0;

    if (browser) {
        source(`/api/v1/channels/${cid}/messages`, {
            options: {
                headers: {
                    Authorization: `Bearer ${getCookie("token")}`,
                }
            }
        }).select("message").subscribe(async (msg) => {
            if (!msg) return;

            const data = JSON.parse(msg);

            console.log(data);

            if (!channel?.messages) {
                channel.messages = [];
            }

            if (data.authorId._id != state_.user._id) {
                channel.messages.push(data);

                await tick();
            
                document.getElementById("chats")?.scrollTo(0, document?.getElementById("chats")?.scrollHeight || 0);
                
            }
        })
    }

    async function getData(id: string, cid: string) {
        if (state_.places[id]) {
            place = state_.places[id] as any;
        } 
        
        if (browser) {
            const res = await fetch(`/api/v1/channels/${cid}`, {
                headers: {
                    Authorization: `Bearer ${getCookie("token")}`,
                },
            });

            if (res.ok) {
                const json = await res.json();

                channel = json;

                await tick();
                
                document?.getElementById("chats")?.scrollTo(0, document?.getElementById("chats")?.scrollHeight);

                if (!place?.channels) { // if chnnels not loaded, additional data may be needed :cwy:
                    const res2 = await fetch(`/api/v1/places/${id}`, {
                        headers: {
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    });

                    if (res2.ok) {
                        place = await res2.json();
                        state_.places[place?._id.toString()!] = place as any;

                    } else {
                        window.location.href = "/app";
                    }
                }
            } else {
                window.location.href = "/app";
            }
        }
    }

    onMount(async () => {
        getData(id, cid);

        const obserer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                offset += 50;

                const res = await fetch(`/api/v1/channels/${cid}?offset=${offset}`, {
                    headers: {
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                });

                if (res.ok) {
                    const json = await res.json();

                    if (!channel?.messages) {
                        channel.messages = [];
                    }

                    const currentScroll = document.getElementById("chats")!.scrollHeight;

                    channel.messages = [...json.messages, ...channel.messages];

                    await tick();
                   
                    document.getElementById("chats")!.scrollTo(0, document.getElementById("chats")!.scrollHeight - currentScroll);
                    
                } 
            }
        });

        setTimeout(() => {
            obserer.observe(document.getElementById("top")!);
        }, 1000);
    });

    async function sendMessage() {
        sendMessageError = "";

        if (!messageContent) return;
        if (messageContent.length > 2000) {
            sendMessageError = "Message is longer than 2000 characters >:(";
            return;
        }

        const res = await fetch(`/api/v1/channels/${data.cid}/messages`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify({ content: messageContent }),
        });

        if (res.ok) {
            messageContent = "";
            
            if (!channel?.messages) {
                channel.messages = [];
            }
            
            let json = await res.json();

            channel?.messages.push(json);

            setTimeout(() => {
                document?.getElementById("chats")?.scrollTo(0, document?.getElementById("chats")?.scrollHeight);
            }, 100);
        } else {
            sendMessageError = await res.text();

            if (sendMessageError.length > 100) {
                sendMessageError = "An error occurred while sending the message.";
            }
        }
    }

    async function generateCode() {
        if (inviteCode && inviteCode.maxUses == inviteMaxUses) {
            return;
        }

        const res = await fetch(`/api/v1/places/${data.id}/invites`, {
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

    async function createChannel() {
        const res = await fetch(`/api/v1/places/${data.id}/channels`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getCookie("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: channelName,
            }),
        });

        if (res.ok) {
            showCreateChannelModal = false;
            channelName = "";
            
            const json = await res.json();
            place?.channels?.push(json);
        }
    }
    // is someone actually reading all this?
</script>

<div class="flex h-screen w-full max-h-screen overflow-y-clip">
    <SideBar />

    <div class="bg-ctp-mantle w-full max-w-48 border-r">
        <div class="relative">
            <button class="px-5 py-2 border-b text-xl font-bold hover:bg-ctp-surface0/25 transition-color duration-300 w-full text-left" onclick={() => showServerDropDown = !showServerDropDown}>
                <span class="my-auto truncate">{place?.name}</span>
            </button>

            <div class="absolute w-full">
                <div class={`${showServerDropDown ? "block" : "hidden"} bg-ctp-crust border rounded-md m-2 p-1`}>
                    <button class="scb text-ctp-yellow" onclick={() => showInviteModal = true}>
                        <span class="my-auto">Create Invite</span>
                    </button>
                </div>
            </div>
        </div>

        {#if place?.ownerId == state_.user?._id}
            <button class="px-2 mt-2 flex w-full" onclick={() => showCreateChannelModal = true}>
                Create channel
                <Plus class="size-fit ml-auto" />
            </button>
        {/if}

        {#each place?.channels! as channel}
            <div class={`px-2 py-1 rounded-md mx-2 mt-2 ${data.cid == channel._id.toString() ? "bg-ctp-surface0/50" : "hover:bg-ctp-surface0/25"} transition-color duration-300`}>
                <a href={`/app/place/${data.id}/${channel._id}`} class="unique flex">
                    <Hash width={16} height={16} class="my-auto text-ctp-subtext0" />
                    <span class="mb-0.5 ml-1 text-lg truncate">{channel.name}</span>
                </a>
            </div>
        {/each}
    </div>
    
    <div class="w-full flex flex-col">
        <div class="bg-ctp-mantle w-full h-fit py-[0.3rem] px-4 border-b">
            <h1 class="text-ctp-subtext0 text-lg font-bold flex">
                <Hash width={24} height={24} class="my-auto text-ctp-subtext0" />
                <span class="ml-1 mb-1.5">{place?.channels?.find(c => c._id.toString() == data.cid)?.name}</span>
            </h1>
        </div>
        
        <div class="flex flex-col h-full">
            <div class="overflow-y-auto max-h-[calc(100vh-7rem)] pt-0" id="chats">
                <span class="invisible" id="top"></span>

                {#each channel?.messages as msg, i}
                    {@const group = (msg.authorId._id == channel?.messages![i-1]?.authorId._id && new Date(msg.createdAt).getTime() - new Date(channel?.messages![i-1]?.createdAt).getTime() < 60000)}

                    <div class={`flex ${group ? "" : "mt-4 p-1"} px-4 hover:bg-ctp-mantle/80 transition-color duration-300 group`}>
                        {#if !group}
                            <img src={msg.authorId.pfpUrl} class="rounded-full w-14 h-14 mr-2" />
                        {/if}

                        <div class="flex flex-col">
                            {#if !group}
                                <div class="flex">
                                    <p class="font-bold text-2xl leading-none truncate max-w-96">{msg.authorId.displayName}</p>
                                    <p class="text-ctp-subtext0 mt-0.5 ml-2">{generateTimeString(msg.createdAt)}</p>
                                </div>
                            {/if}
                            <div class="flex">
                                {#if group}
                                    <p class="text-ctp-subtext0 text-[0.75rem] mt-[6px] mr-3 invisible group-hover:visible">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                {/if}

                                <p 
                                    class="text-xl mb-0.5"
                                    style="overflow-wrap: break-word; word-break: break-word;"
                                >{msg.content}</p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <div class="mt-auto p-4 pt-3">
                <p class="text-ctp-red">{sendMessageError}</p>
                <div class="flex w-full">
                    <input type="text" class="w-full p-2 border bg-ctp-mantle rounded-md" placeholder="Message" bind:value={messageContent} onkeydown={e => e.key == "Enter" && sendMessage()} />
                    <button class="bg-ctp-mantle hover:text-ctp-blue transition-all duration-300 border rounded-md ml-2 p-2" onclick={sendMessage}>
                        <Send class="size-full" />
                    </button>
                </div>
            </div>
        </div>
    </div>

    {#if showInviteModal}
        <div class="flex absolute w-full h-full bg-ctp-mantle/50" onclick={() => showInviteModal = false}>
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

    {#if showCreateChannelModal}
        <div class="flex absolute w-full h-full bg-ctp-mantle/50" onclick={() => showCreateChannelModal = false}>
            <div class="border p-4 bg-ctp-mantle m-auto rounded-md text-left" onclick={e => e.stopPropagation()}>
                <h1 class="text-3xl font-bold">Create Channel :P</h1>
                <label for="channelName" class="block my-2 text-lg">Channel Name</label>
                <input id="channelName" bind:value={channelName} onkeydown={e => e.key == "Enter" && createChannel()} />

                <button class="mt-2 bg-ctp-yellow text-ctp-crust w-full p-2 rounded-md" onclick={() => createChannel()}>
                    <span class="my-auto">Create</span>
                </button>
            </div>
        </div>
    {/if}
</div>