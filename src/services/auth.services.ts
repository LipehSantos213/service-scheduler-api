import { Prestador, Usuario } from "@prisma/client";
import { ConflictError, NotFoundError, UnauthorizedError, UnprocessableEntityError } from "../errors/http.errors";
import { compareHash, hash } from "../plugins/hashing";
import { AuthRepository } from "../repositories/auth.repository";
import { ProviderRepository } from "../repositories/provider.repository";
import { UserCreateType, UserUpdateProfileType } from "../schemas/user.schema";
import { LoginType } from "../schemas/auth.schema";



export class AuthServices {
    constructor(
        private repository: AuthRepository
    ) { }

    /**
     * Validação dos dados de Prestador no body
     * @param data Dados do Body
     * @returns Nada
     */
    validateProvideData(data: UserCreateType): void {
        const dataProvideRequired = [
            "companyName",
            "description",
            "typeService",
            "emailBusiness",
            "phoneBusiness"
        ] as const;

        if (!data.provider) {
            console.log("[AUTH] É necessarios os dados do Prestador !");
            throw new Error();
        }
        for (const field of dataProvideRequired) {
            const provideData = data.provider;
            const value = provideData[field];
            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {
                console.log(`[AUTH] O campo '${field}' precisa ser fornecido`);
                throw new UnprocessableEntityError(`O campo '${field}' precisa ser fornecido`);
            }
        }
    }

    /**
     * Analise para ver se os dados já não são cadastrados no banco
     * @param data Dados do Body
     */
    async validateDataForUser(data: UserCreateType): Promise<void> {
        // Verificando se o email ja não foi cadastrado
        const userEmail = await this.repository.getUserByEmail(data.email.trim());
        if (userEmail) {
            console.log("[AUTH] Email ja cadastrado !");
            throw new Error();
        }

        // Verificando se o telefone ja não foi cadastrado
        const userPhone = await this.repository.getUserByPhone(data.phone.trim());
        if (userPhone) {
            console.log("[AUTH] Telefone ja cadastrado !");
            throw new Error();
        }

        // Verificar os dados do Prestador
        if (data.provider !== undefined) {
            // Criar uma sessão de ProviderRepositry
            const providerRepository = new ProviderRepository();

            const nameCompany = data.provider.companyName.trim();
            // Analizar se o nome do estabelecimento já não é cadastrado
            const nameCompanyExisting = await providerRepository.getProviderByCompanyName(nameCompany);
            if (nameCompanyExisting) {
                console.log("[AUTH] Nome do estabelecimento já existente !");
                throw new Error();
            }

            // Analizar se o instagram já não é cadastrado
            if (data.provider.instagram) {
                const instagramExisting = await providerRepository.getPrviderByInstagram(data.provider.instagram);
                if (instagramExisting) {
                    console.log("[AUTH] Instagram já cadastrado !");
                    throw new ConflictError("Tente outro instagram !");
                }

            }

            // Analizar se o email comercial enviado já não é existente
            const emailBusiness = await providerRepository.getProviderByBusinessEmail(data.provider.emailBusiness.trim());
            if (emailBusiness) {
                console.log("[AUTH] Email comercial enviado pelo usuario já é existente");
                throw new ConflictError("Tente outro email comercial");
            }

            // Analizar se o telefone comercial já não é existente
            const phoneBusiness = await providerRepository.getProviderByBusinessPhone(data.provider.phoneBusiness.trim());
            if (phoneBusiness) {
                console.log("[AUTH] Telefone comercial enviado pelo usuario já é existente");
                throw new ConflictError("Tente outro telefone comercial");
            }

        }


    }

    /**
     * Buscar Usuario pelo Id
     * @param userId Id do Usuario
     * @returns Os dados do Usuario
     */
    async getUser(userId: number): Promise<{ prestador: Prestador | null } & Usuario> {
        const user = await this.repository.getUserById(userId);
        if (!user) {
            console.log(`[AUTH] Usuario com o ID ${userId} não encontrado`);
            throw new NotFoundError("Usuario não encontrado !");
        }
        return user;
    }

    /**
     * Faz o login do Usuario com o Email e Senha Fornecido
     * @param data Dados do Body com o Email e Senha
     * @returns Os dados do Usuario registrado no Banco
     */
    async loginUser(data: LoginType): Promise<{ prestador: Prestador | null } & Usuario> {
        // Buscar Usuario pelo email do body
        const user = await this.repository.getUserByEmail(data.email.trim());
        if (!user) {
            console.log(`[AUTH] Tentativa se fazer login com o email: ${data.email.trim()}`);
            throw new NotFoundError("Usuario não encontrado !");
        }

        // Verificar se data.password é igual ao hash no banco
        const passwordIsCorrect = await compareHash(data.password.trim(), user.senha);
        if (!passwordIsCorrect) {
            console.log(`[AUTH] Tentativa de acessar a conta com o email: ${data.email}`);
            throw new UnauthorizedError("Senha incorreta !");
        }

        return user;
    }

