const {
  addConnectedUser,
  removeConnectedUser,
  getSocketIds,
} = require("./server/sockets/User.socket");

const sockets = {};
let connectedUsers = [];

sockets.init = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connect", (socket) => {
    const { userId } = socket.handshake.query;
    socket.join(socket.id);

    console.log(`client ${userId} is connected with socket ${socket.id}`);

    const user = { userId, socketId: socket.id };
    connectedUsers = addConnectedUser(connectedUsers, user);
    io.emit("online-users-list", connectedUsers);

    socket.on("send-message", (data) => {
      const socketUsers = getSocketIds(connectedUsers, data.recipient);
      if (socketUsers)
        socketUsers.forEach((item) =>
          socket.broadcast.to(item.socketId).emit("receive-message", data.msg)
        );
    });

    socket.on("disconnect", (conn) => {
      connectedUsers = removeConnectedUser(connectedUsers, socket.id);
      io.emit("online-users-list", connectedUsers);
      console.log("user is disconnected", socket.id);
    });
  });
};

module.exports = sockets;
