# `@ntf/kofi-alerts`

Get alerts from Ko-Fi via JavaScript

## Installation

Use your favourite package manager, idk

```sh
npm install @ntf/kofi-alerts
```

```sh
yarn add @ntf/kofi-alerts
```

```sh
pnpm install @ntf/kofi-alerts
```

## Usage

### Importing

This library can be used in `CommonJS` and `ESModule` environments

```typescript
const KofiAlertsClient = require("@ntf/kofi-alerts");
```

```typescript
import KofiAlertsClient from "@ntf/kofi-alerts";
```

### Requirements

You need:

- the user key
- the page id

you can get the user key by visiting [the Stream Alert Overlay section](https://ko-fi.com/streamalerts/settings#streamAlertSection) and then extract it from the URL that is provided (`https://ko-fi.com/streamalerts/overlay/<user-key>`)

you can get the page id by visiting [the Connect to Zapier section](https://ko-fi.com/Manage/Zapier) and copy the value in `Page Id`

### Creating the client

store the required information somewhere save and pass it to the constructor of the class `KoFiAlertsClient`:

```js

const userKey = "<your-user-key>"
const pageId = "<your-page-id>"

const client = new KoFiAlertsClient({
    userKey: userKey,
    pageId: pageId,
    // optional, see more on @microsoft/signalr type IHttpConnectionOptions
    logger: ...
})

```

### Connecting the client

now use the exposed method `connect` to connect to the servers. Keep in mind it can throw exceptions here

```js
await client.connect()
```

### Listening on alerts

when the connection has been enstablished, you can set a callback function on `onalert` to get the alert

```js
client.onalert = (alert) => {
    console.info(alert)
}
```

The alert object contains the following properties:

- `name`: the name of the donor
- `amount`: the amount of money the doner has donated, this value is in the currency of the profile
- `tts`: the text-to-speech message if it exists
- `image`: the image of the donor? not sure, might be HTML too
- `raw`: the raw message which is a HTML code snippet

## License stuff that nobody reads

Just like any [Open Source Project](https://github.com/N1ghtTheF0x/kofi-alerts) this has a [License](./LICENSE), the MIT License
