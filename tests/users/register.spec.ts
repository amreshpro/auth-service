import supertest from "supertest";

import app from "../../src/app";

describe("POST /auth/register", () => {
    describe("Given all fields", () => {
        // AAA
        it("should return the 201 status code.", async () => {
            // A-Arrange
            const userData = {
                firstName: "Amresh",
                lastName: "Maurya",
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
    });

    describe("Fields are missing", () => {});
});
