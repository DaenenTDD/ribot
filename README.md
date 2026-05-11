# discord-bot-template
A template for making new discord bots.

# Scripts
All scripts can be run with --debug to enable logging debug info.

Alternatively, you can specify a `logLevel=<DEBUG | INFO | WARN | ERROR>` argument to specify the minimum logging level. Defaults to INFO.

### `npm run start` 
Starts with env=production

### `npm run dev` 
Starts with env=development

### `npm run deploy [env=<production | development>]` 
Deploys all commands to the guild specified in the env file

### `npm run deploy:global [env=<production | development>]` 
Deploys all commands globally

### `npm run unregister <commandID... | --all> [env=<production | development>]` 
Unregisters commands from the guild specified in the env file

Example: `npm run unregister 1501453196076384256 env=production`

### `npm run unregister:global <commandID... | --all> [env=<production | development>]`
Unregisters commands globally

Example: `npm run unregister:global --all env=development`