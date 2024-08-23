import { io } from "socket.io-client";
const socket = io.connect("ws://localhost:3000")
export default socket