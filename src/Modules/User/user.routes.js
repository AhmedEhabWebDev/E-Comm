import { Router } from "express";
// controllers
import * as controller from "./user.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";

const userRouter = Router();
const { errorHandler } = Middlewares;

userRouter.post("/register", errorHandler(controller.registerUser));

userRouter.put("/update/:_id", errorHandler(controller.updateUser));

userRouter.post("/login", errorHandler(controller.signIn));

export { userRouter };