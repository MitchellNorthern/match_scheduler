const { setupChannel, constants } = require('./utils')

exports.constants = {
    initialMesssage: [
        `This is the roster for the league. Any users not on the roster cannot coordinate matches, so ensure all players are on the roster.
    
    If you want to reset the roster at any time, please message \`reset\` in this channel. You must be a server admin to do this.
    
    Roster:`,
    ],
}

/**
 * Handles a message in the roster channel
 *
 * @param client the client object
 * @param msg the message sent
 */
exports.handleMsg = (client, msg) => {
    const content = msg.content
    const userDeleteRegex = /^del <@!?\d*>\S*$/i

    if (content === 'reset' && msg.member.hasPermission('ADMINISTRATOR')) {
        // If the message is 'clear' and the member is an administrator, clear the channel
        setupChannel(msg.channel, this.constants.initialMesssage, true)
    } else if (
        content.match(constants.userRegex) ||
        content.match(userDeleteRegex)
    ) {
        // If the message matched either of the commands, add or delete the specified user to/from the roster
        msg.channel.messages.fetch().then(messages => {
            let roster = null
            messages.forEach(message => {
                if (message.author.id === client.user.id) {
                    roster = message
                }
            })
            if (roster) {
                if (content.match(constants.userRegex)) {
                    // Add the user to the roster
                    roster.edit(`${roster.content}\n${content}`)
                } else {
                    const rosterContent = roster.content.split('\n')
                    // Remove the `del ` from the message
                    const removeId = content.substring(4)
                    // Remove the user from the roster
                    rosterContent.splice(rosterContent.indexOf(removeId), 1)
                    roster.edit(rosterContent.join('\n'))
                }
            } else {
                // There was no roster, we need to clear the channel and create one
                setupChannel(msg.channel, this.constants.initialMesssage, true)
                this.handleMsg(client, msg)
            }
        })
    }
    msg.delete()
}
