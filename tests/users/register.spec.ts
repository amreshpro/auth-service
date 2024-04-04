import supertest from "supertest";
import { isJWT } from "../../src/utils/index";
import app from "../../src/app";
import { sign } from "crypto";
import fs from "fs";
import path from "path";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";

describe("POST /auth/register", () => {
    describe("Given all fields", () => {
        // AAA
        it.skip("should return the 201 status code.", async () => {
            // A-Arrange
            const userData = {
                name: "Amresh",
                email: "amresh.terminal@gmail.com",
                password: "secret",
            };
            // A-Act
            const response = await supertest(app)
                .post("/auth/register")
                .send(userData);
            // A-Assert
            expect(response.statusCode).toBe(201);
        });

        it("it should return valid json response", async () => {
            const response = await supertest(app)
                .post("/auth/register")
                .send("dgw");

            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it(" Should return a access token", async () => {
            // let accessToken: null | string;
            // let refreshToken: null | string;
            const tokens = {
                accessToken: "",
                refreshToken: "",
            };
            // A-Arrange

            let privateKey: Buffer;
            // let publicKey: Buffer;
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, "../../certs/private.pem"),
                );
                // publicKey = fs.readFileSync(
                //     path.join(__dirname, "../../certs/public.pem"),
                // );

                const userData = {
                    name: "Amresh Maurya",
                    email: "maxamresh@gmail.com",
                    password: 1234,
                };
                interface Headers {
                    ["set-cookie"]: string[];
                }
                // A-Act
                const response = await supertest(app)
                    .post("/auth/sign")
                    .send(userData);

                // A-Assert
                const cookie =
                    (response.headers as Headers)["set-cookie"] || [];
                cookie.forEach((cookie) => {
                    if (cookie.startsWith("accessToken=")) {
                        tokens.accessToken = cookie.split(";")[0].split("=")[1];
                    }

                    // if (cookie.startsWith("refreshToken=")) {
                    //     tokens.refreshToken = cookie.split(";")[0].split("=")[1];
                    // }
                });
                expect(isJWT(tokens.accessToken)).toBeTruthy();
                // expect(isJWT(tokens.refreshToken)).toBeTruthy()
                // expect(tokens.refreshToken).not.toBe('');
                expect(tokens.accessToken).not.toBe("");
            } catch (err) {
                const error = createHttpError(
                    500,
                    "Error while reading private key",
                );

                return;
            }
        });
    });
});
