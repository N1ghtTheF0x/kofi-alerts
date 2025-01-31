import type { negotiateAccessToken } from "./negotiate"

export class TokenError extends Error
{
    public readonly userKey: string
    public constructor(userKey: string,options?: ErrorOptions)
    {
        super("failed to receive token",options)
        this.userKey = userKey.slice(-4).padStart(userKey.length,"*")
    }
}

export class AccessTokenError extends Error
{
    public readonly token: string
    public readonly pageId: string
    public constructor(token: string,pageId: string,options?: ErrorOptions)
    {
        super("failed to receive access token",options)
        this.token = token.slice(-4).padStart(token.length,"*")
        this.pageId = token.slice(-2).padStart(pageId.length,"*")
    }
}

/**
 * Create a time stamp in the format {@link negotiateAccessToken} wants
 * @param date The date to create a time stamp from, default is now
 * @returns A time stamp in the following format: `YYYY_MM_DD_HH_MM_SS_MS`
 */
export function createKoFiTimestamp(date = new Date())
{
    return `${date.getFullYear()}_${date.getMonth()+1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}_${date.getMilliseconds()}` as const
}

/**
 * Regular expression for extracting the image from a donation
 */
export const ALERT_IMAGE_REGEX = /<div class='sa-img'>(.*)<\/div>/gm
/**
 * Regular expression for extracting the label from a donation
 */
export const ALERT_LABEL_REGEX = /<div class='sa-label'>(.*)<\/div>/gm
/**
 * Regular expression for extracting the name and amount of money donated from the label
 */
export const ALERT_LABEL_CONTENT_REGEX = /Got (.+) from (.+)!/gm