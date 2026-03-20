import { Prestador, RefreshTokens, Usuario } from "@prisma/client";
import { prisma } from "../database/prisma";
import { InternalServerError } from "../errors/http.errors";
import { UserCreateType } from "../schemas/user.schema";



export class AuthRepository {


    /**
     * Buscar Usuario pelo ID
     * @param userId Id do Usuario
     * @returns Os dados do Usuario ou Null
     */
    async getUserById(userId: number): Promise<Usuario | null> {
        return await prisma.usuario.findUnique({
            where: { id: userId }
        });
    }

    /**
     * Buscar Usuario pelo Email
     * @param email Email do Usuario (certifique-se que não ha espaços)
     * @returns Os Dados do Usuario ou Null
     */
    async getUserByEmail(email: string): Promise<Usuario | null> {
        return await prisma.usuario.findFirst({
            where: { email: email.trim() }
        });
    }

    /**
     * Buscar Usuario pelo Telefone
     * @param phone Telefone do Usuario (certifique-se que não há espaços)
     * @returns 
     */
    async getUserByPhone(phone: string): Promise<Usuario | null> {
        return await prisma.usuario.findFirst({
            where: { telefone: phone }
        });
    }

    /**
     * Criar um Cliente
     * @param data Dados para a criação do Registro
     * @param passwordHash Hash da senha de data.password
     * @returns Os dados do Usuario criado
     */
    async createUserCustomer(data: UserCreateType, passwordHash: string): Promise<Usuario> {
        try {
            return await prisma.usuario.create({
                data: {
                    nome: data.name.trim(),
                    email: data.email.trim(),
                    senha: passwordHash,
                    telefone: data.phone.trim(),
                    role: "CUSTOMER"
                }
            });
        } catch (e) {
            console.log(`[ERROR] Error na criação do CUSTOMER: ${e}`);
            throw new Error();
        }

    }

    /**
     * Criar um Prestador
     * @param data Dados para a criação do Registro (Obrigatorio dados p/ Prestador)
     * @param passwordHash Hash da senha de data.password
     * @returns Os dados do Usuario com Prestador
     */
    async createUserProvider(data: UserCreateType, passwordHash: string): Promise<{ prestador: Prestador | null } & Usuario | null> {
        try {
            return await prisma.$transaction(async (tx) => {
                const user = await tx.usuario.create({
                    data: {
                        nome: data.name.trim(),
                        email: data.email.trim(),
                        telefone: data.phone.trim(),
                        senha: passwordHash,
                        role: "PROVIDER",
                    }
                });

                await tx.prestador.create({
                    data: {
                        usuarioId: user.id,
                        nomeEstabelecimento: data.provider!.companyName,
                        descricao: data.provider!.description.trim(),
                        tipoServico: data.provider!.typeService.trim(),
                        instagram: data.provider!.instagram!.trim() ?? undefined,
                        emailComercial: data.provider!.emailBusiness.trim(),
                        telefoneComercial: data.provider!.phoneBusiness.trim(),
                    }
                });

                const response = await tx.usuario.findUnique({
                    where: { id: user.id },
                    include: { prestador: true }
                });
                return response
            });
        } catch (e) {
            console.log(`[ERROR] Error na criação do PROVIDER: ${e}`);
            throw new Error();
        }

    }

    /**
     * Salva o Refresh Token do Usuario no banco.
     * Necessario o Usuario não ter nenhum Refresh no banco ainda não revogado
     * @param userId Id do Usuario
     * @param jti Id do Refresh token gerado
     * @param token Hash do Refresh Token
     * @returns Os dados do Refresh criado no banco
     */
    async saveRefreshTokenUser(userId: number, jti: string, token: string): Promise<RefreshTokens> {
        try {
            // Data de daqui ate 7 dias
            const expires = new Date();
            expires.setTime(new Date().getTime() + 7);

            return await prisma.refreshTokens.create({
                data: {
                    usuarioId: userId,
                    token: token,
                    jti: jti,
                    expireAt: expires
                }
            });
        } catch (e) {
            console.log("[REPOSITORY] Não foi possivel salvar o refresh token do usuario");
            console.log(`[ERROR] ${e}`);
            throw new InternalServerError("Error ao salvar refresh do usuario");
        }
    }

    /**
     * Busca todos os Refresh Tokens do Usuario que não estão revogados
     * @param userId Id do Usuario
     * @returns Lista de Refresh Tokens do Usuario
     */
    async getRefreshTokensOfUser(userId: number): Promise<RefreshTokens[]> {
        try {
            return await prisma.refreshTokens.findMany({
                where: {
                    usuarioId: userId,
                    revogado: false,
                    expireAt: {
                        gt: new Date() // Maior que a data de hoje
                    }
                }
            })
        } catch (e) {
            console.log("[REPOSITORY] Error ao buscar tokens do usuario");
            console.log(`[ERROR] ${e}`);
            throw new InternalServerError("Error ao pegar todos os refresh tokens do usuario !");
        }
    }

    /**
     * Buscar o Refresh Token do Usuario pelo JTI
     * @param userId Id do Usuario
     * @param jti Id do Refresh Token gerado
     * @returns Os dados do Refresh no banco ou Null
     * 
     */
    async getRefreshTokenWithJTI(userId: number, jti: string): Promise<RefreshTokens | null> {
        try {
            return await prisma.refreshTokens.findFirst({
                where: {
                    usuarioId: userId,
                    jti: jti
                }
            })
        } catch (e) {
            console.log("[REPOSITORY] Não foi possivel buscar refresh token pelo jti");
            console.log(`[ERROR] ${e}`);
            throw new InternalServerError("Error ao buscar refresh do usuario pelo jti");
        }
    }

    /**
     * Revoga o Refresh Token do Usuario
     * @param userId Id do Usuario
     * @param jti Id do Refresh Token
     */
    async revokeRefreshToken(userId: number, jti: string): Promise<void> {
        try {
            await prisma.refreshTokens.updateMany({
                where: { usuarioId: userId, jti: jti },
                data: {
                    revogado: true
                }
            });
        } catch (e) {
            console.log("[REPOSITORY] Não foi possivel revogar o token do usuario");
            console.log(`[ERROR] ${e}`);
            throw new InternalServerError("Error ao revogar Token do Usuario");
        }
    }
}