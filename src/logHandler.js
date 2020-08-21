const instructions = `This is the log channel where you may submit commands to the bot. The bot will post the results here, so it is encouraged to keep this channel private.

Current instructions are:
\`reset log\` - Resets the current log channel (this one), deleting all messages and resending the initial instructions. 
\`log schedule\` - Clears the current schedule and puts it here so a more permanent record of schedules can be kept.
\`reset schedule\` - Resets the current schedule channel, deleting all messages and resetting to its initial state.`

const { coordinationChannel } = require('../constants.json')
const coordinationHandler = require('./coordinationHandler')
const utils = require('./utils')

function findCurrentSchedule(channels) {
    for (channel of channels.array()) {
        if (channel.name === coordinationChannel) {
            return channel
        }
    }
}

exports.constants = {
    initialMessage: [instructions],
}

exports.handleMsg = (client, msg) => {
    // Only do something if the user is an admin
    if (msg.member.hasPermission('ADMINISTRATOR')) {
        // If the message has the word schedule in it, fetch the schedule
        if (msg.content.match(/schedule/i)) {
            const schedule = findCurrentSchedule(msg.guild.channels.cache)

            if (msg.content.toLowerCase() === 'log schedule') {
                // Get the current schedule
                schedule.messages.fetch().then(messages => {
                    const scheduleMessage = messages
                        .filter(message => message.author.id === client.user.id)
                        .first()
                    const splitSchedule = scheduleMessage.content.split('\n')

                    // Remove the 'Schedule:' from the schedule post and replace it with the date
                    splitSchedule.splice(
                        0,
                        1,
                        new Date(Date.now()).toUTCString()
                    )

                    // Send the schedule to the log channel
                    msg.channel.send(splitSchedule.join('\n'))

                    // Clear the old schedule and reset it to the original schedule message, currently at index 1
                    scheduleMessage.edit(
                        coordinationHandler.constants.initialMessage[1]
                    )
                })
            }
            if (msg.content.toLowerCase() === 'reset schedule') {
                // Clear the schedule channel messages and resend the initial ones
                utils.setupChannel(
                    schedule,
                    coordinationHandler.constants.initialMessage,
                    true
                )
            }
        } else if (msg.content.toLowerCase() === 'reset log') {
            utils.setupChannel(msg.channel, this.constants.initialMessage, true)
        }
    }
}
