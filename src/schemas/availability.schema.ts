import { Type, Static } from "@sinclair/typebox";


export const CreateAvailabilityBody = Type.Object({
    dayWeek: Type.Integer({
        minimum: 1, maximum: 6
    }), // 0:Domingo, 1:Segunda ... 6:Sabado
    startTime: Type.String({
        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
        description: "Horário no formato HH:mm (ex: 08:30)"
    }),
    endTime: Type.String({
        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
        description: "Horário no formato HH:mm (ex: 08:30)"
    }),
    interval: Type.Integer({ minimum: 1, maximum: 30 }), // Em minutos
});

export type CreateAvailabilityType = Static<typeof CreateAvailabilityBody>;

export const UpdateAvailabilityBody = Type.Object({
    dayWeek: Type.Optional(Type.Integer({
        minimum: 1, maximum: 6
    })), // 0:Domingo, 1:Segunda ... 6:Sabado
    startTime: Type.Optional(Type.String({
        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
        description: "Horário no formato HH:mm (ex: 08:30)"
    })),
    endTime: Type.Optional(Type.String({
        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
        description: "Horário no formato HH:mm (ex: 08:30)"
    })),
    interval: Type.Optional(Type.Integer({ minimum: 1, maximum: 30 })),
});

export type UpdateAvailabilityType = Static<typeof UpdateAvailabilityBody>;

export const ResponseAllAvailability = Type.Array(Type.Object({
    dayWeek: Type.Integer(),
    data: Type.Array(Type.Object({
        id: Type.Integer(),
        startTime: Type.String({
            pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
            description: "Horário no formato HH:mm (ex: 08:30)"
        }),
        endTime: Type.String({
            pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
            description: "Horário no formato HH:mm (ex: 08:30)"
        }),
        interval: Type.Integer({ minimum: 1, maximum: 30 })
    }))
}));

export type ResponseAllAvailabilityType = Static<typeof ResponseAllAvailability>;


export const ResponseAvailabilityBody = Type.Object({
    id: Type.Integer(),
    dayWeek: Type.Integer(),
    startTime: Type.String(),
    endTime: Type.String(),
    createdAt: Type.String(),
    updatedAt: Type.String()
});

export type ResponseAvailabilityType = Static<typeof ResponseAvailabilityBody>;

export const ListResponseAvailabilityBody = Type.Array(ResponseAvailabilityBody);