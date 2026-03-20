import { Type, Static } from "@sinclair/typebox";
import { CreateProviderBody } from "./provider.schemas";



export const UserCreateBody = Type.Object({
    name: Type.String({ minLength: 8, maxLength: 200 }),
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8 }),
    phone: Type.String({
        pattern: "^\\+?[1-9]\\d{7,14}$",
        minLength: 10,
        maxLength: 11,
    }),
    provider: Type.Optional(CreateProviderBody),
});

export type UserCreateType = Static<typeof UserCreateBody>;





export const UserRole = Type.Union([
    Type.Literal("CUSTOMER"), // Cliente
    Type.Literal("PROVIDER"), // Prestador
    Type.Literal("ADMIN")
])

export const UserResponse = Type.Object({
    name: Type.String(),
    email: Type.String(),
    role: UserRole,
    createdAt: Type.String({ format: "date-time" }),
});

export type UserResponseType = Static<typeof UserResponse>;
