/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import AuthController from "../controller/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", async (req, res) =>
    AuthController.Register(req, res),
);

export default authRouter;
