"use client";

import React, { useEffect, useState, useMemo } from "react";  
import { useRouter, useSearchParams } from "next/navigation";

function Joinroom() {
  const [roomName, setRoomName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const userName = searchParams.get("user");

  function joinRoom() {
    console.log(` Room ${roomName} joined`);
    //socket.emit("join-room", roomName);
    router.push(`/Chatroom?user=${userName}&room=${roomName}`);
  }

  return (
    <>
      <div className="bg-gradient-to-b from-green-600 to-green-200 h-[100vh]">
        <div className="flex flex-col justify-center h-screen mx-auto w-max">
          <div className="flex flex-col items-center justify-center gap-3 ">
            <h5 className="text-3xl">Join Room</h5>
            <input
            className="p-2 m-2 text-black bg-white rounded-lg w-1/8 shadow-m"
            type="text"
            name="userName"
            placeholder="Enter Room "
            value={roomName}
            onChange={(e) => {
              setRoomName(e.target.value); 
            }}
          />
            {/* <input
              className="p-2 m-2 text-black bg-white rounded-lg w-1/8 shadow-m"
              // style={{ border: "1px solid black" }}
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            /> */}

            <button
              className="w-40 p-3 m-2 font-semibold text-white bg-black rounded-lg shadow-md hover:bg-gray-700"
              onClick={() => joinRoom()}
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Joinroom;
