import { Agendamento, Disponibilidade, Endereco, Prestador, Servico, Usuario } from "@prisma/client";
import { prisma } from "../database/prisma";
import { InternalServerError } from "../errors/http.errors";
import { CreateServiceType } from "../schemas/services.schema";
import { CreateAvailabilityType, UpdateAvailabilityType } from "../schemas/availability.schema";
import { CreateAddressProviderType, UpdateAddressProviderType } from "../schemas/address.schema";



export class ProviderRepository {

    /*
        1. COLOCAR CAPTURA DE ERROR PARA DADOS DUPLICADO
    */

    /**
     * Buscar Prestador pelo id do Usuario
     * @param userId Id do Prestador na tabela Usuarios
     * @returns Os dados dele na tabela Usuario e Prestador
     */
    async getProviderById(userId: number): Promise<{ prestador: Prestador | null } & Usuario | null> {
        return prisma.usuario.findUnique({
            where: { id: userId, role: "PROVIDER" },
            include: {
                prestador: true
            }
        })
    }

    /**
     * Busca Prestador pelo instagram
     * @param instagram Instagram
     * @returns Dados do Usuario na Tabela Prestador
     */
    async getPrviderByInstagram(instagram: string): Promise<Prestador | null> {
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

    /**
     * Busca Prestador pelo nome do estabelecimento
     * @param companyName Nome do Estabecimento
     * @returns Dados do usuario na tabela Prestador
     */
    async getProviderByCompanyName(companyName: string): Promise<Prestador | null> {
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

    /**
     * Busca Prestador pelo email comercial
     * @param email Email comercial
     * @returns Dados do usuario na tabela Prestador
     */
    async getProviderByBusinessEmail(email: string): Promise<Prestador | null> {
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

    /**
     * Busca Prestador pelo telefone comercial
     * @param phone Telefone comercial
     * @returns Dados do usuario na tabela Prestador
     */
    async getProviderByBusinessPhone(phone: string): Promise<Prestador | null> {
        try {
            return await prisma.prestador.findFirst({
                where: { telefoneComercial: phone }
            });
        } catch (e) {
            throw new InternalServerError("");
        }
    }

    /**
     * Criar uma Disponibilidade do Prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param data Dados para a criação a Disponibilidade
     */
    async createAvailabilityOfProvider(providerId: number, data: CreateAvailabilityType): Promise<void> {
        try {
            await prisma.disponibilidade.create({
                data: {
                    prestadorId: providerId,
                    diaSemana: data.dayWeek,
                    horaInicio: data.startTime,
                    horaFim: data.endTime,
                    intervalo: data.interval
                }
            })
        } catch (e) {
            throw new InternalServerError("Error ao criar Disponibilidade do Prestador !");
        }
    }

    /**
     * Buscar uma disponibilidade pelo Id
     * @param providerId Id do usuario na tabela Prestador
     * @param availabilityId Id da disponibilidade
     * @returns Dados da disponibilidade
     */
    async getAvailabilityById(providerId: number, availabilityId: number): Promise<Disponibilidade | null> {
        return await prisma.disponibilidade.findUnique({
            where: {
                id: availabilityId,
                prestadorId: providerId
            }
        });
    }

    /**
     * Busca a Disponibilidade do Prestador no dia da semana especifico
     * @param providerId Id do usuario na tabela Prestador
     * @param day Dia da semana (0: Domingo, etc...)
     * @returns Dados da Disponibilidade
     */
    async getAvailabilityOfDay(providerId: number, day: number): Promise<Disponibilidade[] | null> {
        try {
            return await prisma.disponibilidade.findMany({
                where: {
                    prestadorId: providerId,
                    diaSemana: day
                },
            })
        } catch (e) {
            console.log(`[ERROR] ${e}`);
            throw new InternalServerError("Error ao buscar a disponibilidades do Prestador no dia");
        }
    }

    /**
     * Busca todas as Disponibilidades do Prestador na semana
     * @param providerId Id do usuario na tabela Prestador
     * @returns Uma lista das disponibilidades do Prestador
     */
    async getAllAvailabilityOfProvider(providerId: number): Promise<Disponibilidade[]> {
        try {
            return await prisma.disponibilidade.findMany({
                where: {
                    prestadorId: providerId
                }
            })
        } catch (e) {
            throw new InternalServerError("Error ao buscar todas as Disponibilidade do Usuario");
        }
    }

    /**
     * Atualizar os dados da Disponibilidade
     * @param providerId Id do usuario na tabela Prestador
     * @param idAvailability Id da disponibilidade
     * @param data Dados para atualizar disponibilidade
     */
    async toUpdateAvailabilityOfProvider(providerId: number, idAvailability: number, data: UpdateAvailabilityType): Promise<void> {
        try {
            await prisma.disponibilidade.updateMany({
                where: {
                    prestadorId: providerId,
                    id:idAvailability
                },
                data: {
                    horaInicio: data.startTime,
                    horaFim: data.endTime,
                    intervalo: data.interval
                }
            })
        } catch (e) {
            throw new InternalServerError("Error ao atualizar dados da Disponnibilidade");
        }
    }

    /**
     * Deletar disponibilidade do prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param availabilityId Id da Disponibilidade
     */
    async toDeleteAvailabilityOfProvider(providerId: number, availabilityId: number): Promise<void> {
        try {
            await prisma.disponibilidade.delete({
                where: { prestadorId: providerId, id: availabilityId }
            });
        } catch (e) {
            throw new InternalServerError("Error ao deletar disponibilidade do Prestador");
        }
    }

    /**
     * Busca todos os agendamentos marcados em uma data
     * @param providerId Id do usuario na tabela Prestador
     * @param date Data do agendamento a ser buscado
     * @returns Lista de agendamento nesse dia
     */
    async getAppointmentsWithDate(providerId: number, date: Date): Promise<Agendamento[]> {
        try {
            return await prisma.agendamento.findMany({
                where: {
                    prestadorId: providerId,
                    data: date
                }
            })
        } catch (e) {
            throw new InternalServerError("Error ao buscar Agendamentos");
        }
    }

    /**
     * Busca todos os agendamento do Prestador
     * @param providerId Id do usuario na tabela Prestador
     * @returns Todos os agendamento do Prestador com os clientes
     */
    async getAllAppointmentsOfProvider(providerId: number): Promise<({ cliente: Usuario } & Agendamento)[]> {
        try {
            return await prisma.agendamento.findMany({
                where: {
                    prestadorId: providerId,
                    status: { in: ["CONFIRMED", "FINISHED"] },
                    data: {
                        gt: new Date() // Maior que a data de hoje
                    }
                },
                include: {
                    cliente: true
                }
            })
        } catch (e) {
            throw new InternalServerError("Error ao buscar todos os Agendamentos do Prestador");
        }
    }

    /**
     * Busca os dados do cliente que agentou um horario
     * @param providerId Id do usuario na tabela Prestador
     * @param appointmentId Id do Agendamento
     * @returns Os dados do Cliente
     */
    async getClientOfAppointment(providerId: number, appointmentId: number): Promise<{ cliente: Usuario } | null> {
        try {
            return await prisma.agendamento.findUnique({
                where: {
                    prestadorId: providerId,
                    id: appointmentId
                },
                select: {
                    cliente: true
                }
            })
        } catch (e) {
            throw new InternalServerError("Error ao buscar cliente do agendamento")
        }
    }

    /**
     * Criar um Serviço do Prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param data Dados para a criação do Serviço
     */
    async createServiceOfProvider(providerId: number, data: CreateServiceType): Promise<void> {
        try {
            await prisma.servico.create({
                data: {
                    prestadorId: providerId,
                    nome: data.nameService.trim(),
                    descricao: data.description.trim(),
                    duracao: data.duration.toString(),
                    preco: data.prince,
                }
            })
        } catch (e) {
            throw new InternalServerError("Error ao criar serviço do Prestador !");
        }
    }

    /**
     * Buscar serviço pelo nome
     * @param providerId Id do usuario na tabela Prestador
     * @param name Nome do serviço a ser buscado
     * @returns Os dados do serviço
     */
    async getServiceByName(providerId: number, name: string): Promise<Servico | null> {
        return await prisma.servico.findFirst({
            where: {
                prestadorId: providerId,
                nome: name
            }
        });
    }

    /**
     * Buscar Endereço do prestador
     * @param providerId Id do usuario na tabela Prestador
     * @returns Dados do endereço
     */
    async getAddressOfProvider(providerId:number):Promise<Endereco | null>{
        return await prisma.endereco.findFirst({
            where:{
                prestadorId:providerId
            }
        });
    }

    /**
     * Registrar um endereço do prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param data Dados da criação do Endereço
     */
    async createAddress(providerId:number, data:CreateAddressProviderType):Promise<void>{
        await prisma.endereco.create({
            data:{
                prestadorId:providerId,
                bairro: data.neighborhood,
                cep: data.cep,
                cidade: data.city,
                estado: data.state,
                numero: data.number,
                referencia: data.reference,
                rua: data.road,
            }
        })
    }

    /**
     * Atualizar dados do endereço do Prestador
     * @param providerId Id do usuario na tabela 
     * @param data Dados para atualizar 
     */
    async toUpdateAddress(providerId:number, data:UpdateAddressProviderType):Promise<void>{
        await prisma.endereco.updateMany({
            where:{prestadorId:providerId},
            data:{
                bairro: data.neighborhood,
                cep: data.cep,
                cidade: data.city,
                estado: data.state,
                numero: data.number,
                rua: data.road,
                referencia: data.reference
            }
        });
    }

    /**
     * Deletar endereço do prestador
     * @param providerId Id do prestador na tabela Prestador
     */
    async toDeleteAddress(providerId:number):Promise<void>{
        await prisma.endereco.delete({
            where:{
                prestadorId:providerId
            }
        });
    }
}