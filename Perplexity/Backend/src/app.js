import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import morgan from 'morgan'
import cors from 'cors'
import chatRouter from './routes/chat.routes.js';
const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","DELETE"]
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/auth",authRouter);
app.use("/api/chats",chatRouter);
app.use("/public", express.static("public"));
export default app;