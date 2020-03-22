export default {
  connect: function(gameId) {
    // Now that you are connected, you can join channels with a topic:
    const topic = `game:${gameId}`;
    let channel = window.socket.channel(topic, {})
    channel.join()
      .receive("ok", resp => { console.log(`Joined '${topic}' successfully`, resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })
  },
}
