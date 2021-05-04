# dxe-discord-integration
Discord bot &amp; ADB integration

## Running the app locally
1. Install node.js, recommended version 12.7
2. Clone this repo
3. ```npm install``` to install deps
4. Create an ```.env``` file with your config:
```
DISCORD_TOKEN=XXXX ; token for discord
DISCORD_GUILD_ID=XXXX ; guild (server) id for discord
ADB_SECRET=XXXX ; shared secret for ADB
PORT=XXXX ; port to run on to listen for local requests
```
5. ```npm run start```

## Deploying to prod
- A GitHub Action automatically builds the Docker image and pushes it to ECR.
- Watchtower is running on our apps servers to automatically pull the new image and restart the container.
