import { Agendamento, Disponibilidade, Endereco, Prestador, Servico, StatusAgendamento, Usuario } from "@prisma/client";
import { ConflictError, NotFoundError, UnauthorizedError } from "../errors/http.errors";
import { ProviderRepository } from "../repositories/provider.repository";
import { CreateServiceType, UpdateServiceType } from "../schemas/services.schema";
import { CreateAvailabilityType, UpdateAvailabilityType } from "../schemas/availability.schema";
import { CreateAddressProviderType, UpdateAddressProviderType } from "../schemas/address.schema";



export class ProviderService {
    constructor(
        private repository: ProviderRepository
    ) { }

    getNextWeekday(targetDay: number): Date {
        // Buscar data de hoje
        const today = new Date()

        // Pega o dia da semana (0 para domingo e etc)
        const currentDay = today.getDay()

        // Pega a dirença dos dias da semana
        let diff = targetDay - currentDay

        if (diff <= 0) {
            diff += 7
        }

        const result = new Date(today)
        result.setDate(today.getDate() + diff)

        return result
    }

    parseTimeToDate(time: string): Date {
        const [hours, minutes] = time.split(":").map(Number);

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date;
    }

    async getProvider(userId: number): Promise<{ prestador: Prestador | null } & Usuario> {
        // Busca os dados do Prestador no banco pelo userId
        const user = await this.repository.getProviderById(userId);

        // Verifica se teve retorno de dados
        if (!user) {
            console.log(`[PROVIDER] Usuario ${userId} não existe ou não é um Prestador !`);
            throw new NotFoundError("PROVIDER_NOT_FOUND", "Prestador não encontrado !");
        }

        return user;
    }

    /**
     * Criação de uma Disponibilidade do Prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param data Dados para a criação da Disponibilidade
     */
    async createAvailability(providerId: number, data: CreateAvailabilityType): Promise<void> {
        // Fazer verificação de horarios

        // Criar no banco o registro da Disponibilidade
        await this.repository.createAvailabilityOfProvider(providerId, data);
    }

    /**
     * Busca todas as Disponibilidade do Prestador
     * @param providerId Id do usuario na tabela Prestador
     * @returns Todas os registros na tabela Disponibilidade do Prestador
     */
    async getAllAvailabilityOfProvider(providerId: number): Promise<Disponibilidade[]> {
        // Buscar todas os registros do Prestador em Disponibilidade
        const availabilities = await this.repository.getAllAvailabilityOfProvider(providerId);

        // Analisar se há algum registro retornado
        if (!availabilities) {
            throw new NotFoundError("AVAILABILITY_NOT_THERE_IS", "Prestador não tem nenhuma disponibilidade registrada !");
        }

        return availabilities;
    }

    /**
     * Buscar Disponibilidade em um dia da semana
     * @param providerId Id do usuario na tabela Prestador
     * @param day Dia da semana
     * @returns Todas as Disponibilidade registras no dia
     */
    async getAvailability(providerId: number, day: number): Promise<Disponibilidade[]> {
        // Buscar as Disponibilidade do dia
        const availability = await this.repository.getAvailabilityOfDay(providerId, day);

        // Verificar se não foi encontrado nada
        if (!availability) {
            throw new NotFoundError("AVAILABILITY_NOT_THERE_IS", "Disponibilidade não encontrada !");
        }

        return availability
    }

    /**
     * Atualizar dados da Disponibilidade
     * @param providerId Id do usuario na tabela Prestador
     * @param idAvailability Id da disponibilidade
     * @param data Dados para atualizar disponibilidade
     */
    async updateAvailability(providerId: number, idAvailability: number, data: UpdateAvailabilityType): Promise<void> {
        // Buscar Disponibilidade pelo Id
        const availability = await this.repository.getAvailabilityById(providerId, idAvailability);

        // Verificar se há disponibilidade nesse dia
        if (!availability) {
            throw new NotFoundError("AVAILABILITY_NOT_THIS_DAY", "Não há disponibilidade para esse dia");
        }

        // Atualizar no banco os dados da disponibilidade
        await this.repository.toUpdateAvailabilityOfProvider(providerId, idAvailability, data);
    }

