# Accord

> The next-gen chatting app

### Todo-List:

- [x] Making servers/channels
- [x] Realtime chatting
- [ ] Friends

### Hosting yourself

1. Clone and cd into repo

```bash
$ git clone https://github.com/cyteon/accord && cd accord
```

2. Move `.env.example` to `.env` and fill in `MONGODB_URI` (we will do default server ID later)

3. Quickly start with `npm run dev`, then open it, register and make a server. Then copy the server ID from url to the .env

4. Running for production

```bash
$ npm run build
```

And run `build/index.js`.

You also have a premade script to run accord with pm2, run it with `sh pm2.sh 1234` where 1234 is the port!
