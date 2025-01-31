import { IActivityAlert, IConfigAlert, IDonationAlert, IGoalAlert, KoFi, KoFiAlert } from "./alerts"
import { negotiateAccessToken, negotiateToken } from "./negotiate"
import { HubConnection, HubConnectionBuilder, IHttpConnectionOptions, LogLevel } from "@microsoft/signalr"
import { ALERT_IMAGE_REGEX, ALERT_LABEL_REGEX, ALERT_LABEL_CONTENT_REGEX, TokenError, AccessTokenError } from "./utils"

/**
 * A Ko-Fi alerts client
 */
export class KoFiAlertsClient
{
    private _connection?: HubConnection
    /**
     * The last received alert from ko-fi
     */
    public lastAlert?: KoFiAlert
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
    public onalert?: (alert: KoFiAlert) => void
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
     * @throws {TokenError} failed to receive the token
     * @throws {AccessTokenError} failed to receive the access token
     */
    public async connect()
    {
        // get the token with the key
        const {token} = await negotiateToken({userKey: this._options.userKey})
        // get the access token with the token and page id
        const {url,accessToken} = await negotiateAccessToken({negotiationToken: token,pageId: this._options.pageId})
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
        // listen on the events that ko-fi sends via signalr
        this._connection.on("newStreamAlert",this._on_new_stream_alert.bind(this))
        this._connection.on("updateGoalOverlay",this._on_update_goal_overlay.bind(this))
        this._connection.on("updateAlertActivity",this._on_update_alert_activity.bind(this))
        // listen on general signalr events
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
    private _send_config_alert()
    {
        const config: IConfigAlert = {
            type: "config"
        }
        this.onalert?.(config)
        this.lastAlert = config
    }
    private _on_new_stream_alert(message: string,ttsMessage: string | null)
    {
        // this might happen if you update the config on the website but isn't required here
        if(message.includes(`configreset_${this._options.userKey}`))
            return this._send_config_alert()
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
        const donation: IDonationAlert = {
            type: "donation",
            raw: message,
            tts: ttsMessage ?? undefined,
            username: name,
            amount,
            image: image.length === 0 ? undefined : image
        }
        this.onalert?.(donation)
        this.lastAlert = donation
    }
    private _on_update_goal_overlay(message: string)
    {
        const json: KoFi.Goal = JSON.parse(message)
        // this might happen if you update the config on the website but isn't required here
        if(json.Title.includes(`configreset_${this._options.userKey}`))
            return this._send_config_alert()
        const goal: IGoalAlert = {
            type: "goal",
            goal: json
        }
        this.onalert?.(goal)
        this.lastAlert = goal
    }
    private _on_update_alert_activity(message: string)
    {
        const json: KoFi.Activities = JSON.parse(message)
        const activity: IActivityAlert = {
            type: "activity",
            activity: json
        }
        this.onalert?.(activity)
        this.lastAlert = activity
    }
}

export namespace KoFiAlertsClient
{
    /**
     * Options for the Ko-Fi client
     */
    export interface IOptions
    {
        /**
         * The user key of the creator which you can find {@link https://ko-fi.com/streamalerts/settings#streamAlertSection here}
         */
        userKey: string
        /**
         * The page id of the creator which you can find {@link https://ko-fi.com/Manage/Zapier here}
         */
        pageId: string
        /**
         * pass option for signalr logger
         * @see {@link IHttpConnectionOptions}
         */
        logger?: IHttpConnectionOptions["logger"]
    }
}