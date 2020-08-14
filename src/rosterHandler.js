const utils = require('./utils')
const { rosterChannel } = require('../secrets.json')

exports.handleMsg = (client, msg) => {
    console.log(msg.author)
    const content = msg.content
    const userRefRegex = /^<@!\d*>\S*$/
    const userDeleteRegex = /^del <@!\d*>\S*$/i
    if (content.match(userRefRegex) || content.match(userDeleteRegex)) {
        msg.channel.messages.fetch().then(messages => {
            let roster = null
            messages.array().forEach(message => {
                if (message.author.id === client.user.id) {
                    roster = message
                }
            })
            if (roster) {
                if (content.match(userRefRegex)) {
                    // Add the user to the roster
                    roster.edit(`${roster.content}\n${content}`)
                } else {
                    // Remove the user from the roster by splitting on the delete message content and joining
                    roster.edit(
                        roster.content.split(content.substring(4)).join()
                    )
                }
            } else {
                // There was no roster, we need to clear the channel and create one
                const channel = msg.channel
                this.setupChannel(channel, true)
                this.handleMsg(client, msg)
            }
        })
    } else {
        msg.delete()
    }
}

exports.setupChannel = (channel, clear) => {
    if (clear) {
        channel.messages
            .fetch()
            .then(messages => channel.bulkDelete(messages))
            .then(() => {
                channel.send('ROSTER\n')
            })
    } else {
        channel.messages.fetch().then(messages => {
            if (messages.size === 0) {
                channel.send('ROSTER\n')
            }
        })
    }
}
