import { FastifyReply, FastifyRequest } from "fastify";
import { CreateServiceType, ResponseServiceType, UpdateServiceType } from "../../../schemas/services.schema";
import { ProviderService } from "../../../services/providers.services";
import { ProviderRepository } from "../../../repositories/provider.repository";
import { Servico } from "@prisma/client";
import { UnauthorizedError } from "../../../errors/http.errors";



const service = new ProviderService(new ProviderRepository);

export const createServiceController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const data = req.body as CreateServiceType;
        const providerId = req.currentUser!.prestador!.id;

        await service.createService(providerId, data);

        return reply.status(201).send({
            message: "Serviço criado com sucesso !"
        });
    }

export const getAllServicesController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const providerId = req.currentUser!.prestador!.id;

        const services = await service.getServices(providerId);

        const response = services.map(s => mapService(s));

        return reply.status(200).send(response);
    }

export const getServiceController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { idService } = req.params as { idService: number };

        const providerId = req.currentUser!.prestador!.id;

        const serv = await service.getServiceWithId(idService);

        if (serv.prestadorId !== providerId) {
            throw new UnauthorizedError(
                "CANNOT_ACCESS_SERVICE",
                "Você não pode accessar esse serviço !"
            );
        }

        return reply.status(200).send({
            ...mapService(serv)
        });
    }

export const updateServiceController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { idService } = req.params as { idService: number };
        const data = req.body as UpdateServiceType;

        const providerId = req.currentUser!.prestador!.id;

        await service.updateService(providerId, idService, data);

        return reply.status(200).send({
            message: "Serviço atualizado !"
        });
    }

export const deleteServiceController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { idService } = req.params as { idService: number };

        const providerId = req.currentUser!.prestador!.id;

        await service.deleteService(providerId, idService);

        return reply.status(200).send({
            message: "Serviço deletado !"
        });
    }

export const disableServiceController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { idService } = req.params as { idService: number };
        const providerId = req.currentUser!.prestador!.id;

        await service.updateStatusService(providerId, idService, false);

        return reply.status(200).send({
            message: "Serviço desabilitado !"
        });
    }

export const activateServiceController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { idService } = req.params as { idService: number };
        const providerId = req.currentUser!.prestador!.id;

        await service.updateStatusService(providerId, idService, true);
    }

export function mapService(s: Servico): ResponseServiceType {
    return {
        nameService: s.nome,
        description: s.descricao,
        duration: s.duracao,
        price: Number(s.preco),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString()
    }
}