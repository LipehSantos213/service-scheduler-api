
import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
// import "dotenv/config";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

import jwt from "@fastify/jwt";
import { authPlugin } from "./plugins/auth";
import { authRouters } from "./routers/auth/auth.routers";
import { addressRoutersProvider } from "./routers/providers/address/address.routers";
import { dispositionRoutersProviders } from "./routers/providers/disposition/disposition.routers";

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

    await fastify.register(authPlugin);

    fastify.setErrorHandler((error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
        if (error.statusCode) {
            const mensagem = error.message.trim();
            return reply.status(error.statusCode).send({
                statusCode: error.statusCode,
                error: error.code,
                message: mensagem,
            });
        }

        console.log("[ERROR] error inesperado ocorreu. Local capturado: server.ts");

        return reply.status(500).send({
            statusCode: 500,
            error: "INTERNAL_SERVER_ERROR",
            message: "Error interno do servidor",
        });
    });

    fastify.get("/", async (req, reply) => {
        return {
            message: "Api executando"
        }
    });

    // ================== Registro das Rotas ==================
    fastify.register(authRouters, {
        prefix: "api/v1/auth"
    });


    fastify.register(addressRoutersProvider, {
        prefix: "api/v1/providers/address"
    });

    fastify.register(dispositionRoutersProviders, {
        prefix: "api/v1/providers/disposition"
    });

    // ================== Fim do Registro ==================

    await fastify.listen({
        port: 3000, host: "0.0.0.0"
    });
    console.log("Servidor sendo executado na porta '3000'");
}

startServer()