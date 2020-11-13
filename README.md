# dxe-discord-integration
Discord bot &amp; ADB integration

## Running the app
1. Install node.js, recommended version 12.7
2. Clone this repo
3. ```npm install``` to install deps
4. Create an ```.env``` file with your config:
```
DISCORD_TOKEN=XXXX ; token for discord
DISCORD_GUILD_ID=XXXX ; guild (server) id for discord
ADB_SECRET=XXXX ; shared secret for ADB
```
5. ```npm run start``` for prod or ```npm run devStart``` for dev