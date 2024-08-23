"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import socket from "./connect/connection";
import Joinroom from "./Joinroom/Joinroom";
import Chatroom from "./Chatroom/Chatroom";

export default function Page() {
  const [userName, setUserName] = useState("");
  const [takenName, setTakenName] = useState(true);
  const router = useRouter();

  function goto() {
    if (userName) {
      socket.emit("username", { userName });
      socket.on("approved username", () => {
        router.push(`./Joinroom?user=${userName}`);
      });
      socket.on("duplicate username", (m) => {
        setTakenName(`Username ${m.userName} is taken.`);
      });
    }
  }

  return (
    <>
     <div className="bg-gradient-to-b from-green-200 to-green-600 h-[100vh]">
      <div className="flex flex-col justify-center h-screen mx-auto w-max ">
        <div className="flex flex-col items-center justify-center gap-3 ">
        <h5 className="text-3xl"> Enter User Name</h5>
          <input
            className="p-2 m-2 text-black bg-white rounded-lg w-1/8 shadow-m"
            type="text"
            name="userName"
            placeholder="Enter your User name..."
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value); 
            }}
          />
          {!takenName ? "" : <span>{takenName}</span>}
          <button
            className="w-40 p-3 m-2 font-semibold text-white bg-black rounded-lg shadow-md hover:bg-gray-700"
            onClick={() => goto()}
          >
            Enter
          </button>

          {/* <Joinroom/> */}

          {/* <Chatroom/> */}
        </div>
      </div>
      </div>
    </>
  );
}
