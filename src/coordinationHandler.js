// Create the initial message outside the object so it can be manipulated
const initMsg = `Welcome to the coordination channel! Please read this post completely to understand how to coordinate matches with your opponent. Refer to your server's rules if you have any questions or concerns.

Coordination Instructions:
To coordinate with your opponent, please arrange a time for your match with them in some way outside this channel.
Once you have done so, send a message containing the following, in order, with a space separating them:

1. The time of your match (in UTC +/- 00:00)
2. The date of your match
3. The month of your match
4. The year of your match
5. A mention/ping of your opponent

The message should look something like the following:

\`16:00 21 August 2020 @Robert\`

Once you have done that, your opponent will receive a message asking them to confirm the date. If they do, 
your match is set!

Check-in Instructions:
To avoid walkovers, both players must check in up to 15 minutes before or no later than 15 minutes after the scheduled time. To do this, simply mention the bot in this channel. You will receive a message if you have successfully checked in.
If a player fails to check in, the player that did check in may receive a walkover win.

Rescheduling Instructions:
In the event neither player checked in, or one player did but is willing to reschedule the match, you may reschedule the match.
To do this, simply follow the same steps as you took to coordinate the match in the first place. However, the player that would have received the walkover win must send the first message to indicate their willingness to reschedule.
If you already know you need to reschedule the match before it takes place, either player may initiate the rescheduling process.

GL HF`

const { rosterChannel } = require('../secrets.json')

function findCurrentRoster(channels) {
    for (channel of channels.array()) {
        if (channel.name === rosterChannel) {
            return channel
        }
    }
}

exports.constants = {
    initialMessage: initMsg,
    invalidFormat:
        'Sorry, your scheduling message was in an invalid format. Please try again.',
    notOnRoster:
        'Sorry, but you cannot coordinate matches if you are not on the roster. If you believe this message is in error, please contact a server administrator.',
}

exports.handleMsg = (client, msg) => {
    const splitContent = msg.content.split(' ')

    if (splitContent.length !== 5) {
        // If the message is in the improper format, delete it and let the author know
        msg.delete()
        msg.author.send(this.constants.invalidFormat)
    } else {
        // Check if the user is on the roster. If they aren't, delete the message, otherwise continue
        const roster = findCurrentRoster(msg.guild.channels.cache)
        const found = roster.messages.cache
            .first()
            .content.split('\n')
            .filter(user => user.match(msg.author.id))
        if (!found.length) {
            msg.delete()
            msg.author.send(this.constants.notOnRoster)
        } else {
            // The message was in the right format, so do some checks
            // Check if this is a reschedule (TODO)
            // Check if
            const date = new Date()
        }
    }
}
