import { AccessTokenError, createKoFiTimestamp, TokenError } from "./utils"

/**
 * The URL endpoint where to receive the token
 */
export const KOFI_NEGOTIATE_TOKEN_URL = "https://ko-fi.com/api/streamalerts/negotiation-token"
/**
 * The URL endpoint where to receive the access token
 */
export const KOFI_NEGOTIATE_ACCESS_TOKEN_URL = "https://sa-functions.ko-fi.com/api/negotiate"

/**
 * Options to pass through the token negotiation
 */
export interface IKofiNegotiateTokenOptions
{
    /**
     * The user key of the creator
     */
    userKey: string
}

/**
 * The response from the server when requesting the token
 */
export interface IKofiNegotiateTokenResponse
{
    /**
     * The token from the user key
     */
    token: string
}

/**
 * Get the token with the user key
 * @param options The options to pass through
 * @returns The token from the user key
 * @throws {TokenError} failed to fetch the token in any kind of way (no internet, wrong user key, etc.)
 */
export async function negotiateToken(options: IKofiNegotiateTokenOptions): Promise<IKofiNegotiateTokenResponse>
{
    const url = `${KOFI_NEGOTIATE_TOKEN_URL}?userKey=${options.userKey}&_=${Date.now().toString()}`
    try
    {
        // @ts-ignore
        const response = await fetch(url,{headers: {"User-Agent": `${PKG_NAME}/${PKG_VERSION}`}})
        return await response.json() as IKofiNegotiateTokenResponse
    }
    catch(e)
    {
        throw new TokenError(options.userKey,{cause: e})
    }
}

/**
 * Options to pass through the access token negotiation
 */
export interface IKofiNegotiateAccessTokenOptions
{
    /**
     * The token from {@link negotiateToken}
     */
    negotiationToken: string
    /**
     * The page id of the creator
     */
    pageId: string
}

/**
 * The response from the server when requesting a access token
 */
export interface IKofiNegotiateAccessTokenResponse
{
    /**
     * The URL endpoint of the signalr hub
     */
    url: string
    /**
     * The access token the signalr client has to use
     */
    accessToken: string
}

/**
 * Get the access token with the negotiated token and page id
 * @param options The options to pass through
 * @returns The URL endpoint and access token which the signalr client requires
 * @throws {AccessTokenError} failed to fetch the token in any kind of way (no internet, wrong token/page id, etc.)
 */
export async function negotiateAccessToken(options: IKofiNegotiateAccessTokenOptions): Promise<IKofiNegotiateAccessTokenResponse>
{
    const url = `${KOFI_NEGOTIATE_ACCESS_TOKEN_URL}?negotiationToken=${options.negotiationToken}&pageId=${options.pageId}&timestamp=${createKoFiTimestamp()}`
    try
    {
        // @ts-ignore
        const response = await fetch(url,{method: "POST",headers: {"User-Agent": `${PKG_NAME}/${PKG_VERSION}`}})
        return await response.json() as IKofiNegotiateAccessTokenResponse
    }
    catch(e)
    {
        throw new AccessTokenError(options.negotiationToken,options.pageId,{cause: e})
    }
}