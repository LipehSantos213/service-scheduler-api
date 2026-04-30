import { Type, Static } from "@sinclair/typebox";
import { ProviderPublicResponseSchema } from "./provider.schemas";

export const CreateServiceBody = Type.Object({
    nameService: Type.String({ minLength: 10, maxLength: 200 }),
    description: Type.String({ minLength: 10, maxLength: 200 }),
    duration: Type.Integer(), // em minutos
    price: Type.Integer() // em centavos
});

export type CreateServiceType = Static<typeof CreateServiceBody>;

export const ResponseService = Type.Object({
    nameService: Type.String(),
    description: Type.String(),
    duration: Type.Integer(),
    price: Type.Integer(),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" })
});

export type ResponseServiceType = Static<typeof ResponseService>;

export const UpdateServiceBody = Type.Object({
    nameService: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    duration: Type.Optional(Type.Integer()), // em minutos
    price: Type.Optional(Type.Integer()), // em centavos
});

export type UpdateServiceType = Static<typeof UpdateServiceBody>;

export const ResponseServicePublicSchema = Type.Object({
    nameService: Type.String(),
    description: Type.String(),
    duration: Type.Integer(),
    price: Type.Integer(),
    createdAt: Type.String({ format: "date-time" }),
    provider: Type.Optional(ProviderPublicResponseSchema)
});

export type ResponseServicePublicType = Static<typeof ResponseServicePublicSchema>;