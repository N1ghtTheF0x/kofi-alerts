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
const {...} = require("@ntf/kofi-alerts");
```

```typescript
import {...} from "@ntf/kofi-alerts";
```

### Requirements

You need:

- the user key
- the page id

You can get the user key by visiting [the Stream Alert Overlay section](https://ko-fi.com/streamalerts/settings#streamAlertSection) and then extract it from the URL that is provided (`https://ko-fi.com/streamalerts/overlay/<user-key>`). On that same page you also have to set `Alert Text` to:

```txt
Got {amount} from {from_name}!
```

You can get the page id by visiting [the Connect to Zapier section](https://ko-fi.com/Manage/Zapier) and copy the value in `Page Id`

### Creating the client

store the required information somewhere safe and pass it to the constructor of the class `KoFiAlertsClient`:

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

The alert object has a `type` property that can be:

- [`donation`](#donation)
- [`goal`](#goal)
- [`activities`](#activities)
- [`config`](#configuration)

## Alerts

### Donation

The donation alert contains information about a donation that has been made at that moment

- `name`: The name of the donor
- `amount`: The amount of money the doner has donated, this value is in the currency of the profile
- `tts`: The text-to-speech message if it exists
- `image`: The image of the donor? not sure, might be HTML too
- `raw`: The raw message which is a HTML code snippet

### Goal

The goal alert contains one property called `goal` with the following properties:

- `Title`: The name of the goal
- `GoalAmount`: The amount of money the goal has already received
- `Currency`: The currency the goal uses
- `ShowGoal`: Is the goal visible
- `ProgressPercentage`: The percentage of the goal from `0...100` as number

### Activities

The activities alert contains just like the goal alert one property called `activity` with the following properties:

- `AlertTimestamp`: UNIX timestamp when the alert happend?
- `IsTestActivity`: Is this a test activity?
- `TransactionId`: The UUID of the transaction
- `Timestamp`: UNIX timestamp of when the transaction happend?
- `UserName`: The name of the user
- `Amount`: The amount of money that was used for the transaction. For some odd reason this is a string, not a number
- `Currency`: The currency that was used for the transaction
- `TwitchUsername`: The user's Twitch username. This is `""` if not provided
- `Message`: The message of the user. This is `""` if not provided
- `IsMessagePublic`: Is this a public message that is viewable by anyone?
- `TransactionType`: The type of transaction

if `TransactionType` is `Shop item` or `Commission` then the following properties are valid:

- `ShopItemName`: The name of the item in the shop or commission

if `TransactionType` is `Membership` then the following properties are valid:

- `MembershipTierName`: The name of the membership tier

Keep in mind that this transaction is always fired when a user pays for the membership monthly so you would get this every month

There's also a `TransactionType` called `Donation` but it has no extra properties because it uses the `Message` property only

### Configuration

Sometimes you might get this alert but it does not contain anything important, you only receive it when you change something in the stream donation/goal overlay options

## The `connect` process

When you call `connect` on `KoFiAlertsClient` the following things happen:

- a `GET` request is made on `https://ko-fi.com/api/streamalerts/negotiation-token` with `userKey=<your-user-key>` and `_=<current-UNIX-timestamp>` as URL parameters and you should get a JSON object returned with `token` as a property
- a `POST` request is made on `https://sa-functions.ko-fi.com/api/negotiate` with `negotationToken=<the-token-from-above>`, `pageId=<your-page-id>` and `timestamp=<YYYY_MM_DD_HH_MM_SS_MS>` as URL parameters and you should get a JSON object returned with `url` and `accessToken` as properties
- from the `url` and `accessToken` we create a SignalR client and from there we can listen to various events:
  - `newStreamAlert`: A donation was received
  - `updateGoalOverlay`: The goal has changed its state
  - `updateAlertActivity`: A activity was received

## MAQ (Maybe-Asked-Questions)

Q: _What's the difference between `donation` and `activities` with `TransactionType` `Donation`?_  
A: Both alerts expose different kind of properties more or less but some are the same, it's up to you which one you choose

## License stuff that nobody reads

Just like any [Open Source Project](https://github.com/N1ghtTheF0x/kofi-alerts) this has a [License](./LICENSE), the MIT License
