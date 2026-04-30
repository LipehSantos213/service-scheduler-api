import { Type, Static } from "@sinclair/typebox";
import { UserResponse } from "./user.schema";
import { ResponseService } from "./services.schema";
import { ResponseAddressProvider } from "./address.schema";
import { ResponseAvailabilityBody } from "./availability.schema";

export const StatusAgendamentoBody = Type.Union([
    Type.Literal("WAITING"),
    Type.Literal("CONFIRMED"),
    Type.Literal("CANCELLED"),
    Type.Literal("RESCHEDULED"),
    Type.Literal("NO_SHOW"),
    Type.Literal("FINISHED")
]);

export type StatusAgendamentoType = Static<typeof StatusAgendamentoBody>;

const CanceledBy = Type.Union([
    Type.Literal("CLIENT"),
    Type.Literal("PROVIDER"),
    Type.Literal("SYSTEM")
]);

export const ResponseSchedulingBody = Type.Object({
    id: Type.Integer(),
    status: StatusAgendamentoBody,
    date: Type.String({ format: "date-time" }),
    startIn: Type.Integer(),
    endIn: Type.Integer(),
    client: UserResponse,
    service: ResponseService,
    address: ResponseAddressProvider,
    availability: ResponseAvailabilityBody,
    canceledBy: Type.Optional(CanceledBy),
    canceledIn: Type.Optional(Type.String({ format: "date-time" })),
    canceledReason: Type.Optional(Type.String()),
    createdAt: Type.String({ format: "date-time" })
});

export type ResponseSchedulingType = Static<typeof ResponseSchedulingBody>;