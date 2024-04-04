/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response } from "express";
import prisma from "../../db/prisma";
import logger from "../../config/logger";
// import { Config } from "../../config/index";
import bcrypt from "bcryptjs";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";

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
            return res.status(500).json({
                error,
            });
        }
    }

    static async SignIn(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const tokens = {
                accessToken: "",
                refreshToken: "",
            };

            if (email && password) {
                const user = await prisma.user.findUnique({
                    where: email,
                });

                const payload: JwtPayload = {
                    sub: String(user?.id),
                    role: "USER",
                };

                let privateKey: Buffer;
                // let publicKey: Buffer;

                try {
                    privateKey = fs.readFileSync(
                        path.join(__dirname, "../../certs/private.pem"),
                    );
                    // publicKey = fs.readFileSync(
                    //     path.join(__dirname, "../../certs/public.pem"),
                    // );
                    res.cookie("accessToken", tokens.accessToken, {
                        domain: "localhost",
                        sameSite: "strict",
                        maxAge: 1000 * 60 * 60, // 1h
                        httpOnly: true, // Very important
                    });

                    // res.cookie("refreshToken", refreshToken, {
                    //     domain: "localhost",
                    //     sameSite: "strict",
                    //     maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                    //     httpOnly: true, // Very important
                    // });

                    res.status(201);
                } catch (err) {
                    const error = createHttpError(
                        500,
                        "Error while reading private key",
                    );
                    next(error);
                    return;
                }

                tokens.accessToken = sign(payload, privateKey, {
                    expiresIn: "1h",
                    algorithm: "RS256",
                    issuer: "auth-service",
                    subject: "",
                });

                // eslint-disable-next-line no-console
                console.log("prismaresponse", user);
                if (user) {
                    res.cookie("accessToken", tokens.accessToken, {
                        httpOnly: true, //very important
                        domain: "localhost",
                        sameSite: "strict",
                        maxAge: 1000 * 60 * 60, // 1hr
                    });

                    res.cookie("refreshToken", tokens.refreshToken, {
                        httpOnly: true, //very important
                        domain: "localhost",
                        sameSite: "strict",
                        maxAge: 1000 * 60 * 60 * 24 * 365, // 365 dasy
                    });

                    return res.status(201).json({ msg: "SignIn successfully" });
                }
            }

            return res.status(500).json({
                error: "Email is registered in our Database",
            });
        } catch (error) {
            logger.error(error);
            return res.status(500).json({
                error,
            });
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
