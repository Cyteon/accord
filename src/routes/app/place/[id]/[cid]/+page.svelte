<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
    import { Hash, Send } from "lucide-svelte";
    import { browser } from "$app/environment";
    import state_ from "$lib/state.svelte";
    import type { PlaceType } from "$lib/models/Place";
    import type { ChannelType } from "$lib/models/Channel";
    import type { MessageType } from "$lib/models/Message";
    import { generateTimeString } from "$lib/utils";
    import { onMount } from "svelte";

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

    onMount(() => {
        getData(id, cid);
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

    // is someone actually reading all this?
</script>

<div class="flex h-screen w-full">
    <SideBar />

    <div class="bg-ctp-mantle w-full max-w-48 border-r">
        <div class="px-5 py-2 border-b text-xl font-bold">
            <span class="my-auto truncate">{place?.name}</span>
        </div>

        {#each place?.channels! as channel}
            <div class={`px-2 py-1 rounded-md mx-2 mt-2 ${data.cid == channel._id.toString() ? "bg-ctp-surface0/50" : "hover:bg-ctp-surface0/25"} transition-color duration-300`}>
                <a href={`/app/place/${data.id}/${channel._id}`} class="unique flex">
                    <Hash width={16} height={16} class="my-auto text-ctp-subtext0" />
                    <span class="mb-1 ml-1 text-lg truncate">{channel.name}</span>
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
        
        <div class="p-4 pt-0 flex flex-col h-full">
            <div class="overflow-y-auto max-h-[calc(100vh-8rem)] fade-out" id="chats">
                {#each channel?.messages as msg}
                    <div class="flex mt-4">
                        <img src={msg.authorId.pfpUrl} alt="user-icon" class="rounded-full w-16 h-16 mr-2" />
                        <div>
                            <div class="flex">
                                <p class="font-bold text-2xl leading-none">{msg.authorId.displayName}</p>
                                <p class="text-ctp-subtext0 mt-0.5 ml-2">{generateTimeString(msg.createdAt)}</p>
                            </div>
                            <p class="text-xl">{msg.content}</p>
                        </div>
                    </div>
                {/each}
            </div>

            <div class="mt-auto">
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
</div>