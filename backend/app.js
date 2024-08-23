import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
let users = {};
const port = 3000;
const messageshistory = [];
const app = express();

// const changeColor = () => {
//   const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
//   setBackgroundColor(randomColor);
// };

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// app.use(
//   cors({
//     origin: "*",
//   })
// );

app.get("/", (req, res) => {
  res.send("hellooooeeerrre");
});

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("username", (m) => {
    if (!nameTaken(m.userName)) {
      console.log(socket.id, "assigend to", m);
      // const color = userName[socket.id].color
      users[socket.id] = m;
      console.log("Users", users);
      socket.emit("approved username");
    } else {
      console.log("Username Taken");
      console.log(socket.id, "already has", m);
      socket.emit("duplicate username", m);
    }
  });

  socket.on("fetch history", () => {
    console.log("iiiiiiiiiiiiiiiiiii");
    socket.emit("history", messageshistory);
  });


  socket.on("message", ({ message, room, userName, images }) => {
    console.log({ room, message, userName, images });
    messageshistory.push({ nmessages: message, ruser: userName, images, newroom: room });
    if (room) {
        io.to(room).emit("receive-message", {
            message,
            userName,
            images, // Handle multiple images
            messageshistory,
        });
    } else {
        io.emit("receive-message", { message, userName, images });
    }
});

  socket.on("join-room", (room) => {
    socket.join(room);
  
    socket.emit("history", messageshistory);

    console.log(`user joined ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

});

function nameTaken(userName) {
  for (const socketid in users) {
    if (users[socketid].userName === userName) {
      return true;
    }
  }
  return false;
}
server.listen(port, () => {
  console.log(`server is working at ${port}`);
});
