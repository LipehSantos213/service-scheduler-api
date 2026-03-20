import bcrypt from "bcrypt";

/**
 * 
 * @param data String a ser gerado o hash (forneça sem espaços)
 * @returns Uma string do hash gerado
 */
export async function hash(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
}

/**
 * Compara o dado bruto com a hash do banco
 * @param data String sem hash 
 * @param hash String com hash (do banco de dados)
 * @returns 
 */
export async function compareHash(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
}