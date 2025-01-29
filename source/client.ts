import { kofi_negotiate_access_token, kofi_negotiate_token } from "./negotiate"
import { HubConnection, HubConnectionBuilder, IHttpConnectionOptions, LogLevel } from "@microsoft/signalr"

const ALERT_IMAGE_REGEX = /<div class='sa-img'>(.*)<\/div>/gm
const ALERT_LABEL_REGEX = /<div class='sa-label'>(.*)<\/div>/gm
const ALERT_LABEL_CONTENT_REGEX = /Got (.+) from (.+)!/gm

interface IKofiAlertEvents
{
    "ready": []
    "close": [err?: Error]
    "alert": [alert: KoFiAlertsClient.IAlert]
}

type KofiAlertEventCallbacks = {
    [K in keyof IKofiAlertEvents as `on${K}`]?: (...args: IKofiAlertEvents[K]) => void
}

/**
 * A Ko-Fi alerts client
 */
class KoFiAlertsClient implements KofiAlertEventCallbacks
{
    private _connection?: HubConnection
    /**
     * gets called when the client is ready for incoming alerts
     */
    public onready?: () => void
    /**
     * gets called when the client closed with an optional error
     */
    public onclose?: (err?: Error) => void
    /**
     * gets called when the client receives an alert
     */
    public onalert?: (alert: KoFiAlertsClient.IAlert) => void
    private readonly _options: Readonly<KoFiAlertsClient.IOptions>
    /**
     * Create a new Ko-Fi alert client instance
     * @param options Options to pass trough
     */
    public constructor(options: KoFiAlertsClient.IOptions)
    {
        this._options = options
    }
    /**
     * Connect the client to the servers, this may take some time
     */
    public async connect()
    {
        // get the token with the key
        const {token} = await kofi_negotiate_token({userKey: this._options.userKey})
        // get the access token with the token and page id
        const {url,accessToken} = await kofi_negotiate_access_token({negotiationToken: token,pageId: this._options.pageId})
        // this hub connection builder is 1:1 of the JavaScript code they use, except for logger
        this._connection = new HubConnectionBuilder()
        .withUrl(url,{
            accessTokenFactory: () => accessToken,
            logger: this._options.logger ?? LogLevel.None
        })
        .withAutomaticReconnect()
        .build()
        // connect to server
        await this._connection.start()
        this.onready?.()
        // listen on "newStreamAlert", the name of the alert message
        this._connection.on("newStreamAlert",this._on_alert.bind(this))
        this._connection.onclose(this._on_close.bind(this))
    }
    /**
     * Disconnect the client from the server
     */
    public async disconnect()
    {
        await this._connection?.stop()
        this._connection = undefined
    }
    private _on_close(err?: Error)
    {
        this.onclose?.(err)
    }
    private _on_alert(message: string,ttsMessage: string | null)
    {
        // this might happen if you update the config on the website but isn't required here
        if(message.includes(`configreset_${this._options.userKey}`))
            return
        // TODO: is this also html?
        // get the image, this returns an empty string if not found
        const image = ALERT_IMAGE_REGEX.exec(message)?.[1] as string
        // get the content of the label
        const label = ALERT_LABEL_REGEX.exec(message)?.[1] as string
        const labelContent = ALERT_LABEL_CONTENT_REGEX.exec(label)
        // get information from the label
        const amount = parseFloat(labelContent?.[1] ?? "0.00")
        const name = labelContent?.[2] ?? "Someone"
        // you've got money!
        const alert: KoFiAlertsClient.IAlert = {
            raw: message,
            tts: ttsMessage ?? undefined,
            name,
            amount,
            image: image.length === 0 ? undefined : image
        }
        this.onalert?.(alert)
    }
}

namespace KoFiAlertsClient
{
    /**
     * Options for the Ko-Fi client
     */
    export interface IOptions
    {
        /**
         * The key of the user to get alerts from
         */
        userKey: string
        /**
         * The page id of the user
         */
        pageId: string
        /**
         * pass option for signalr logger
         * @see IHttpConnectionOptions
         */
        logger?: IHttpConnectionOptions["logger"]
    }
    /**
     * An alert object containing information about a alert
     */
    export interface IAlert
    {
        /**
         * The raw HTML code of the alert
         */
        raw: string
        /**
         * The image of the alert
         */
        image?: string
        /**
         * Text-To-Speech message if present
         */
        tts?: string
        /**
         * The name of the donor
         */
        name: string
        /**
         * The amount of money donated by the donor
         */
        amount: number
    }
}

export default KoFiAlertsClient