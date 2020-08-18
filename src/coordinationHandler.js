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

Confirming the Date:
If you were the opponent who was messaged, to confirm or reject the date, simply write a message with a 'Y' or 'N' (without quotes) and mention your opponent in this channel.
The message should look something like the following:

\`Y @Alice\`

Check-in Instructions:
To avoid walkovers, both players must check in up to 15 minutes before or no later than 15 minutes after the scheduled time. To do this, mention the bot and your opponent (e.g. \`@Match_Scheduler @Robert\`) in this channel. You will receive a message if you have successfully checked in.
If a player fails to check in, the player that did check in may receive a walkover win.

Rescheduling Instructions:
If neither player checked in, or one player did but is willing to reschedule the match, you may reschedule the match.
To do this, simply follow the same steps as you took to coordinate the match in the first place. However, the player that would have received the walkover win must send the first message to indicate their willingness to reschedule.
If you already know you need to reschedule the match before it takes place, either player may initiate the rescheduling process.

GL HF`

const scheduleMsg = `Schedule:\n`

const { rosterChannel } = require('../secrets.json')
const utils = require('./utils')

function findCurrentRoster(channels) {
    for (channel of channels.array()) {
        if (channel.name === rosterChannel) {
            return channel
        }
    }
}

function addMatch() {}

exports.constants = {
    initialMessage: [initMsg, scheduleMsg],
    invalidFormat:
        'Sorry, your scheduling message was in an invalid format. Please try again.',
    notOnRoster:
        'Sorry, but you cannot coordinate matches if you are not on the roster. If you believe this message is in error, please contact a server administrator.',
    dateInPast:
        'You cannot schedule a match for a date that has already passed. Please try again.',
    dateTooFarFuture:
        'You cannot schedule a match for more than 2 weeks in advance.',
    cannotReschedule: 'Sorry, you cannot reschedule this match.',
}

exports.handleMsg = (client, msg) => {
    const splitContent = msg.content.split(' ')

    if (splitContent.length !== 5 && splitContent.length !== 2) {
        // If the message is in the improper format, delete it and let the author know
        msg.author.send(this.constants.invalidFormat)
        msg.delete()
        return
    }
    // Check if the user is on the roster. If they aren't, delete the message, otherwise continue
    const roster = findCurrentRoster(msg.guild.channels.cache)
    const found = roster.messages.cache
        .first()
        .content.split('\n')
        .filter(user => user.match(msg.author.id))
    if (!found.length) {
        msg.author.send(this.constants.notOnRoster)
        msg.delete()
        return
    }

    if (splitContent.length === 5) {
        // The message was in the right format, so make sure the last part of it was a ping
        if (!splitContent[4].match(utils.constants.userRegex)) {
            // The last part of the message was not a ping, so let the author know
            msg.author.send(this.constants.invalidFormat)
            msg.delete()
            return
        }

        // Now make a date from the rest and ensure it's in the right format
        const date = new Date(`${splitContent.slice(0, 4).join(' ')} UTC+0:00`)

        // Perform some checks to ensure the date is valid. There are a few checks that must be done:
        // 1. If the date was invalid, let the sender know
        if (date.toUTCString() === 'Invalid Date') {
            msg.author.send(this.constants.invalidFormat)
            msg.delete()
            return
        }
        // 2. If the date is in the past, let the sender know
        if (date < Date.now()) {
            msg.author.send(this.constants.dateInPast)
            msg.delete()
            return
        }
        // 3. If the date is too far in the future (past 2 weeks), let the sender know
        if (date > Date.now() + 12096e5) {
            msg.author.send(this.constants.dateTooFarFuture)
            msg.delete()
            return
        }

        // We know the date was valid and the last part of the message was a ping, so we're good!
        // Now, determine whether or not this is a reschedule by checking the schedule
        // TODO

        // Add the proposed time to the schedule
        const schedule = msg.channel.messages.cache
            .array()
            .filter(message => message.author === client.user)[0]

        const splitSchedule = schedule.content.split('\n')
        let scheduledMatch = ''
        let scheduledIndex = -1
        for (let i = 0; i < splitSchedule.length; i++) {
            if (
                splitSchedule[i].match(msg.author.id) &&
                splitSchedule[i].match(splitContent[4])
            ) {
                scheduledMatch = splitSchedule[i]
                scheduledIndex = i
                break
            }
        }

        // If there was no scheduled match, add it to the schedule
        if (scheduledIndex === -1) {
            schedule.edit(
                schedule.content +
                    `\n${msg.author} vs ${
                        splitContent[4]
                    } - ${date.toUTCString()} - TENTATIVE`
            )
        } else {
            // Otherwise, there was a scheduled match, so this is a reschedule
            // Make sure the person initiating the reschedule isn't the no-show person
            if (scheduledMatch.match(new RegExp(`${msg.author.id}-NO-SHOW`))) {
                msg.author.send(this.constants.cannotReschedule)
                msg.delete()
                return
            }
            // The author isn't the no-show, so initiate the reschedule
            scheduledMatch = `\n${msg.author} vs ${
                splitContent[4]
            } - ${date.toUTCString()} - TENTATIVE`
            schedule.edit(
                splitSchedule
                    .splice(scheduledIndex, 1, scheduledMatch)
                    .join('\n')
            )
        }

        // Message the mentioned user the proposed time
        msg.mentions.members
            .first()
            .send(
                `Hello! Your opponent from ${
                    msg.guild.name
                } would like to schedule a match with you on ${date.toUTCString()}. Please either confirm or reject the match in the coordination channel.`
            )
    } else {
        // The message contained only two pieces, meaning it's either a confirmation or a check-in.
        const piece1 = splitContent[0]
        const piece2 = splitContent[1]

        // If both pieces matched the user regex, it's a check-in
        if (piece1.match(userRegex) && piece2.match(userRegex)) {
        } else if (
            (piece1.match(userRegex) && piece2.length === 1) ||
            (piece2.match(userRegex) && piece1.length === 1)
        ) {
            // Otherwise, if one piece is a single character and the other piece is a mention, it's a confirmation
            let character =
                piece1.length === 1
                    ? (character = piece1)
                    : (character = piece2)
            // Ensure the character is a Y or N
            if (
                character.toUpperCase() !== 'Y' &&
                character.toUpperCase() !== 'N'
            ) {
                msg.author.send(this.constants.invalidFormat)
                msg.delete()
                return
            }
        } else {
            // Else it's in the wrong format
            msg.author.send(this.constants.invalidFormat)
            msg.delete()
            return
        }
    }
}