    /**
     * Realiza o logout do Usuario revogando o Refresh Token que esta utilizando
     * @param userId Id do Usuario
     * @param jti Id dp token gerado no login
     * @param token Refresh Token na string pura
     */
    // async logoutUser(userId: number, jti: string): Promise<void> {
    //     // Verifica se o Usuario existe
    //     await this.getUser(userId);

    //     // Busca o registro na tabela Refresh Token com o userId e o jti
    //     const tableRefreshUser = await this.repository.getRefreshTokenWithJTI(userId, jti.trim());

    //     // Verifica se o que foi buscado não é vazio
    //     if (!tableRefreshUser) {
    //         console.log(`[AUTH] Usuario ${userId} tentou buscar seu token com o jti ${jti.trim()}`);
    //         NotFoundError("Token não encontrado !");
    //     }

    //     // Atualiza o registro na tabela como revogado
    //     await this.repository.revokeRefreshToken(userId, jti);
    // }

    /**
     * Registrar Usuario com a Role 'CUSTOMER'
     * @param data Dados do Body
     * @returns Os dados do Usuario registrado no Banco
     */
    async registerUserCustomer(data: UserCreateType): Promise<Usuario> {
        // Verificar se os dados enviados já não existem no banco
        await this.validateDataForUser(data);

        // Gerar hash da senha do usuario
        const passwordHash = await hash(data.password.trim());

        // Criar no banco de dados o usuario
        const userCreate = await this.repository.createUserCustomer(data, passwordHash);

        return userCreate;
    }

    /**
     * Registrar Usuario com a Role 'PROVIDER'
     * @param data Dados do Body
     * @returns Os dados do Usuario registrado no Banco
     */
    async registerUserProvider(data: UserCreateType): Promise<{ prestador: Prestador | null } & Usuario | null> {
        // Validação dos Dados de Prestador
        this.validateProvideData(data);

        // Verificar se os dados já não existem no banco
        await this.validateDataForUser(data);

        // Gerar Hash da senha
        const passwordHash = await hash(data.password.trim());

        // Criar no banco de dados o Usuario 'Provider'
        const userProvider = await this.repository.createUserProvider(data, passwordHash);

        return userProvider;
    }

    /**
     * Salva o Token do Usuario, se estiver um em uso dispara um error
     * @param userId Id do Usuario
     * @param token Refresh Token a ser Salvo
     * @param jti Id do Refresh Token assinado no token
     */
    async saveRefreshTokenOfUser(userId: number, token: string, jti: string): Promise<void> {
        // Verificar se o Usuario existe
        await this.getUser(userId);

        // Verificar se não a um Refresh Token em uso
        const refreshExisting = await this.repository.getRefreshTokensOfUser(userId);
        if (refreshExisting) {
            console.log(`[AUTH] Usuario com o ID ${userId} tentou pegar outro Refresh Token !`);
            throw new ConflictError("Já existe um Refresh Token em uso pelo usuario !");
        }

        // Gerar um hash do token enviado no paramento
        const tokenHash = await hash(token.trim());

        // Salvar no banco o Refresh do usuario
        await this.repository.saveRefreshTokenUser(userId, jti.trim(), tokenHash);
    }

    /**
     * Revoga o Token na Black List 
     * @param userId Id do Usuario
     * @param jti Id do refresh Token
     * @returns Dados do Usuario que revogou o Token
     */
    async revokeRefreshOfUser(userId: number, jti: string): Promise<Usuario> {
        // Verificar se o usuario existe
        const user = await this.getUser(userId);

        // Verificar se o Token existe ou já foi revogado
        const refreshExisting = await this.repository.getRefreshTokenWithJTI(userId, jti.trim());
        if (!refreshExisting || refreshExisting.revogado) {
            console.log(`[AUTH] Usuario ${userId} tentou revogar o token ${jti.trim()}`);
            throw new NotFoundError("Token não existe ou já foi invalidado");
        }

        // Atualizar o Token no banco de dados
        await this.repository.revokeRefreshToken(userId, jti.trim());

        return user;
    }

    /**
     * 
     * @param userId Id do Usuario
     * @param data Dados a serem atualizados
     */
    async updateProfileUser(userId: number, data: UserUpdateProfileType): Promise<void> {
        // Verificar se o Usuario existe no banco
        await this.getUser(userId);

        // Atualizar no banco com os dados enviados
        await this.repository.updateProfileUser(userId, data);
    }

    /**
     * 
     * @param userId Id do Usuario
     * @param newPassword Nova senha a ser atualizada
     */
    async updatePasswordUser(userId: number, currentPassword: string, newPassword: string): Promise<void> {
        // Verificar se o usuario existe no banco
        const user = await this.getUser(userId);

        // Comparar senha enviada com o hash da senha no banco de dados
        const passwordCorrect = await compareHash(currentPassword, user.senha);

        // Verificar se a senha atual esta correta
        if (!passwordCorrect) {
            console.log(`[AUTH] Usuario ${userId} errou sua senha atual !`);
            throw new UnauthorizedError("Senha incorreta !");
        }

        // Gerar hash da nova senha
        const hashPassword = await hash(newPassword);

        // Atualizar no banco a nova senha 
        await this.repository.updatePasswordOfUser(userId, hashPassword);
    }
}

