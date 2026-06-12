import { io } from "socket.io-client";

export const initializeSocketConnection = ()=>{
    const socketio = io("http://localhost:3000",{
        withCredentials:true
    })

    socketio.on("connect",()=>{
        console.log("connected to socket.Io server");
    })
}