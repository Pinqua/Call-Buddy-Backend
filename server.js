const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const PORT = process.env.PORT || 9000;

app.get("/", (req, res) => {
  res.send("Welcome to Call Budddy.");
});

//Video NameSpace
const VideosNsp = io.of("/media");

//Chat NameSpace
const ChatsNsp = io.of("/chats");

VideosNsp.on("connection", (socket) => {
  socket.on("join-media", (ID) => {
    socket.join(ID);

    socket.on("end-call", (ID) => {
      socket.to(ID).broadcast.emit("call-ended");
    });

    socket.on("call-user", (Info, ID) => {
      socket.to(ID).broadcast.emit("incoming-call", Info);
    });
    socket.on("busy", (ID) => {
      socket.to(ID).broadcast.emit("user-busy");
    });

    socket.on("call-rejected", (ID) => {
      socket.to(ID).broadcast.emit("call--rejected");
    });

    socket.on("call-attended", (Info, ID) => {
      socket.to(ID).broadcast.emit("call--attended", Info);
    });

    socket.on("user-info", (Info, ID) => {
      socket.to(ID).broadcast.emit("user--info", Info);
    });
    socket.on("switch-cam", (camera, userID) => {
      VideosNsp.to(ID).emit("switch-camera", camera, userID);
    });
    socket.on("disconnect", () => {
      VideosNsp.emit("user-disconnected", ID);
    });
  });
});

ChatsNsp.on("connection", (socket) => {
  socket.on("join-chat", (ID) => {
    socket.join(ID);
    socket.on("chat-message", (msg, ID) => {
      socket.to(ID).broadcast.emit("chat-msg", msg);
    });
  });
});

server.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});
