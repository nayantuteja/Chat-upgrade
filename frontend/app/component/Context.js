
import React, { useState } from 'react';
import Joinroom from '../Joinroom/Joinroom';
import { comment } from 'postcss';

function JoinRoomComponent() {
  const [roomName, setRoomName] = useState("");

  const handleRoomNameChange = (e) => {
    setRoomName(e.target.value);
  }

  return (
    <>
      <Joinroom roomName={roomName} onRoomNameChange={handleRoomNameChange} />
    </>
  );
}

export default JoinRoomComponent;





















// 'use client'

// import React, { useEffect, useState, useMemo } from 'react';
// // import { io } from "socket.io-client";
// import socket from '../connect/connection';


// function App() {

//   // const socket = useMemo(() => io("http://localhost:3000"), []);
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("")
//   const [room, setRoom] = useState("")
//   const [socketID, setSocketID] = useState("")
//   // const [roomName, setRoomName] = useState("")


//   console.log(messages)


//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Sending message", message)
//     socket.emit("message", { message, room });
//     setMessage("")
//   }
//   // const joinRoomHandler = (e) => {
//   //   e.preventDefault();
//   //   socket.emit('join-room', roomName)
//   //   setRoomName(""); 
//   // }

//   // useEffect(() => {
//   //   socket.on("connect", () => {
//   //     setSocketID(socket.id)
//   //     console.log("connected", socket.id);

//   //   });

//   //   socket.on("recive-message", (data) => {
//   //     console.log("Mesage recieved", data)
//   //     setMessages((messages) => [...messages, data]);
//   //   });

//   //   socket.on("welcome", (s) => {
//   //     console.log(s);
//   //   })

//   //   // return() => {
//   //   //   socket.disconnect();
//   //   // };   
//   //   console.log("hello")

//   // }, []);
//   return (
//     <>
//       {/* <h1>{socket.id}</h1> */}

//       <form onSubmit={handleSubmit}>

//         {/* <input className='rounded-lg w-1/8 bg-white text-black m-2 p-2 shadow-m'
//           style={{ border: '1px solid black' }}
//           placeholder="Enter Message"
//           value={message}
//           onChange={e => setMessage(e.target.value)} /> */}

//         <input className='rounded-lg w-1/8 bg-white text-black m-2 p-2 shadow-m'
//           style={{ border: '1px solid black' }}
//           placeholder="Enter Room"
//           value={room}
//           onChange={e => setRoom(e.target.value)}
//         />

//         <button type='submit' variant='contained' color='primary'>Send</button>
//       </form>

      

//     </>

//   )
// }

// export default App