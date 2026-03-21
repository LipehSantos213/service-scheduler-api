import { Type, Static } from "@sinclair/typebox";
import { CreateProviderBody, ProviderResponseBody, ProviderUpdateProfile } from "./provider.schemas";



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


export const UserUpdateProfileBody = Type.Object({
    photo: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    email: Type.Optional(Type.String({ format: "email" })),
    phone: Type.Optional(Type.String({
        pattern: "^\\+?[1-9]\\d{7,14}$",
        minLength: 10,
        maxLength: 11,
    })),
    provider: Type.Optional(ProviderUpdateProfile)
});

export type UserUpdateProfileType = Static<typeof UserUpdateProfileBody>;

export const UserUpdatePassword = Type.Object({
    currentPassword: Type.String(),
    newPassword: Type.String({ minLength: 8 }),
})

export const UserRole = Type.Union([
    Type.Literal("CUSTOMER"), // Cliente
    Type.Literal("PROVIDER"), // Prestador
    Type.Literal("ADMIN")
])

export const UserResponse = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    email: Type.String(),
    role: UserRole,
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    provider: Type.Optional(ProviderResponseBody)
});

export type UserResponseType = Static<typeof UserResponse>;