    /**
     * Deletar uma disponibilidade pelo Id
     * @param providerId Id do usuario na tabela Prestador
     * @param availabilityId Id da disponibilidade
     */
    async deleteAvailability(providerId: number, availabilityId: number): Promise<void> {
        // Verifiar se a Disponibilidade existe mesmo
        const availability = await this.repository.getAvailabilityById(providerId, availabilityId);

        // Verifica se foi retornado algum valor
        if (!availability) {
            throw new NotFoundError("AVAILABILITY_NOT_THERE_IS", "Disponibilidade não existe");
        }

        // Remover no banco de dados o Registro da disponibilidade
        await this.repository.toDeleteAvailabilityOfProvider(providerId, availabilityId);
    }

    /**
     * Buscar Agendamendo do prestador pelo Id
     * @param id Id do agendamento
     * @param providerId Id do usuario na tabela Prestador
     * @returns Os dados do agendamento
     */
    async getAppointmentsWithId(id: number, providerId: number) {
        // Buscar agendamento 
        const appointment = await this.repository.getAppointmentsById(id, providerId);

        // Verificar se foi retornado algum valor
        if (!appointment) {
            throw new NotFoundError(
                "SCHEDULING_NOT_FOUND",
                "Agendamento não encontrado !"
            );
        }
        return appointment;
    }

    /**
     * Buscar todos os Agendamentos do prestador
     * @param providerId Id do usuario na tabela Prestador
     * @returns Os dados do agendamento e do cliente
     */
    async getAllAppointments(providerId: number) {
        // Buscar todos os agendamentos do prestador
        const appointments = await this.repository.getAllAppointmentsOfProvider(providerId);

        // Verifica se foi retornado algo
        if (!appointments || appointments.length === 0) {
            throw new NotFoundError(
                "SCHEDULING_NOT_FOUND",
                "Nenhum agendamento encontrado !"
            )
        }
        return appointments;
    }

    /**
     * Confirmar um agendamento
     * @param id Id do agendamento
     * @param providerId Id do usuario na tabela Prestador
     */
    async confirmAppointment(id: number, providerId: number): Promise<void> {
        // Buscar o agendamento
        const appointment = await this.getAppointmentsWithId(id, providerId);

        // Verificar se o agendamento esta em aguardo mesmo
        if (appointment.status !== "WAITING") {
            throw new ConflictError(
                "SCHEDULING_NOT_UPDATE",
                "O agendamento não esta em aguardo !"
            )
        }

        // Atualizar no banco o status do agendamento
        await this.repository.updateStatusAppointment(id, "CONFIRMED");

    }

    /**
     * Buscar todos os agendamento do prestador pelo status
     * @param providerId Id do usuario na tabela Prestador
     * @param status Status do agendamento
     */
    async getAllAppointmentsWithStatus(providerId: number, status: StatusAgendamento) {
        // Buscar todos os agendamentos pelos status
        const appointments = await this.repository.getAppointmentsWithStatus(providerId, status);

        if (!appointments || appointments.length === 0) {
            throw new NotFoundError(
                "SCHEDULING_NOT_FOUND",
                "Nenhum agendamento encontrado !"
            )
        }

        return appointments;

    }

    /**
     * Criar um Serviço do Prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param data Dados para a criação do serviço
     */
    async createService(providerId: number, data: CreateServiceType): Promise<void> {
        // Verificar se não existe um serviço com o mesmo nome
        const nameExisting = await this.repository.getServiceOfProviderByName(providerId, data.nameService);
        if (nameExisting) {
            throw new ConflictError("NAME_SERVICE_EXISTING", "Você já tem um serviço com esse nome !");
        }

        // Criar no banco o registro do serviço
        await this.repository.registerServiceOfProvider(providerId, data);
    }

    /**
     * Atualizar dados do serviço do prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param serviceId Id do serviço do prestador
     * @param data Dados para atualizar o serviço
     */
    async updateService(providerId: number, serviceId: number, data: UpdateServiceType): Promise<void> {
        // Buscar dados do serviço
        const service = await this.repository.getServiceById(serviceId);
        // Verificar se ele existe
        if (!service) {
            throw new NotFoundError("SERVICE_NOT_FOUND", "Serviço não existe !");
        }
        // Analisar se o serviço é do prestador
        if (service.prestadorId !== providerId) {
            throw new UnauthorizedError("CANNOT_ACCESS_SERVICE", "Você não pode accessar esse serviço !");
        }

        // Atualizar no banco o registro do serviço
        await this.repository.updateServiceOfProvider(serviceId, data);
    }

