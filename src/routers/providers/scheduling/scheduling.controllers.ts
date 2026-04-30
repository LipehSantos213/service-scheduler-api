import { FastifyReply, FastifyRequest } from "fastify";
import { ProviderService } from "../../../services/providers.services";
import { ProviderRepository } from "../../../repositories/provider.repository";
import { Agendamento, Disponibilidade, Endereco, Servico, StatusAgendamento, Usuario } from "@prisma/client";
import { ResponseSchedulingType, StatusAgendamentoType } from "../../../schemas/scheduling.schema";
import { mapUser } from "../../auth/auth.controllers";
import { mapAvailability } from "../disposition/disposition.controllers";
import { mapAddress } from "../address/address.controllers";
import { mapService } from "../service/service.controllers";


const service = new ProviderService(new ProviderRepository());

export const getAllAppointmentsController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const providerId = req.currentUser!.prestador!.id;

        const appointments = await service.getAllAppointments(providerId);

        const response = appointments.map(
            value => mapScheduling(
                value,
                value.cliente,
                value.servico,
                value.endereco,
                value.disponibilidade
            )
        );

        return reply.status(200).send(response);
    }

export const getAppointmentByIdController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const providerId = req.currentUser!.prestador!.id;
        const { serviceId } = req.params as { serviceId: number };

        const appointment = await service.getAppointmentsWithId(serviceId, providerId);

        return reply.status(200).send(
            mapScheduling(
                appointment,
                appointment.cliente,
                appointment.servico,
                appointment.endereco,
                appointment.disponibilidade
            )
        );
    }

export const getAppointmentWithStatusController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const providerId = req.currentUser!.prestador!.id;

        const { status } = req.query as { status: StatusAgendamentoType };

        const appointments = await service.getAllAppointmentsWithStatus(providerId, status);

        const response = appointments.map(
            value => mapScheduling(
                value,
                value.cliente,
                value.servico,
                value.endereco,
                value.disponibilidade
            )
        );

        return reply.status(200).send(response);
    }

export const confirmAppointmentController = () =>
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { serviceId } = req.params as { serviceId: number };
        const providerId = req.currentUser!.prestador!.id;

        await service.confirmAppointment(serviceId, providerId);

        return reply.status(200).send({
            message: "Agendamento confirmado !"
        });
    }


function mapScheduling(a: Agendamento, c: Usuario, s: Servico, e: Endereco, d: Disponibilidade): ResponseSchedulingType {
    return {
        id: a.id,
        address: mapAddress(e),
        client: mapUser(c),
        availability: mapAvailability(d),
        service: mapService(s),
        createdAt: a.createdAt.toISOString(),
        date: a.data.toISOString(),
        endIn: a.fim,
        startIn: a.inicio,
        status: a.status,
        canceledBy: "SYSTEM", // temporario
        canceledIn: a.canceladoAt!.toISOString() ?? undefined,
        canceledReason: a.motivoCancelado ?? undefined
    }
}
