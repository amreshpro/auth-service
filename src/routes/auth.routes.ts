/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import AuthController from "../controller/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", async (req, res) =>
    AuthController.Register(req, res),
);
authRouter.get("/users", async (req, res) => AuthController.AllUser(req, res));
authRouter.post("/users", async (req, res) =>
    AuthController.getUserByEmail(req, res),
);
authRouter.delete("/users", async (req, res) =>
    AuthController.deleteUserByEmail(req, res),
);

export default authRouter;
