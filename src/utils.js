exports.resolveChannel = (client, channelName) => {
    let foundChannel = null
    client.channels.cache.array().forEach(possibleChannel => {
        if (possibleChannel.name === channelName) {
            foundChannel = possibleChannel
        }
    })
    return foundChannel
}
