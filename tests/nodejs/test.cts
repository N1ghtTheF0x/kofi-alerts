import * as KofiClient from "../../dist"

(async function()
{
    const client = new KofiClient.KoFiAlertsClient({
        pageId: "",
        userKey: ""
    })
    await client.connect()
    client.onalert = a => console.dir(a)
})()