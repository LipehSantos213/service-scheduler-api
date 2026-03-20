import { prisma } from "../database/prisma";
import { InternalServerError } from "../errors/http.errors";



export class ProviderRepository {

    /*
        1. COLOCAR CAPTURA DE ERROR PARA DADOS DUPLICADO
    */

    async getPrviderByInstagram(instagram: string) {
        try {
            return await prisma.prestador.findFirst({
                where: { instagram: instagram }
            });
        } catch (e) {
            console.log("[REPOSITORY] Error ao buscar prestador pelo instagram");
            console.log(`[ERROR] ${e}`);
            throw new Error();
        }

    }

    async getProviderByCompanyName(companyName: string) {
        try {
            return await prisma.prestador.findFirst({
                where: { nomeEstabelecimento: companyName }
            })
        } catch (e) {
            console.log("[REPOSITORY] Error ao buscar prestador pelo nome do estabelecimento");
            console.log(`[ERROR] ${e}`);
            throw new Error();
        }
    }

    async getProviderByBusinessEmail(email: string) {
        try {
            return await prisma.prestador.findFirst({
                where: { emailComercial: email }
            })
        } catch (e) {
            console.log("[REPOSITORY] Error ao buscar prestador pelo email comercial");
            console.log(`[ERROR] ${e}`);
            throw InternalServerError("Error ao buscar prestador pelo email comercial");
        }
    }

    async getProviderByBusinessPhone(phone: string) {
        try {
            return await prisma.prestador.findFirst({
                where: { telefoneComercial: phone }
            });
        } catch (e) {
            throw new InternalServerError("");
        }
    }
}