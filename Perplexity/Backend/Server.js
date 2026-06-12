import dotenv from "dotenv";
dotenv.config({ override: true });
import app from "./src/app.js";
import connecttoDB from "./src/config/DataBase.js";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");
import http from "http"
import { initSocket } from "./src/socket/server.socket.js";
const httpServer = http.createServer(app);
initSocket(httpServer);

connecttoDB();
httpServer.listen(3000, function () {
  console.log("server is running on port 3000");
});
