import { Type, Static } from "@sinclair/typebox";


export const CreateAddressProvider = Type.Object({
    state:Type.String(),
    city: Type.String(),
    neighborhood:Type.String(),
    road: Type.String(),
    number: Type.String(),
    cep: Type.String(),
    reference: Type.String(),
});

export type CreateAddressProviderType = Static<typeof CreateAddressProvider>;


export const ResponseAddressProvider = Type.Object({
    id:Type.Integer(),
    state:Type.String(),
    city: Type.String(),
    neighborhood:Type.String(),
    road: Type.String(),
    number: Type.String(),
    cep: Type.String(),
    reference: Type.String(),
    createdAt: Type.String({format:"date-time"}),
    updatedAt: Type.String({format:"date-time"})
});

export type ResponseAddressProviderType = Static<typeof ResponseAddressProvider>;


export const UpdateAddressProvider = Type.Object({
    state: Type.Optional(Type.String()),
    city: Type.Optional(Type.String()),
    neighborhood:Type.Optional(Type.String()),
    road: Type.Optional(Type.String()),
    number: Type.Optional(Type.String()),
    cep: Type.Optional(Type.String()),
    reference: Type.Optional(Type.String()),
});

export type UpdateAddressProviderType = Static<typeof UpdateAddressProvider>;