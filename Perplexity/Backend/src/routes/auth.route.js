import { Router } from "express";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import {getMe, login, RegisterController, verifyEmail} from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const authRouter = Router();



authRouter.post('/register',registerValidator,RegisterController);
authRouter.post('/login',loginValidator,login)
authRouter.get('/verify-email',verifyEmail)
authRouter.get("/get-me",authMiddleware,getMe);
export default authRouter;