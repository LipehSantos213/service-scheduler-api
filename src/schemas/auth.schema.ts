import { Type, Static } from "@sinclair/typebox";
import { UserResponse } from "./user.schema";


export const LoginBody = Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String(),
});

export type LoginType = Static<typeof LoginBody>;



export const RegisterBody = Type.Object({
    name: Type.String({ minLength: 8, maxLength: 200 }),
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8 }),
    phone: Type.String({
        pattern: "^\\+?[1-9]\\d{7,14}$",
        minLength: 10,
        maxLength: 11,
    }),
});

export type RegisterBodyType = Static<typeof RegisterBody>;

export const AuthResponseBody = Type.Object({
    accessToken: Type.String(),
    // Front-End vai ser um Web-Site, então enviar o refresh token no HttpOnly(cooking)
    refreshToken: Type.String(),
    user: UserResponse,
});