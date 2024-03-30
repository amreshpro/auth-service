/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import prisma from "../../db/prisma";

class AuthController {
    static async Register(req: Request, res: Response) {
        const { firstName, lastName, email, password } = req.body;

        if (firstName && lastName && email && password) {
            const userData = {
                name: `${firstName} ${lastName}`,
                email,
                password,
            };
            const prismaResponse = await prisma.user.create({
                data: userData,
            });

            // eslint-disable-next-line no-console
            console.log(prismaResponse);
            return res.status(201).json({ msg: "Data saved successfully" });
        }
        return res.status(500).json({
            error: "Data Not Saved in our Database",
        });
    }
}

export default AuthController;
