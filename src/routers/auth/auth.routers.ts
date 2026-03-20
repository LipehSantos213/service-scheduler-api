import { FastifyInstance } from "fastify";
import { RegisterBody, RegisterResponse } from "../../schemas/auth.schema";
import { Type } from "@sinclair/typebox";
import { registerControllerUser } from "./auth.controllers";
import { UserCreateBody } from "../../schemas/user.schema";





export async function authRouters(app: FastifyInstance) {

    const QueryAuth = {
        type: "object",
        properties: {
            role: {
                type: "string",
                enum: ["CUSTOMER", "PROVIDER"]
            }
        },
        required: ["role"]
    }


    app.post("/register", {
        preHandler: [
            // pegar usuario pelo token header
        ],
        schema: {
            querystring: QueryAuth,
            body: UserCreateBody,
            response: {
                201: RegisterResponse
            }
        }
    }, registerControllerUser(app));
}