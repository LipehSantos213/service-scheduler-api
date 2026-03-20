import { ConflictError, NotFoundError, UnprocessableEntityError } from "../errors/http.errors";
import { hash } from "../plugins/hashing";
import { AuthRepository } from "../repositories/auth.repository";
import { ProviderRepository } from "../repositories/provider.repository";
import { UserCreateType } from "../schemas/user.schema";



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
     * Registrar Usuario com a Role 'CUSTOMER'
     * @param data Dados do Body
     * @returns id do usuario no banco de dados
     */
    async registerUserCustomer(data: UserCreateType): Promise<number> {
        // Verificar se os dados enviados já não existem no banco
        await this.validateDataForUser(data);

        // Gerar hash da senha do usuario
        const passwordHash = await hash(data.password.trim());

        // Criar no banco de dados o usuario
        const userCreate = await this.repository.createUserCustomer(data, passwordHash);

        return userCreate.id;
    }

    /**
     * Registrar Usuario com a Role 'PROVIDER'
     * @param data Dados do Body
     * @returns id do usuario no banco de dados 
     */
    async registerUserProvider(data: UserCreateType): Promise<number> {
        // Validação dos Dados de Prestador
        this.validateProvideData(data);

        // Verificar se os dados já não existem no banco
        await this.validateDataForUser(data);

        // Gerar Hash da senha
        const passwordHash = await hash(data.password.trim());

        // Criar no banco de dados o Usuario 'Provider'
        const userProvider = await this.repository.createUserProvider(data, passwordHash);

        return userProvider!.id;
    }

    /**
     * Salva o Token do Usuario, se estiver um em uso dispara um error
     * @param userId Id do Usuario
     * @param token Refresh Token a ser Salvo
     * @param jti Id do Refresh Token assinado no token
     */
    async saveRefreshTokenOfUser(userId: number, token: string, jti: string): Promise<void> {
        // Verificar se o Usuario existe
        const user = await this.repository.getUserById(userId);
        if (!user) {
            console.log(`[AUTH] Usuario com o ID ${userId} não encontrado !`);
            throw new NotFoundError("Usuario não encontrado !");
        }

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
     */
    async revokeRefreshOfUser(userId: number, jti: string): Promise<void> {
        // Verificar se o usuario existe
        const user = await this.repository.getUserById(userId);
        if (!user) {
            console.log(`[AUTH] Usuario com o ID ${userId} não encontrado !`);
            throw new NotFoundError("Usuario não encontrado !");
        }

        // Verificar se o Token existe
        const refreshExisting = await this.repository.getRefreshTokenWithJTI(userId, jti.trim());
        if (!refreshExisting) {
            console.log(`[AUTH] Usuario ${userId} tentou revogar o token ${jti.trim()}, porem não existe`);
            throw new NotFoundError("Token não existe !");
        }

        // Salvar o Token no banco de dados
        await this.repository.revokeRefreshToken(userId, jti.trim());
    }


}

