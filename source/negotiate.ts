const KOFI_NEGOTIATE_TOKEN_URL = "https://ko-fi.com/api/streamalerts/negotiation-token"
const KOFI_NEGOTIATE_ACCESS_TOKEN_URL = "https://sa-functions.ko-fi.com/api/negotiate"

export interface IKofiNegotiateTokenOptions
{
    userKey: string
}

export interface IKofiNegotiateTokenResponse
{
    token: string
}

/** internally used by the client to get the token */
export async function kofi_negotiate_token(options: IKofiNegotiateTokenOptions): Promise<IKofiNegotiateTokenResponse>
{
    const url = `${KOFI_NEGOTIATE_TOKEN_URL}?${new URLSearchParams({
        userKey: options.userKey,
        _: Date.now().toString()
    })}`
    const response = await fetch(url)
    return await response.json() as IKofiNegotiateTokenResponse
}

export interface IKofiNegotiateAccessTokenOptions
{
    negotiationToken: string
    pageId: string
}

export interface IKofiNegotiateAccessTokenResponse
{
    url: string
    accessToken: string
}

function _create_timestamp()
{
    const date = new Date()
    return `${date.getFullYear()}_${date.getMonth()+1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}_${date.getMilliseconds()}` as const
}

/** internally used by the client to get the access token, the token from kofi_negotiate_token is required here */
export async function kofi_negotiate_access_token(options: IKofiNegotiateAccessTokenOptions): Promise<IKofiNegotiateAccessTokenResponse>
{
    const url = `${KOFI_NEGOTIATE_ACCESS_TOKEN_URL}?${new URLSearchParams({
        negotiationToken: options.negotiationToken,
        pageId: options.pageId,
        timestamp: _create_timestamp()
    })}`
    const response = await fetch(url,{method: "POST"})
    return await response.json() as IKofiNegotiateAccessTokenResponse
}