    /**
     * Deletar o serviço do prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param serviceId Id do serviço
     */
    async deleteService(providerId: number, serviceId: number): Promise<void> {
        // Buscar dados do serviço
        const service = await this.repository.getServiceById(serviceId);
        // Verifica se o serviço existe
        if (!service) {
            throw new NotFoundError("DELETED_OR_NON_EXISTENT", "Serviço já deletado ou não existe !");
        }
        // Analisar se o serviço é do prestado
        if (service.prestadorId !== providerId) {
            throw new UnauthorizedError("CANNOT_ACCESS_SERVICE", "Você não pode accessar esse serviço !");
        }

        // Deletar no banco de dados
        await this.repository.deleteServiceOfProvider(serviceId);
    }

    /**
     * Atualizar status do serviço
     * @param providerId Id do usuario na tabela Prestador
     * @param serviceId Id do serviço do prestador
     * @param status Valor booleano para ativar ou desativar serviço
     */
    async updateStatusService(providerId: number, serviceId: number, status: boolean): Promise<void> {
        // Buscar dados do Serviço
        const service = await this.repository.getServiceById(serviceId);
        // Verificar se ele existe
        if (!service) {
            throw new NotFoundError("SERVICE_NOT_FOUND", "Serviço não existe !");
        }
        // Analisar se o serviço é do prestador
        if (service.prestadorId !== providerId) {
            throw new UnauthorizedError("CANNOT_ACCESS_SERVICE", "Você não pode accessar esse serviço !");
        }

        // Analisar se o status não é igual ao @param status
        if (service.ativo === status) {
            throw new ConflictError("STATE_CAN_NOT_CHANGE", `O status já estava ${status ? 'ativado' : 'desativado'}`);
        }

        // Atualizar no banco o status do serviço
        await this.repository.updateStatusOfService(serviceId, status);
    }

    /**
     * Buscar todos os serviços do Prestador
     * @param providerId Id do usuario na tabela Prestador
     * @returns Todos os serviços do prestador
     */
    async getServices(providerId: number): Promise<Servico[]> {
        // Buscar todaos os serviços do prestador
        const services = await this.repository.getServicesOfProvider(providerId);

        // Verificar se existe algum serviço
        if (services && services.length === 0) {
            throw new NotFoundError("NO_SERVICE", "Nenhum serviço cadastrado ainda");
        }

        return services!;
    }

    /**
     * Busca o serviço do prestador pelo Id
     * @param id 
     * @returns Dados do serviços
     */
    async getServiceWithId(id: number): Promise<Servico> {
        // Buscar serviço pelo Id
        const service = await this.repository.getServiceById(id);

        // Verificar se o serviço existe
        if (!service) {
            throw new NotFoundError(
                "NOT_FOUND_SERVICE",
                "Serviço não existe !"
            );
        }
        return service;
    }

    /**
     * Criar um Endereço do Prestador
     * @param providerId Id do prestador na tabela Prestador
     * @param data Dados para a criação do Endereço
     */
    async createAddressOfProvider(providerId: number, data: CreateAddressProviderType): Promise<void> {
        // Verificar se o prestador não tem nenhum endereço ja cadastrado
        const addressProvider = await this.repository.getAddressOfProvider(providerId);

        if (addressProvider) {
            throw new ConflictError("ADDRESS_EXISTING", "Você ja tem um endereço cadastrado !");
        }

        // Criar o endereço do prestador
        await this.repository.createAddress(providerId, data);
    }

    /**
     * Buscar Endereço do prestador
     * @param providerId Id do prestador na tabela Prestador
     * @returns Dados do endereço
     */
    async getAddressOfProvider(providerId: number): Promise<Endereco> {
        // Buscar o endereço do Prestador
        const address = await this.repository.getAddressOfProvider(providerId);

        // Verificar se ele tem um endereço cadastrado
        if (!address) {
            throw new NotFoundError("ADDRESS_NOT_FOUND", "Endereço não encontrado");
        }

        return address;
    }

    /**
     * Atualizar dados do endereço do Prestador
     * @param providerId Id do usuario na tabela 
     * @param data Dados para atualizar 
     */
    async updateAddressOfProvider(providerId: number, data: UpdateAddressProviderType): Promise<void> {
        // Verificar se o endereço existe
        await this.getAddressOfProvider(providerId);

        // Atualizar endereço
        await this.repository.toUpdateAddress(providerId, data);
    }

    /**
     * Deletar endereço do prestador
     * @param providerId Id do prestador na tabela Prestador
     */
    async deleteAddressOfProvider(providerId: number): Promise<void> {
        // Verificar se tem endereço cadastrado
        await this.getAddressOfProvider(providerId);

        // Deletar endereço
        await this.repository.toDeleteAddress(providerId);
    }
}