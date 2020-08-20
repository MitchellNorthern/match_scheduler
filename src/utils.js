exports.constants = {
    userRegex: /^<@!?\d*>\S*$/,
}

/**
 * Retrieves an array of channels based on a given name
 *
 * @param client the client object
 * @param channelName the name of the channel to resolve
 */
exports.resolveChannel = (client, channelName) => {
    const foundChannels = []
    // Fetch the guilds and iterate through them
    client.guilds.cache.forEach(guild =>
        // For each guild, find the proper channel if it exists and add it to the array
        foundChannels.push(
            guild.channels.cache.find(channel => channel.name === channelName)
        )
    )
    return foundChannels
}

/**
 * Sets up the channel with a given initial message
 *
 * @param channel the current channel
 * @param {String} initialMessage the initial message to send to the channel
 * @param {boolean} clear whether or not to clear the channel of all messages (including the roster)
 */
exports.setupChannel = (channel, initialMessages, clear) => {
    if (clear) {
        // If we need to clear the channel, delete all the messages in it and send a new initial message
        const messages = channel.messages.cache
        channel.bulkDelete(messages)
        initialMessages.forEach(message => channel.send(`${message}\n`))
    } else {
        // Otherwise, if there are no messages, send the initial message
        channel.messages.fetch().then(messages => {
            if (messages.size === 0) {
                initialMessages.forEach(message => channel.send(`${message}\n`))
            }
        })
    }
}
