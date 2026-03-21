
import { Prestador, Usuario } from "@prisma/client"
import "fastify"
import "@fastify/jwt";

declare module "fastify" {
    interface FastifyRequest {
        currentUser: { prestador: Prestador | null } & Usuario | null;
    }
    interface FastifyInstance {
        getCurrentUser: (
            req: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>
    }
}



declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            sub: number;
            role?: string;
            type?: string
            jti?: string
        }
    }
}
