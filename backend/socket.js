function attachSocket(io) {
  io.on("connection", (socket) => {
    // The dashboard joins a room per open conversation to receive its messages live.
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("disconnect", () => {
      // no-op for MVP; hook here later for agent online/offline presence
    });
  });
}

module.exports = attachSocket;
