/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from "express";
import prisma from "../../db/prisma";
import logger from "../../config/logger";
import bcrypt from "bcryptjs";

class AuthController {
    static async Register(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;

            if (name && email && password) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const hashedPassword = await bcrypt.hash(password, 10);
                const userData = {
                    name,
                    email,
                    password: hashedPassword,
                };
                const prismaResponse = await prisma.user.create({
                    data: userData,
                });

                // eslint-disable-next-line no-console
                console.log(prismaResponse);
                if (prismaResponse) {
                    return res
                        .status(201)
                        .json({ msg: "Data saved successfully" });
                }
            }
            return res.status(500).json({
                error: "Data Not Saved in our Database",
            });
        } catch (error) {
            logger.error(error);
        }
    }

    static async AllUser(req: Request, res: Response) {
        const Users = await prisma.user.findMany({});
        if (Users) {
            res.status(200).json(Users);
        } else {
            res.status(501).json({
                message: "Something went wrong!",
            });
        }
    }
    static async getUserByEmail(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (email) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });

                if (user) {
                    res.status(200).json(user);
                } else {
                    res.json(200).json({ message: "Not found" });
                }
            } else {
                res.status(200).json({
                    message: "this email is not registred in out database",
                });
            }
        } catch (error) {
            logger.error(error);
            res.status(500).json({ error: "Something went wrong" });
        }
    }

    static async deleteUserByEmail(req: Request, res: Response) {
        try {
            const { email, password }: { email: string; password: string } =
                req.body;
            if (email && password) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });

                const userPassword = user!.password || "";
                const isRealUser = await bcrypt.compare(password, userPassword);
                // eslint-disable-next-line no-console
                console.log("realuser", isRealUser);
                if (isRealUser) {
                    const deleteUser = await prisma.user.delete({
                        where: {
                            email,
                        },
                    });
                    // eslint-disable-next-line no-console
                    console.log("deleteResp", deleteUser);
                    if (deleteUser) {
                        return res
                            .status(200)
                            .json({ message: "Data deleted successfully" });
                    } else {
                        return res.status(500).json({
                            message:
                                "Data will not deleted .Something went wrong",
                        });
                    }
                } else {
                    return res
                        .json(200)
                        .json({ message: "Something went wrong" });
                }
            } else {
                return res.status(200).json({
                    message: "this email is not registred in out database",
                });
            }
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ error: "Something went wrong" });
        }
    }
}

export default AuthController;
