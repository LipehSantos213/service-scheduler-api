import { FastifyReply, FastifyRequest } from "fastify";
import { UserServices } from "../../../services/user.services";
import { UserRepository } from "../../../repositories/user.repository";
import { ProviderPublicResponseType, TypeServicesType } from "../../../schemas/provider.schemas";
import { ProviderService } from "../../../services/providers.services";
import { ProviderRepository } from "../../../repositories/provider.repository";
import { ResponseServicePublicType } from "../../../schemas/services.schema";


const service = new UserServices(new UserRepository());
const providerService = new ProviderService(new ProviderRepository());

export const getProviderWithIdController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { userId } = req.params as { userId: number };

        const provider = await service.getDataOfProvider(userId);

        const response = mapProviderPublic(provider);

        return reply.status(200).send(response);
    }

export const getServicesOfProviderController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { userId } = req.params as { userId: number };

        const provider = await providerService.getProvider(userId);

        const services = await providerService.getServices(provider.prestador!.id);

        const response = services.map(value => mapService(value));

        return reply.status(200).send(response);
    }

export const getServiceOfProviderWithIdController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { userId, serviceId } = req.params as {
            userId: number, serviceId: number
        };

        const { provider, serviceProvider } = await service.getServiceWithId(userId, serviceId);

        const response = {
            ...(mapService(serviceProvider)),
            provider: {
                ...(mapProviderPublic(provider))
            }
        }

        return reply.status(200).send(response);
    }

function mapProviderPublic(
    p: any
): ProviderPublicResponseType {
    return {
        id: p.id,
        ownerName: p.nome,
        createdAt: p.createdAt.toISOString(),
        description: p.prestador!.descricao,
        emailBusiness: p.prestador!.emailComercial,
        phoneBusiness: p.prestador!.telefoneComercial,
        storeName: p.prestador!.nomeEstabelecimento,
        typeService: p.prestador!.tipoServico as TypeServicesType,
        instagram: p.prestador!.instagram ?? undefined,
        ownerPhoto: p.foto ?? undefined
    }
}

function mapService(s: any): ResponseServicePublicType {
    return {
        nameService: s.nome,
        createdAt: s.createdAt.toISOString(),
        description: s.descricao,
        duration: s.duracao,
        price: s.preco
    }
}