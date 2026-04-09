import { Type, Static } from "@sinclair/typebox";


export const TypeServices = Type.Union([
    Type.Literal("BARBER"), // BARBEIRO
    Type.Literal("MANICURE"),
    Type.Literal("DENTIST"),
    Type.Literal("PERSONAL_TRAINER"),
    Type.Literal("MASSAGE"),
    Type.Literal("PLUMBER"), // ENCANADOR
    Type.Literal("ELECTRICIAN"), // ELETRICISTA
    Type.Literal("AESTHETICS"), // ESTETICA
    Type.Literal("PHYSIOTHERAPY")
]);

export const CreateProviderBody = Type.Object({
    companyName: Type.String({ minLength: 10, maxLength: 200 }),
    description: Type.String({ maxLength: 200 }),
    typeService: TypeServices,
    instagram: Type.Optional(Type.String()),
    emailBusiness: Type.String({ format: "email" }),
    phoneBusiness: Type.String({
        pattern: "^\\+?[1-9]\\d{7,14}$",
        minLength: 10,
        maxLength: 11,
    }),
});

export const ProviderUpdateProfile = Type.Object({
    companyName: Type.Optional(Type.String({ minLength: 10, maxLength: 200 })),
    description: Type.Optional(Type.String({ maxLength: 200 })),
    typeService: Type.Optional(TypeServices),
    instagram: Type.Optional(Type.String()),
    emailBusiness: Type.Optional(Type.String({ format: "email" })),
    phoneBusiness: Type.Optional(Type.String({
        pattern: "^\\+?[1-9]\\d{7,14}$",
        minLength: 10,
        maxLength: 11,
    }))
});

export const ProviderResponseBody = Type.Object({
    companyName: Type.String(),
    description: Type.String(),
    typeService: Type.String(),
    instagram: Type.Optional(Type.String()),
    emailBusiness: Type.String(),
    phoneBusiness: Type.String(),
    updatedAt: Type.String({ format: "date-time" }),
});