import { Agendamento, Disponibilidade, Endereco, Prestador, Servico, StatusAgendamento, Usuario } from "@prisma/client";
import { prisma } from "../database/prisma";
import { InternalServerError } from "../errors/http.errors";
import { CreateServiceType, UpdateServiceType } from "../schemas/services.schema";
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
            throw new InternalServerError("Error ao buscar prestador pelo instagram");
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
            throw new InternalServerError("Error ao buscar prestador pelo email comercial");
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
                    id: idAvailability
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
     * Busca todos os agendamento do Prestador
     * @param providerId Id do usuario na tabela Prestador
     * @returns Todos os agendamento do Prestador com os clientes
     */
    async getAllAppointmentsOfProvider(providerId: number) {
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
                    cliente: true,
                    endereco: true,
                    disponibilidade: true,
                    servico: true
                }
            })
        } catch (e) {
            throw new InternalServerError("Error ao buscar todos os Agendamentos do Prestador");
        }
    }

    /**
     * 
     * @param id Id do agendamento
     * @param providerId Id do usuario na tabela Prestador
     * @returns Os dados do agendamento
     */
    async getAppointmentsById(id: number, providerId: number) {
        try {
            return await prisma.agendamento.findUnique({
                where: {
                    id,
                    prestadorId: providerId
                },
                include: {
                    cliente: true,
                    servico: true,
                    disponibilidade: true,
                    endereco: true
                }
            });
        } catch (e) {
            throw new InternalServerError("Error ao buscar agendamento !");
        }
    }

    /**
     * Atualizar o status do agendamento
     * @param id Id do agendamento
     * @param status Status a ser atualizado
     */
    async updateStatusAppointment(id: number, status: StatusAgendamento): Promise<void> {
        await prisma.agendamento.updateMany({
            where: {
                id
            },
            data: {
                status: status
            }
        })
    }

    /**
     * Buscar todos os agendamento pelo status
     * @param providerId Id do usuario na tabela Prestador
     * @param status Status do agendamento
     * @returns Todos os agendamento com o status igual
     */
    async getAppointmentsWithStatus(providerId: number, status: StatusAgendamento) {
        return await prisma.agendamento.findMany({
            where: {
                prestadorId: providerId,
                status
            },
            include: {
                cliente: true,
                servico: true,
                disponibilidade: true,
                endereco: true
            }
        });
    }

    /**
     * Buscar serviço pelo Id
     * @param id Id do Serviço
     */
    async getServiceById(id: number): Promise<Servico | null> {
        try {
            return await prisma.servico.findUnique({
                where: {
                    id: id
                }
            });
        } catch (e) {
            throw new InternalServerError("Error ao buscar serviço !");
        }
    }

    /**
     * Busca todos os serviços de um prestador
     * @param providerId Id do usuario na tabela Prestador
     */
    async getServicesOfProvider(providerId: number): Promise<Servico[] | null> {
        return await prisma.servico.findMany({
            where: {
                prestadorId: providerId
            }
        });
    }

    /**
     * Buscar serviço do prestador pelo nome
     * @param providerId Id do usuario na tabela Prestador
     * @param name Nome do serviço
     */
    async getServiceOfProviderByName(providerId: number, name: string): Promise<Servico | null> {
        return await prisma.servico.findFirst({
            where: {
                prestadorId: providerId,
                nome: name
            }
        });
    }

    /**
     * Criar um serviço do prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param data Dados para a criação do Serviço
     */
    async registerServiceOfProvider(providerId: number, data: CreateServiceType): Promise<void> {
        await prisma.servico.create({
            data: {
                prestadorId: providerId,
                nome: data.nameService,
                descricao: data.description,
                duracao: data.duration,
                preco: data.price,
            }
        })
    }

    /**
     * Atualizar dados do serviço do prestador
     * @param id Id do serviço (Verificar se esse serviço é do Prestador)
     * @param data Dados para atualizar o Serviço
     */
    async updateServiceOfProvider(id: number, data: UpdateServiceType): Promise<void> {
        await prisma.servico.updateMany({
            where: {
                id: id,
            },
            data: {
                nome: data.nameService,
                descricao: data.description,
                duracao: data.duration,
                preco: data.price
            }
        })
    }

    /**
     * Deletar um serviço do prestador
     * @param id Id do serviço (Verificar se esse serviço é do Prestador)
     */
    async deleteServiceOfProvider(id: number): Promise<void> {
        await prisma.servico.delete({
            where: {
                id
            }
        });
    }

    /**
     * Atualizar os status do serviço (ativo ou desativado)
     * @param id Id do serviço
     * @param status Valor booleando para ativar ou desativar esse serviço
     */
    async updateStatusOfService(id: number, status: boolean): Promise<void> {
        await prisma.servico.updateMany({
            where: {
                id
            },
            data: {
                ativo: status
            }
        })
    }

    /**
     * Buscar Endereço do prestador
     * @param providerId Id do usuario na tabela Prestador
     * @returns Dados do endereço
     */
    async getAddressOfProvider(providerId: number): Promise<Endereco | null> {
        return await prisma.endereco.findFirst({
            where: {
                prestadorId: providerId
            }
        });
    }

    /**
     * Registrar um endereço do prestador
     * @param providerId Id do usuario na tabela Prestador
     * @param data Dados da criação do Endereço
     */
    async createAddress(providerId: number, data: CreateAddressProviderType): Promise<void> {
        await prisma.endereco.create({
            data: {
                prestadorId: providerId,
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
    async toUpdateAddress(providerId: number, data: UpdateAddressProviderType): Promise<void> {
        await prisma.endereco.updateMany({
            where: { prestadorId: providerId },
            data: {
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
    async toDeleteAddress(providerId: number): Promise<void> {
        await prisma.endereco.delete({
            where: {
                prestadorId: providerId
            }
        });
    }
}