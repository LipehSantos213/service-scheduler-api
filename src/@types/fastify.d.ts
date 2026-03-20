
import { Usuario } from "@prisma/client"
import "fastify"
import "@fastify/jwt";

declare module "fastify" {
    interface FastifyRequest {
        currentUser: Usuario | null;
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

    interface FastifyInstance {
        getCurrentUser: (
            req: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>
    }
}
