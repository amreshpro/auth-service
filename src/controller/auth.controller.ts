import { Request, Response } from "express";

class AuthController {
    static async Register(req: Request, res: Response) {
        return res.status(201).json(req?.body);
    }
}

export default AuthController;
