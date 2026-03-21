import { FastifyInstance } from "fastify";
import { LoginBody, AuthResponseBody } from "../../schemas/auth.schema";
import { Type } from "@sinclair/typebox";
import { loginControllerUser, meControllerUser, registerControllerUser } from "./auth.controllers";
import { UserCreateBody, UserResponse } from "../../schemas/user.schema";





export async function authRouters(app: FastifyInstance) {

    const tag = "AUTH"

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
        schema: {
            querystring: QueryAuth,
            body: UserCreateBody,
            response: {
                201: AuthResponseBody
            }
        }
    }, registerControllerUser(app));

    app.post("/login", {
        schema: {
            querystring: QueryAuth,
            body: LoginBody,
            response: {
                201: AuthResponseBody
            }
        }
    }, loginControllerUser(app));

    app.get("/me", {
        preHandler: [app.getCurrentUser],
        schema: {
            response: {
                200: UserResponse
            }
        }
    }, meControllerUser())
}   