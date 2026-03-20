import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthServices } from "../../services/auth.services";
import { AuthRepository } from "../../repositories/auth.repository";
import { UserCreateType } from "../../schemas/user.schema";
import { randomUUID } from "node:crypto";


const service = new AuthServices(new AuthRepository);



export const registerControllerUser = (app: FastifyInstance) =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { role } = req.query as { role: string };
        const { data } = req.body as { data: UserCreateType }
        let loginMode: "CUSTOMER" | "PROVIDER";
        let idUser: number;
        // Cliente
        if (role === "CUSTOMER") {
            loginMode = "CUSTOMER";
            idUser = await service.registerUserCustomer(data);
        }
        // Prestador de Serviço
        else if (role === "PROVIDER") {
            loginMode = "PROVIDER";
            idUser = await service.registerUserProvider(data);
        } else {
            console.log("[AUTH] query do recurso da rota não aceita !");
            throw new Error();
        }

        const accessToken = app.jwt.sign({
            sub:idUser,
            role: loginMode
        }, {
            expiresIn:"5m"
        });

        const jti = randomUUID();

        const refreshToken = app.jwt.sign({
            sub:idUser,
            role:loginMode,
            jti:jti,
            type:"refresh"
        }, {
            expiresIn:"7d"
        });
    }