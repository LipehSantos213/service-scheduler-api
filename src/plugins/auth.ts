import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../database/prisma";
import fp from "fastify-plugin";
import { NotFoundError, UnauthorizedError, UnprocessableEntityError } from "../errors/http.errors";



export async function authPlugin(app: FastifyInstance) {
    // Adiciona um propriedade nova na request;
    app.decorateRequest("currentUser", null);

    app.decorate(
        "getCurrentUser",
        async (req: FastifyRequest, reply: any) => {
            // Pega o token no Header e organiza como o payload
            await req.jwtVerify();

            // user.sub pego pelo jwtVerify
            const userId = req.user.sub;

            // Busca o usuario pelo seu ID
            const user = await prisma.usuario.findUnique({
                where: { id: Number(userId) },
                include: {
                    prestador: true
                }
            });

            // Se não encontrar, despara um error
            if (!user) {
                throw new NotFoundError("Usuario não encontrado !");
            }

            // Atribui a propriedade da request à os dados do usuario
            req.currentUser = user;
        }
    );

    app.decorate(
        "requireRole",
        (role: string) => {
            return async (req: FastifyRequest, reply: any) => {
                if (!req.currentUser) {
                    throw new UnprocessableEntityError("Não foi possivel buscar Usuario pelo Header");
                }
                const userRole = req.currentUser.role;
                if (role === userRole) {
                    return; // Acesso permitido
                }
                else {
                    throw new UnauthorizedError("Recurso não autorizado !");
                }

            }
        }
    )
}

export default fp(authPlugin);