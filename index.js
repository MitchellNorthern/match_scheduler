require('dotenv').config()

const {
    coordinationChannel,
    rosterChannel,
    logChannel,
} = require('./constants.json')
const coordinationHandler = require('./src/coordinationHandler')
const logHandler = require('./src/logHandler')
const rosterHandler = require('./src/rosterHandler')

const Discord = require('discord.js')
const client = new Discord.Client()

const utils = require('./src/utils')

client.on('ready', () => {
    // Set up the rosters
    const rosters = utils.resolveChannel(client, rosterChannel)
    rosters.forEach(roster =>
        utils.setupChannel(
            roster,
            rosterHandler.constants.initialMesssage,
            false
        )
    )

    // Set up the coordination
    const coordination = utils.resolveChannel(client, coordinationChannel)
    coordination.forEach(coord => {
        utils.setupChannel(
            coord,
            coordinationHandler.constants.initialMessage,
            false
        )
    })

    // Set up the logs
    const logs = utils.resolveChannel(client, logChannel)
    logs.forEach(log => {
        utils.setupChannel(log, logHandler.constants.initialMessage, false)
    })
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
        default:
            console.log(
                `Unknown message from ${msg.guild.name} with content ${msg.content}`
            )
            break
    }
})

client.login(process.env.BOT_TOKEN)
