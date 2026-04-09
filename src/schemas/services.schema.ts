import { Type, Static } from "@sinclair/typebox";

export const CreateServiceBoby = Type.Object({
    nameService: Type.String({ minLength: 10, maxLength: 200 }),
    description: Type.String({ minLength: 10, maxLength: 200 }),
    duration: Type.Integer(), // em minutos
    prince: Type.Integer() // Preço
});

export type CreateServiceType = Static<typeof CreateServiceBoby>;

export const ResponseService = Type.Object({
    nameService: Type.String(),
    description: Type.String(),
    duration: Type.Integer(),
    prince: Type.Integer(),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" })
});

export const UpdateServiceBody = Type.Object({
    nameService: Type.Optional(Type.String()),
    description: Type.Optional(Type.Integer()),
    duration: Type.Optional(Type.Integer()),
    prince: Type.Optional(Type.Integer()),
});

export type UpdateServiceType = Static<typeof UpdateServiceBody>;