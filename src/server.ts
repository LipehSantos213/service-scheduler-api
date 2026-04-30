
import Fastify from "fastify";
import "dotenv/config";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

import jwt from "@fastify/jwt";
import { authPlugin } from "./plugins/auth";
import { authRouters } from "./routers/auth/auth.routers";
import { addressRoutersProvider } from "./routers/providers/address/address.routers";
import { dispositionRoutersProviders } from "./routers/providers/disposition/disposition.routers";
import { AppError } from "./errors/http.errors";
import { serviceRoutersProvider } from "./routers/providers/service/service.routers";

import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { schedulingRoutersProviders } from "./routers/providers/scheduling/scheduling.routers";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const SECRET_KEY = process.env.SECRET_KEY


const fastify = Fastify({
    logger: {
        level: "info",
    }
});
async function startServer() {

    // Registrando helmet para segurança do Header
    await fastify.register(helmet);

    // Registro cors para permitir que o Front-End acesse os
    // recursos da API
    await fastify.register(cors, {
        origin: "http:localhost:3000",
        credentials: true,
    });

    // Registro do rateLimit para limitar a quantidade de
    // request à um IP
    await fastify.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute"
    });

    await fastify.register(jwt, {
        secret: SECRET_KEY || "key",
    });

    await fastify.register(swagger, {
        openapi: {
            info: {
                title: "API Devs",
                description: "Documentação da API",
                version: "1.0.0"
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                }
            }
        }
    });

    await fastify.register(swaggerUI, {
        routePrefix: "/docs"
    })

    await fastify.register(authPlugin);

    fastify.setErrorHandler((error, _request, reply) => {
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({
                statusCode: error.statusCode,
                error: error.error,
                message: error.message
            });
        }

        // erro inesperado
        return reply.status(500).send({
            error: "Internal Server Error",
        });
    });

    fastify.get("/", async (req, reply) => {
        return {
            message: "Api executando"
        }
    });

    // ================== Registro das Rotas ==================
    await fastify.register(authRouters, {
        prefix: "api/v1/auth"
    });


    await fastify.register(addressRoutersProvider, {
        prefix: "api/v1/providers/address"
    });

    await fastify.register(dispositionRoutersProviders, {
        prefix: "api/v1/providers/disposition"
    });

    await fastify.register(serviceRoutersProvider, {
        prefix: "api/v1/providers/services"
    });

    await fastify.register(schedulingRoutersProviders, {
        prefix: "api/v1/providers/scheduling"
    });

    // ================== Fim do Registro ==================

    await fastify.listen({
        port: 3000, host: "0.0.0.0"
    });
    console.log("Servidor sendo executado na porta '3000'");
}

startServer()