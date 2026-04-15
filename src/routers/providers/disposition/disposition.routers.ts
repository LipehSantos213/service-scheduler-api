import { FastifyInstance } from "fastify";
import { CreateAvailabilityBody, ResponseAllAvailability, ResponseAvailabilityBody, UpdateAvailabilityBody } from "../../../schemas/availability.schema";
import { Type } from "@sinclair/typebox";
import { deleteAvailability, getAllAvailability, getAvailability, registerNewAvailability, updateAvailability } from "./disposition.controllers";



export async function dispositionRoutersProviders(app: FastifyInstance) {

    const ParamPath = {
        type: "object",
        properties: {
            dayAvailability: {
                type: "integer",
                min: 1
            }
        },
        required: ["dayAvailability"]
    }

    const tag = "AVAILABILITY PROVIDER";

    app.post("/", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            body: CreateAvailabilityBody,
            response: {
                201: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, registerNewAvailability());

    app.get("/:dayAvailability", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            params: ParamPath,
            response: {
                200: ResponseAvailabilityBody
            }
        }
    }, getAvailability());

    app.get("/", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            response: {
                200: ResponseAllAvailability
            }
        }
    }, getAllAvailability());

    app.put("/", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            body: UpdateAvailabilityBody,
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, updateAvailability());

    app.delete("/:idAvailability", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            params: {
                type: "object",
                properties: {
                    idAvailability: {
                        type: "integer",
                        min: 1
                    }
                },
                required: ["idAvailability"]
            },
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, deleteAvailability());
}