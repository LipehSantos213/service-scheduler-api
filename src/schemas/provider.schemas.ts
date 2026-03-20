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
])


export const CreateProviderBody = Type.Object({
    companyName: Type.String({ minLength: 10, maxLength: 200 }),
    description: Type.String({ maxLength: 200 }),
    typeService: TypeServices,
    instagram: Type.Optional(Type.String()),
    emailBusiness: Type.String({format:"email"}),
    phoneBusiness: Type.String({
        pattern: "^\\+?[1-9]\\d{7,14}$",
        minLength: 10,
        maxLength: 11,
    }),
});

