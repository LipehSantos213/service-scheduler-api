import { FastifyReply, FastifyRequest } from "fastify";
import { CreateAvailabilityType, ResponseAllAvailabilityType, ResponseAvailabilityType, UpdateAvailabilityType } from "../../../schemas/availability.schema";
import { ProviderService } from "../../../services/providers.services";
import { ProviderRepository } from "../../../repositories/provider.repository";
import { Disponibilidade } from "@prisma/client";



const service = new ProviderService(new ProviderRepository);


// Criar Disponibilidade
export const registerNewAvailability = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Pegar dados do body
        const data = req.body as CreateAvailabilityType;

        // Pegar id assinado no token
        const providerId = req.currentUser!.prestador!.id;

        // Criar Disponibilidade 
        await service.createAvailability(providerId, data);

        return reply.status(201).send({
            message: "Disponibilidade criada com sucesso !"
        });
    }

// Buscar Disponibilidades em um dia especifico
export const getAvailability = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Buscar path do passado do endpoint da rota
        const { dayAvailability } = req.params as { dayAvailability: number };

        // Pegar id do prestador assinado no token
        const providerId = req.currentUser!.prestador!.id;

        const availabilities = await service.getAvailability(providerId, dayAvailability);

        const response = availabilities.map((value) => mapAvailability(value));

        return reply.status(200).send(response);
    }

export const getAllAvailability = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Pegar Id do prestador assinado no token
        const providerId = req.currentUser!.prestador!.id;

        // Buscar disponibilidades
        const availabilities = await service.getAllAvailabilityOfProvider(providerId);

        const response: ResponseAllAvailabilityType = [];

        for (let i = 0; i < availabilities.length; i++) {
            // Pega o elemento do indice 'i'
            const data = availabilities[i];
            // Se a lista para ser retornada na request não estiver vazia faz isso
            if (!(response.length === 0)) {
                // Percorre a lista de retorno da request
                for (const r of response) {
                    // se dia da semana da disponibilidade for igual ao do response
                    if (data.diaSemana === r.dayWeek) {
                        r.data.push({
                            id:data.id,
                            startTime: data.horaInicio.toString(),
                            endTime: data.horaFim.toString(),
                            interval: data.intervalo
                        });
                    }
                }
                return;
            }
            // Se não so adiciona um novo elemento no response
            else {
                response.push({
                    dayWeek: data.diaSemana,
                    data: [
                        {
                            id:data.id,
                            startTime: data.horaInicio.toString(),
                            endTime: data.horaFim.toString(),
                            interval: data.intervalo,
                        }
                    ],
                })
                return;
            }
        }

        return reply.status(200).send(response);
    }

// Atualizar dados de uma disponibilidade pelo Id
export const updateAvailability = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Pegar dados do body
        const data = req.body as UpdateAvailabilityType;

        // Pegar id da disponibilidade
        const { idAvailability } = req.params as { idAvailability: number };

        // Pegar o id do prestador assinado no token
        const providerId = req.currentUser!.prestador!.id;

        await service.updateAvailability(providerId, idAvailability, data);

        return reply.status(200).send({
            message: "Disponibilidade atualizada com sucesso !"
        })
    }

// Deletar uma Disponibilidade pelo Id
export const deleteAvailability = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        // Pegar id da disponibilidade
        const { idAvailability } = req.params as { idAvailability: number };

        // Pegar id do usuario no token
        const providerId = req.currentUser!.prestador!.id;

        // Deletar no banco de dados
        await service.deleteAvailability(providerId, idAvailability);

        return reply.status(200).send({
            message: "Disponibilidade deletada com sucesso !"
        })

    }

function mapAvailability(a: any): ResponseAvailabilityType {
    return {
        id: a.id,
        dayWeek: a.diaSemana,
        startTime: a.horaInicio.toISOString(),
        endTime: a.horaFim.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString()
    }
}