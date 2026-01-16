# <b>Termyte: a powerful and open-source discord bot</b>

[![Project stack](https://skillicons.dev/icons?i=js,nodejs,discordjs,mongodb,discord,bots,github)](https://skillicons.dev)<br>
<b>features:</b>

* Automod setup
* Customizable enforcement system
* Reaction role assignment system
* Aditional API connectivity
    * Tenor
    * Github
    * Urbandictionary
* Open source and flexible architechture
* Feature-rich
* 18 slash commands, 20+ unique and entertaining features

## <b>Intructions:</b>

Termyte can be invited to your server OR it can be hosted locally. user autonomy was my primary goal with this project and as such resources have been provided for developers to continue to build off of Termyte's framework or host their own custom instance. Termyte was this semester's over break project and served as a way for me to learn more about API interactions, and I'd love it if it could help other aspiring developers to learn as well. 

### Skip to bottom for bot invite link, or keep reading for instructions on how to set up your own local instance

* <b>Step 1:</b>

You will need to download node js if you have not already https://nodejs.org/en/download
once you have downloaded node.js navigate to the directory with the project files for Termyte and run the following command:

>npm install

This will install all the needed packages for Termyte to run on your computer.

* <b>Step 2:</b>

You will need to set up a mongodb atlas account with at least the free tier at https://mongodb.com
make sure you either allow all IP addresses or the address of your host machine in the options!
copy the URL, you will need it for step 3.

* <b>Step 3:</b>

you will need to make a .env file in your install's root directory with the following fields:

* bot_name (your bot's name)
* token
* tenor_token
* clientId
* guildId (your testing server's ID)
* ownerId (your Discord account ID)
* version (your bot's version)
* database (database url)

You will need to populate this fields with the relevant info for the bot to work, you will also need to make a testing server
Access the Discord developer portal with your account and fill out the relevant token information. Tenor tokens can be obtained through the Google
cloud console.

Make sure you click the bot > administrator perms under Oauth2 before generating the invite link!

<b>How to run the bot:</b>

> src> node deployLocal.js || node deployGlobal.js (local for testing)
> src> node main.js

deployLocal deploys commands to your test server, deployGobal will deploy commands globally. Main starts the main activity response loop of the bot

<b>Invite link: https://discord.com/oauth2/authorize?client_id=1454353025626935317&permissions=8&integration_type=0&scope=bot</b>

<b>For general use:</b>

/help will send a list of commands to you. Ensure the bot has an administrator role for its features to work properly (reactionroles, enforcement)

[Changelog](./CHANGELOG.md)
