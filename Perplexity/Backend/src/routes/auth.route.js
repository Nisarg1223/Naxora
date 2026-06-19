import { Router } from "express";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { getMe, login, RegisterController } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post('/register', registerValidator, RegisterController);
authRouter.post('/login', loginValidator, login);
authRouter.get("/get-me", authMiddleware, getMe);

export default authRouter;