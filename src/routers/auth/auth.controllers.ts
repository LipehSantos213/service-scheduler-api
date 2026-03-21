import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthServices } from "../../services/auth.services";
import { AuthRepository } from "../../repositories/auth.repository";
import { UserCreateType, UserResponseType } from "../../schemas/user.schema";
import { randomUUID } from "node:crypto";
import { UnprocessableEntityError } from "../../errors/http.errors";
import { LoginType } from "../../schemas/auth.schema";


const service = new AuthServices(new AuthRepository);



export const registerControllerUser = (app: FastifyInstance) =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { role } = req.query as { role: string };
        const { data } = req.body as { data: UserCreateType }
        let loginMode: "CUSTOMER" | "PROVIDER";
        let user;
        // Cliente
        if (role === "CUSTOMER") {
            loginMode = "CUSTOMER";
            // Criar no banco o registro para Cliente
            const result = await service.registerUserCustomer(data);
            user = mapUser(result);
        }
        // Prestador de Serviço
        else if (role === "PROVIDER") {
            loginMode = "PROVIDER";
            // Criar no banco o registro para Prestador
            const result = await service.registerUserProvider(data);
            user = mapUserProvider(result!, result!.prestador!);
        } else {
            console.log("[AUTH] query do recurso da rota não aceita !");
            throw new UnprocessableEntityError("Query invalida !");
        }

        // Assinar Access e Refresh Token
        const { accessToken, refreshToken } = await generateTokens(app, user!.id, loginMode);

        // Enviar o Refresh Token no cooking do navegador
        return reply.status(201).send({
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: user
        });
    };

export const loginControllerUser = (app: FastifyInstance) =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const data = req.body as LoginType;

        // Fazer Login verificando os dados enviados
        const user = await service.loginUser(data);

        // Assinar Access e Refresh Token
        const { accessToken, refreshToken } = await generateTokens(app, user.id, user.role);

        // Organizar os dados para retorna-los
        const userResponse = user.role === "CUSTOMER" ?
            mapUser(user) :
            mapUserProvider(user, user.prestador!);

        // Enviar Refresh Token no cooking do navegador
        return reply.status(201).send({
            accessToken,
            refreshToken,
            user: userResponse,
        })

    }

export const meControllerUser = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Pegar dados do Usuario 
        const user = req.currentUser;

        // Organizar os dados do usuario para retorna-lo
        const userResponse = user!.role === "CUSTOMER" ?
            mapUser(user) :
            mapUserProvider(user, user!.prestador);

        return reply.status(200).send(userResponse);


    }

function mapUser(user: any): UserResponseType {
    return {
        id: user.id,
        name: user.nome,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
    }
}

function mapUserProvider(user: any, prov: any): UserResponseType {
    return {
        ...mapUser(user),
        provider: {
            companyName: prov.nomeEstabelecimento,
            description: prov.descricao,
            typeService: prov.tipoServico,
            instagram: prov.instagram ?? undefined,
            emailBusiness: prov.emailComercial,
            phoneBusiness: prov.telefoneComercial,
            updatedAt: prov.updatedAt.toISOString()

        }
    }
}

async function generateTokens(app: FastifyInstance, userId: number, role: string): Promise<{ accessToken: string, refreshToken: string }> {
    // Assinar o Access Token
    const accessToken = app.jwt.sign({
        sub: userId,
        role: role
    }, {
        expiresIn: "5m"
    });

    // Gerar um JTI(Jason Token Id)
    const jti = randomUUID();

    // Assinar o Refresh Token
    const refreshToken = app.jwt.sign({
        sub: userId,
        role: role,
        jti: jti,
        type: "refresh"
    }, {
        expiresIn: "7d"
    });

    // Salvar Refresh Token no banco de dados
    await service.saveRefreshTokenOfUser(userId, refreshToken, jti);

    return {
        accessToken,
        refreshToken
    }

}