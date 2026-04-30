import { Prestador, Usuario } from "@prisma/client";
import { ProviderRepository } from "../repositories/provider.repository";
import { UserRepository } from "../repositories/user.repository";
import { ProviderService } from "./providers.services";
import { UnauthorizedError } from "../errors/http.errors";



export class UserServices {
    constructor(
        private repository: UserRepository
    ) { }

    /**
     * Buscar dados do prestador
     * @param userId Id do prestador na tabela Usuario
     * @returns Dados do prestador
     */
    async getDataOfProvider(userId: number)
        : Promise<{ prestador: Prestador | null } & Usuario> {
        // Buscar dados do prestador no banco de dados
        const provider = await new ProviderService(
            new ProviderRepository()
        ).getProvider(userId);

        return provider;
    }

    /**
     * Buscar um serviço do prestador pelo Id
     * @param userId Id do prestador na tabela usuario
     * @param serviceId 
     * @returns Os dados do prestador e do seu serviço
     */
    async getServiceWithId(userId: number, serviceId: number) {
        const providerService = new ProviderService(new ProviderRepository());

        const provider = await providerService.getProvider(userId);

        const service = await providerService.getServiceWithId(serviceId);

        if (provider.prestador!.id !== service.prestadorId) {
            throw new UnauthorizedError(
                "UNAUTHORIZED",
                "Não é possivel acessar o serviço !"
            )
        }

        return { provider, serviceProvider: service };
    }
}