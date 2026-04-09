import { FastifyReply, FastifyRequest } from "fastify";
import { CreateAddressProviderType, ResponseAddressProviderType, UpdateAddressProviderType } from "../../../schemas/address.schema";
import { ProviderService } from "../../../services/providers.services";
import { ProviderRepository } from "../../../repositories/provider.repository";


const service = new ProviderService(new ProviderRepository);

export const createAddressController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Buscar dados do body
        const data = req.body as CreateAddressProviderType;

        // Pegar id do prestador no token
        const providerId = req.currentUser!.prestador!.id;

        // Criar Endereço no banco
        await service.createAddressOfProvider(providerId, data);

        return reply.status(201).send({
            message: "Endereço criado com sucesso !"
        });
    }

export const getAddressController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Pegar id do prestador no token
        const providerId = req.currentUser!.prestador!.id;

        // Pegar Endereço do prestador
        const address = await service.getAddressOfProvider(providerId);

        return reply.status(200).send({
            ...mapAddress(address)
        });
    }

export const updateAddressController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Pegar dados do body
        const data = req.body as UpdateAddressProviderType;

        // Pegar id do prestador no token
        const providerId = req.currentUser!.prestador!.id;

        await service.updateAddressOfProvider(providerId, data);

        return reply.status(200).send({
            message: "Endereço atualizado !"
        });
    }

export const deleteAddressController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Pegar id do prestador no token
        const providerId = req.currentUser!.prestador!.id;

        // Deletar endereço
        await service.deleteAddressOfProvider(providerId);

        return reply.status(200).send({
            message:"Endereço deletador !"
        });
    }


function mapAddress(a: any): ResponseAddressProviderType {
    return {
        id: a.id,
        city: a.cidade,
        cep: a.cep,
        neighborhood: a.bairro,
        number: a.numero,
        reference: a.referencia,
        road: a.rua,
        state: a.estado,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString()
    }
}

