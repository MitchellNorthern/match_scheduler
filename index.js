const {
    token,
    coordinationChannel,
    rosterChannel,
    logChannel,
} = require('./secrets.json')
const coordinationHandler = require('./src/coordinationHandler')
const dmHandler = require('./src/dmHandler')
const logHandler = require('./src/logHandler')
const rosterHandler = require('./src/rosterHandler')
const Discord = require('discord.js')
const client = new Discord.Client()

const utils = require('./src/utils')

// Secrets contains:
//      Token
//      Client ID
//      Permissions Integer

client.on('ready', () => {
    const roster = utils.resolveChannel(client, rosterChannel)
    rosterHandler.setupChannel(roster, false)
})

client.on('message', msg => {
    // If the message sender was the bot, return
    if (
        msg.author.username === client.user.username &&
        msg.author.discriminator === client.user.discriminator
    ) {
        return
    }

    const channelName = msg.channel.name

    // If the channel isn't a bot-specific channel ignore the message
    if (
        channelName !== coordinationChannel &&
        channelName !== rosterChannel &&
        channelName != logChannel
    ) {
        return
    }

    // Handle the message otherwise
    switch (msg.channel.type) {
        case 'text':
            if (channelName === coordinationChannel) {
                coordinationHandler.handleMsg(client, msg)
            } else if (channelName === rosterChannel) {
                rosterHandler.handleMsg(client, msg)
            } else if (channelName === logChannel) {
                logHandler.handleMsg(client, msg)
            } else {
                console.error(
                    `Error: Text channel is not a bot-specific channel: ${channelName}`
                )
            }
            break
        case 'dm':
            dmHandler.handleMsg(client, msg)
            break
    }
})

client.login(token)
