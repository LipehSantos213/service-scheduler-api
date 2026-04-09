
import { Agendamento, Disponibilidade, Endereco, Prestador, Usuario } from "@prisma/client";
import { ConflictError, NotFoundError } from "../errors/http.errors";
import { ProviderRepository } from "../repositories/provider.repository";
import { CreateServiceType } from "../schemas/services.schema";
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
            throw new NotFoundError("Prestador não encontrado !");
        }

        return user;
    }

    /**
     * Criação de uma Disponibilidade do Prestador
     * @param userId Id no prestador na tabela Usuario
     * @param data Dados para a criação da Disponibilidade
     */
    async createAvailability(userId: number, data: CreateAvailabilityType): Promise<void> {
        // Buscar dados do Prestador pelo userId
        const userProvider = await this.getProvider(userId);

        // Criar no banco o registro da Disponibilidade
        await this.repository.createAvailabilityOfProvider(userProvider.prestador!.id, data);
    }

    /**
     * Busca todas as Disponibilidade do Prestador
     * @param userId Id do usuario na tabela Usuario
     * @returns Todas os registros na tabela Disponibilidade do Prestador
     */
    async getAllAvailabilityOfProvider(userId: number): Promise<Disponibilidade[]> {
        // Buscar prestador pelo Id do usuario
        const provider = await this.getProvider(userId);

        // Buscar todas os registros do Prestador em Disponibilidade
        const availabilities = await this.repository.getAllAvailabilityOfProvider(provider.prestador!.id);

        // Analisar se há algum registro retornado
        if (!availabilities) {
            throw new NotFoundError("Prestador não tem nenhuma disponibilidade registrada !");
        }

        return availabilities;
    }

    /**
     * Buscar Disponibilidade em um dia da semana
     * @param userId Id do usuario na tabela Usuario
     * @param day Dia da semana
     * @returns Todas as Disponibilidade registras no dia
     */
    async getAvailability(userId: number, day: number): Promise<Disponibilidade[]> {
        // Buscar dados do Prestador pelo userId
        const userProvider = await this.getProvider(userId);

        // Buscar as Disponibilidade do dia
        const availability = await this.repository.getAvailabilityOfDay(userProvider.prestador!.id, day);

        // Verificar se não foi encontrado nada
        if (!availability) {
            throw new NotFoundError("Disponibilidade não encontrada !");
        }

        return availability
    }

    /**
     * Atualizar dados da Disponibilidade
     * @param userId Id do usuario na tabela Usuario
     * @param idAvailability Id da disponibilidade
     * @param data Dados para atualizar disponibilidade
     */
    async updateAvailability(userId: number, idAvailability: number, data: UpdateAvailabilityType):Promise<void> {
        // Buscar dados do prestador pelo userId
        const userProvider = await this.getProvider(userId);

        // Buscar Disponibilidade pelo Id
        const availability = await this.repository.getAvailabilityById(userProvider.prestador!.id, idAvailability);

        // Verificar se há disponibilidade nesse dia
        if(!availability){
            throw new NotFoundError("Não disponibilidade para esse dia");
        }

        // Atualizar no banco os dados da disponibilidade
        await this.repository.toUpdateAvailabilityOfProvider(userProvider.prestador!.id, idAvailability, data);
    }

    /**
     * Deletar uma disponibilidade pelo Id
     * @param userId Id do usuario na tabela Usuario
     * @param availabilityId Id da disponibilidade
     */
    async deleteAvailability(userId:number, availabilityId:number):Promise<void>{
        // Buscar dados do Prestador
        const userProvider = await this.getProvider(userId);

        // Verifiar se a Disponibilidade existe mesmo
        const availability = await this.repository.getAvailabilityById(userProvider.prestador!.id, availabilityId);

        // Verifica se foi retornado algum valor
        if(!availability){
            throw new NotFoundError("Disponibilidade não existe");
        }

        // Remover no banco de dados o Registro da disponibilidade
        await this.repository.toDeleteAvailabilityOfProvider(userProvider.prestador!.id, availabilityId);
    }

    /**
     * Busca todos os agendamento do Prestador
     * @param providerId Id do usuario na tabela Prestador
     * @returns Todos os agendamento do Prestador com os clientes
     */
    async getAllAppointmentsOfProvider(providerId: number): Promise<({ cliente: Usuario } & Agendamento)[]> {
        // Buscar Agendamentos do Prestador
        const appointments = await this.repository.getAllAppointmentsOfProvider(providerId);

        // Verificar se o valor é vazio
        if (!appointments) {
            throw new NotFoundError("Nenhum agendamento encontrado !");
        }

        return appointments
    }

    /**
     * Criar um Serviço do Prestador
     * @param userId Id do prestador na tabela Usuario
     * @param data Dados para a criação do serviço
     */
    async createService(userId: number, data: CreateServiceType): Promise<void> {
        // Buscar o Prestador pelo userId
        const userProvider = await this.getProvider(userId);

        // Verificar se o nome do serviço já não existe
        const nameServiceExisting = await this.repository.getServiceByName(userProvider.prestador!.id, data.nameService.trim());
        if (nameServiceExisting) {
            throw new ConflictError("Nome do serviço já existe !");
        }

        // Criar no Banco de Dados o registro do serviço
        await this.repository.createServiceOfProvider(userProvider.prestador!.id, data);
    }


    /**
     * Criar um Endereço do Prestador
     * @param providerId Id do prestador na tabela Prestador
     * @param data Dados para a criação do Endereço
     */
    async createAddressOfProvider(providerId:number, data: CreateAddressProviderType):Promise<void>{
        // Verificar se o prestador não tem nenhum endereço ja cadastrado
        const addressProvider = await this.repository.getAddressOfProvider(providerId);

        if(addressProvider){
            throw new ConflictError("Você ja tem um endereço cadastrado !");
        }

        // Criar o endereço do prestador
        await this.repository.createAddress(providerId, data);
    }

    /**
     * Buscar Endereço do prestador
     * @param providerId Id do prestador na tabela Prestador
     * @returns Dados do endereço
     */
    async getAddressOfProvider(providerId:number):Promise<Endereco>{
        // Buscar o endereço do Prestador
        const address = await this.repository.getAddressOfProvider(providerId);

        // Verificar se ele tem um endereço cadastrado
        if(!address){
            throw new NotFoundError("Endereço não encontrado");
        }

        return address;
    }

    /**
     * Atualizar dados do endereço do Prestador
     * @param providerId Id do usuario na tabela 
     * @param data Dados para atualizar 
     */
    async updateAddressOfProvider(providerId:number, data:UpdateAddressProviderType):Promise<void>{
        // Verificar se o endereço existe
        await this.getAddressOfProvider(providerId);

        // Atualizar endereço
        await this.repository.toUpdateAddress(providerId, data);
    }

    /**
     * Deletar endereço do prestador
     * @param providerId Id do prestador na tabela Prestador
     */
    async deleteAddressOfProvider(providerId:number):Promise<void>{
        // Verificar se tem endereço cadastrado
        await this.getAddressOfProvider(providerId);

        // Deletar endereço
        await this.repository.toDeleteAddress(providerId);
    }
}