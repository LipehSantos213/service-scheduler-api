import { FastifyInstance } from "fastify";
import { CreateServiceBody as CreateServiceBody, ResponseService, UpdateServiceBody } from "../../../schemas/services.schema";
import { Type } from "@sinclair/typebox";
import { activateServiceController, createServiceController, deleteServiceController, disableServiceController, getAllServicesController, getServiceController, updateServiceController } from "./service.controllers";

export async function serviceRoutersProvider(app: FastifyInstance) {
    const tag = "SERVICE PROVIDERS";

    app.post("/", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            security: [{ bearerAuth: [] }],
            tags: [tag],
            body: CreateServiceBody,
            response: {
                201: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, createServiceController);

    app.get("/", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            security: [{ bearerAuth: [] }],
            tags: [tag],
            response: {
                200: Type.Array(ResponseService)
            }
        }
    }, getAllServicesController);

    app.get("/:idService", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            security: [{ bearerAuth: [] }],
            tags: [tag],
            params: Type.Object({
                idService: Type.Integer({
                    minimum: 1
                })
            }),
            response: {
                200: ResponseService
            }
        }
    }, getServiceController);

    app.put("/:idService", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            security: [{ bearerAuth: [] }],
            tags: [tag],
            params: Type.Object({
                idService: Type.Integer({
                    minimum: 1
                })
            }),
            body: UpdateServiceBody,
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, updateServiceController);

    app.delete("/:idService", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            security: [{ bearerAuth: [] }],
            tags: [tag],
            params: Type.Object({
                idService: Type.Integer({
                    minimum: 1
                })
            }),
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            },
        }
    }, deleteServiceController);

    app.patch("/:idService/disable", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            security: [{ bearerAuth: [] }],
            tags: [tag],
            params: Type.Object({
                idService: Type.Integer({
                    minimum: 1
                })
            }),
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, disableServiceController);

    app.patch("/:idService/activate", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            security: [{ bearerAuth: [] }],
            tags: [tag],
            params: Type.Object({
                idService: Type.Integer({
                    minimum: 1
                })
            }),
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, activateServiceController);
}