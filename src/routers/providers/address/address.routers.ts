import { FastifyInstance } from "fastify";
import { CreateAddressProvider, ResponseAddressProvider, UpdateAddressProvider } from "../../../schemas/address.schema";
import { Type } from "@sinclair/typebox";
import { createAddressController, deleteAddressController, getAddressController, updateAddressController } from "./address.controllers";



export function addressRoutersProvider(app: FastifyInstance) {
    const tag = "ADDRESS PROVIDER";

    app.post("/", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            body: CreateAddressProvider,
            response: {
                201: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, createAddressController());

    app.get("/", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],
        schema: {
            response: {
                200: ResponseAddressProvider
            }
        }
    }, getAddressController());

    app.put("/", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            body: UpdateAddressProvider,
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, updateAddressController());

    app.delete("/", {
        preHandler: [
            app.getCurrentUser,
            app.requireRole("PROVIDER")
        ],

        schema: {
            response: {
                200: Type.Object({
                    message: Type.String()
                })
            }
        }
    }, deleteAddressController());
}