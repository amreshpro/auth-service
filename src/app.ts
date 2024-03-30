import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import authRouter from "./routes/auth.routes";

const app = express();

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

//middleware
app.use(express.json());
app.use(globalErrorHandler);
app.use("/auth", authRouter);

export default app;
