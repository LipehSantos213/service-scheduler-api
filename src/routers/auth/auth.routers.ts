import { FastifyInstance } from "fastify";
import { LoginBody, AuthResponseBody, MessageResponse } from "../../schemas/auth.schema";
import { Type } from "@sinclair/typebox";
import { loginControllerUser, logoutControllerUser, meControllerUser, refreshTokenRotationController, registerControllerUser, updatePasswordControllerUser, updateProfileControllerUser } from "./auth.controllers";
import { UserCreateBody, UserResponse, UserUpdatePassword, UserUpdateProfileBody } from "../../schemas/user.schema";
import { updateAddressController } from "../providers/address/address.controllers";





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

    const HeaderRefresh = {
        type: "object",
        properties: {
            'x-refresh-token': { type: "string" }
        },
        required: ["x-refresh-token"]
    }

    app.post("/register", {
        schema: {
            tags: [tag],
            querystring: QueryAuth,
            body: UserCreateBody,
            response: {
                201: AuthResponseBody
            }
        }
    }, registerControllerUser(app));

    app.post("/login", {
        schema: {
            tags: [tag],
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
            tags: [tag],
            security: [{ bearerAuth: [] }],
            response: {
                200: UserResponse
            }
        }
    }, meControllerUser);

    app.post("/logout", {
        schema: {
            tags: [tag],
            headers: HeaderRefresh,
            response: {
                200: MessageResponse
            }
        }
    }, logoutControllerUser(app));

    app.post("/refresh", {
        schema: {
            headers: HeaderRefresh,
            response: {
                201: AuthResponseBody
            }
        }
    }, refreshTokenRotationController(app));

    app.put("/me", {
        schema: {
            body: UserUpdateProfileBody,
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, updateProfileControllerUser);

    app.patch("/password", {
        schema: {
            body: UserUpdatePassword,
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, updatePasswordControllerUser);
}   