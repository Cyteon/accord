import { MONGODB_URI } from "$env/static/private";
import mongoose from "mongoose";

mongoose.connect(MONGODB_URI);

// to init schemas
import User from "$lib/models/User";
import Place from "$lib/models/Place";

import { type Handle, type RequestEvent } from "@sveltejs/kit";
import { RateLimiter, type RateLimiterPlugin, type Rate, RetryAfterRateLimiter } from "sveltekit-rate-limiter/server";
import Token from "$lib/models/Token";

class TokenRateLimiter implements RateLimiterPlugin {
    readonly rate: Rate | Rate[];

    constructor(rate: Rate | Rate[]) {
        this.rate = rate;
    }

    async hash(event: RequestEvent) {
        const authorization = event.request.headers.get("Authorization");

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return null;
        }

        return authorization.split(" ")[1];
    }
}

const limiters = [
    {
        endsWith: "/messages",
        method: "PUT",
        limiter: new RetryAfterRateLimiter({
            plugins: [new TokenRateLimiter([30, "m"])],
        })
    },
    {
        endsWith: "/places",
        method: "PUT",

        limiter: new RetryAfterRateLimiter({
            plugins: [new TokenRateLimiter([5, "m"])],
        })
    },
    {
        endsWith: "/channels",
        method: "PUT",

        limiter: new RetryAfterRateLimiter({
            plugins: [new TokenRateLimiter([[10, "m"], [50, "h"]])],
        })
    },
    {
        endsWith: "/login",
        method: "POST",

        limiter: new RetryAfterRateLimiter({
            IPUA: [[10, "m"], [50, "10m"]],
        })
    }
]

export const handle: Handle = async({ event, resolve }) => {
    const path = event.request.url;
    const method = event.request.method;

    const limiter = limiters.find((limiter) => {
        return path.endsWith(limiter.endsWith) && limiter.method === method;
    });

    if (limiter) {
        const status = await limiter.limiter.check(event);

        if (status.limited) {
            return new Response(`Rate limit exceeded. Try again in ${status.retryAfter} seconds.`, {
                status: 429,
                headers: {
                    "Retry-After": status.retryAfter,
                } as any
            });
        }
    }

    const response = await resolve(event);
    return response;
}

