<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
    import { Hash, Send, Plus } from "lucide-svelte";
    import { browser } from "$app/environment";
    import state_ from "$lib/state.svelte";
    import type { PlaceType } from "$lib/models/Place";
    import type { ChannelType } from "$lib/models/Channel";
    import type { MessageType } from "$lib/models/Message";
    import { generateTimeString, parseMsg } from "$lib/utils";
    import { onMount, tick, untrack } from "svelte";
    import { source } from "sveltekit-sse";
    import PlaceDropdown from "$lib/components/PlaceDropdown.svelte";

    let { data }: { data: { id: string, cid: string } } = $props();
    let lastCID = data.cid;

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
    let createChannelError = $state("");

    let offset = 0;

    let sse = null;

    function restartSSE() {
        sse = source(`/api/v1/sse`, {
            options: {
                headers: {
                    Authorization: `Bearer ${getCookie("token")}`,
                },

                body: JSON.stringify({ 
                    channels: [data.cid],
                }),
            }
        });

        sse.select("message").subscribe(async (value) => {
            if (!value) return;

            const msg = JSON.parse(value);

            console.log(msg);

            if (!channel?.messages) {
                channel.messages = [];
            }

            if (msg.authorId._id != state_?.user?._id && msg.channelId == data.cid) {
                channel.messages.push(msg);

                await tick();
            
                document.getElementById("chats")?.scrollTo(0, document?.getElementById("chats")?.scrollHeight || 0);
                
            }
        });
    }

    async function getData(id: string, cid: string) {
        untrack(async () => {
            if (state_.places[id]) {
                place = state_.places[id] as any;
            } 

            if (sse && lastCID != cid) {
                sse.close();
                sse = null;
            }
            if (!sse) restartSSE();

            if (browser) {
                const res = await fetch(`/api/v1/channels/${cid}`, {
                    headers: {
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                });

                if (res.ok) {
                    const json = await res.json();
                    channel = json;
                    offset = 0;
                    inviteCode = null;

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
        });
    }

    onMount(async () => {
        getData(data.id, data.cid);

        const observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                offset += 50;

                const res = await fetch(`/api/v1/channels/${data.cid}?offset=${offset}`, {
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
            observer.observe(document.getElementById("top")!);
        }, 1000);
    });

    async function sendMessage() {
        sendMessageError = "";

        if (!messageContent || messageContent.trim() == "") return;
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
            document.getElementById("messageInput")!.style.height = "auto";
            
            if (!channel?.messages) {
                channel.messages = [];
            }
            
            let json = await res.json();

            channel?.messages.push(json);

            await tick();
            
            document?.getElementById("chats")?.scrollTo(0, document?.getElementById("chats")?.scrollHeight);
        } else {
            sendMessageError = (await res.json()).error;

            if (sendMessageError.length > 100) {
                sendMessageError = "An error occurred while sending the message.";
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
        } else {
            createChannelError = await res.text();

            if (createChannelError.length > 100) {
                createChannelError = "An error occurred while creating the channel.";
            }
        }
    }
    // is someone actually reading all this?
</script>

<div class="flex h-screen w-full max-h-screen overflow-y-hidden">
    <SideBar />

    <div class="bg-ctp-mantle w-full max-w-48 border-r">
        <PlaceDropdown {place} />

        {#if place?.ownerId == state_.user?._id}
            <button class="px-2 mt-2 flex w-full" onclick={() => showCreateChannelModal = true}>
                Create channel
                <Plus class="size-fit ml-auto" />
            </button>
        {/if}

        <div class="overflow-y-auto h-[calc(100%-7rem)]">
            {#each place?.channels! as channel}
                <div class={`px-2 py-1 rounded-md mx-2 mt-2 ${data.cid == channel._id.toString() ? "bg-ctp-surface0/50" : "hover:bg-ctp-surface0/25"} transition-color duration-300`}>
                    <a href={`/app/place/${data.id}/${channel._id}`} class="unique flex">
                        <Hash width={16} height={16} class="my-auto text-ctp-subtext0" />
                        <span class="mb-0.5 ml-1 text-lg truncate">{channel.name}</span>
                    </a>
                </div>
            {/each}
        </div>
    </div>
    
    <div class="w-full flex flex-col max-h-[calc(100vh-3rem)]">
        <div class="bg-ctp-mantle w-full h-fit py-[0.3rem] px-4 border-b">
            <h1 class="text-ctp-subtext0 text-lg font-bold flex">
                <Hash width={24} height={24} class="my-auto text-ctp-subtext0" />
                <span class="ml-1 mb-1.5">{place?.channels?.find(c => c._id.toString() == data.cid)?.name}</span>
            </h1>
        </div>
        
        <div class="flex flex-col h-full">
            <div class="overflow-y-auto h-screen" id="chats">
                <span class="invisible" id="top"></span>

                {#each channel?.messages as msg, i}
                    {@const group = (msg.authorId?._id == channel?.messages![i-1]?.authorId?._id && new Date(msg.createdAt).getTime() - new Date(channel?.messages![i-1]?.createdAt).getTime() < 60000)}

                    <div class={`flex ${group ? "" : "mt-4 p-1"} px-4 hover:bg-ctp-mantle/80 transition-color duration-300 group`}>
                        {#if !group}
                            <img src={msg.authorId?.pfpUrl || "https://placehold.co/200"} class="rounded-full w-14 h-14 mr-2" />
                        {/if}

                        <div class="flex flex-col">
                            {#if !group}
                                <div class="flex">
                                    <p class="font-bold text-2xl leading-none truncate max-w-96">{msg.authorId?.displayName || "[deleted user]"}</p>
                                    <p class="text-ctp-subtext0 mt-0.5 ml-2">{generateTimeString(msg.createdAt)}</p>
                                </div>
                            {/if}
                            <div class="flex">
                                {#if group}
                                    <p class="text-ctp-subtext0 text-[0.75rem] w-[3.2rem] my-auto mr-3 invisible group-hover:visible">{new Date(msg.createdAt).toLocaleTimeString("en-NO", { hour: "2-digit", minute: "2-digit" })}</p>
                                {/if}

                                <p 
                                    class="text-xl mb-0.5 prose"
                                    style="overflow-wrap: break-word; word-break: break-word;"
                                >
                                    {@html parseMsg(msg.content)}
                                </p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <div class="mt-auto p-4 pt-3">
                <p class="text-ctp-red">{sendMessageError}</p>
                <div class="flex w-full">
                    <textarea 
                        class="w-full p-2 border bg-ctp-mantle rounded-md resize-none max-h-32"
                        placeholder="Message" bind:value={messageContent} 
                        id="messageInput"
                        rows={1}
                        oninput={async (e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;

                            await tick();

                            document.getElementById("chats")!.scrollTo(0, document.getElementById("chats")?.scrollHeight || 0);
                        }}
                        onkeydown={e => {
                            if (e.key == "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    ></textarea>
                    <button class="bg-ctp-mantle hover:text-ctp-blue transition-all duration-300 border rounded-md ml-2 p-2 self-end" onclick={sendMessage}>
                        <Send class="size-full" />
                    </button>
                </div>
            </div>
        </div>
    </div>

    {#if showCreateChannelModal}
        <div class="flex absolute w-full h-full bg-ctp-mantle/50" onclick={() => showCreateChannelModal = false}>
            <div class="border p-4 bg-ctp-mantle m-auto rounded-md text-left" onclick={e => e.stopPropagation()}>
                <h1 class="text-3xl font-bold">Create Channel :P</h1>
                <label for="channelName" class="block my-2 text-lg">Channel Name</label>
                <input id="channelName" bind:value={channelName} onkeydown={e => e.key == "Enter" && createChannel()} />

                <p class="text-ctp-red mt-1 mb-2">{createChannelError}</p>

                <button class="bg-ctp-yellow text-ctp-crust w-full p-2 rounded-md" onclick={() => createChannel()}>
                    <span class="my-auto">Create</span>
                </button>
            </div>
        </div>
    {/if}
</div>