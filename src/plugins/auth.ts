import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../database/prisma";
import fp from "fastify-plugin";



export async function authPlugin(app: FastifyInstance) {
    // Adiciona um propriedade nova na request;
    app.decorateRequest("currentUser", null);

    app.decorate(
        "getCurrentUser",
        async (req: FastifyRequest, reply: any) => {
            await req.jwtVerify();

            const userId = req.user.sub;

            const user = await prisma.usuario.findUnique({
                where: { id: Number(userId) }
            });
            if (!user) {
                throw new Error();
            }

            req.currentUser = user;
        }
    );

    app.decorate(
        "requireRole",
        (role: string) => {
            return async (req: FastifyRequest, reply: any) => {
                if (!req.currentUser) {
                    throw new Error();
                }
                const userRole = req.currentUser.role;
                if (role === userRole) {
                    return; // Acesso permitido
                }
                else {
                    throw new Error();
                }

            }
        }
    )
}

export default fp(authPlugin);