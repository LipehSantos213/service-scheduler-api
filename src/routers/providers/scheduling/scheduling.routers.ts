import { FastifyInstance } from "fastify";
import { ResponseSchedulingBody, StatusAgendamentoBody } from "../../../schemas/scheduling.schema";
import { Type } from "@sinclair/typebox";
import { confirmAppointmentController, getAllAppointmentsController, getAppointmentByIdController, getAppointmentWithStatusController } from "./scheduling.controllers";




export async function schedulingRoutersProviders(app: FastifyInstance) {
    const tag = ["SCHEDULING - PROVIDER"];
    const preHandler = [
        app.getCurrentUser,
        app.requireRole("PROVIDER")
    ]

    app.get("/", {
        preHandler,
        schema: {
            security: [{ bearerAuth: [] }],
            tags: tag,
            response: {
                200: Type.Array(ResponseSchedulingBody)
            }
        }
    }, getAllAppointmentsController());

    app.get("/:serviceId", {
        preHandler,
        schema: {
            security: [{ bearerAuth: [] }],
            tags: tag,
            response: {
                200: ResponseSchedulingBody
            }
        }
    }, getAppointmentByIdController());

    app.get("/status", {
        preHandler,
        schema: {
            security: [{ bearerAuth: [] }],
            tags: tag,
            querystring: Type.Object({
                status: StatusAgendamentoBody
            }),
            response: {
                200: ResponseSchedulingBody
            }
        }
    }, getAppointmentWithStatusController());

    app.patch("/:serviceId/confirm", {
        preHandler,
        schema: {
            security: [{ bearerAuth: [] }],
            tags: tag,
            params: Type.Object({
                serviceId: Type.Integer({ minimum: 1 })
            }),
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, confirmAppointmentController());
}