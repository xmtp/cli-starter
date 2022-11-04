# cli-starter

Starter kit for building a XMTP CLI

## Setup

### Prerequisites

- Node.js version 16.7

### Installation

1. `npm i` in this folder
2. (optional) `npm link` will allow you to run the `xmtp` command from anywhere, if your global `node_modules/.bin` folder is in the PATH of your system
3. Ensure that installation succeeded by running `./xmtp --help`

### Tools we will be using

- xmtp-js
- yargs
- ink

## Challenges

### Send a message to an address

In `src/index.ts` you will see a command already defined:

```ts
  .command(
    'send <address> <message>',
    'Send a message to a blockchain address',
    {
      address: { type: 'string', demand: true },
      message: { type: 'string', demand: true }
    },
    async (argv: any) => {
      throw new Error('BUILD ME')
    }
  )
```

We want the user to be able to send the contents of the `message` argument to the specified `address`.

To start, you'll need to create an instance of the XMTP SDK, using the provided `loadWallet()` helper.

```ts
const { env, message, address } = argv
const client = await Client.create(loadWallet(), { env })
```

To send a message, you'll need to create a conversation instance and then send that message to the conversaiton.

```ts
const conversation = await client.conversations.newConversation(address)
const sent = await conversation.send(message)
```

So, putting it all together the command will look like:

```ts
  .command(
    'send <address> <message>',
    'Send a message to a blockchain address',
    {
      address: { type: 'string', demand: true },
      message: { type: 'string', demand: true },
    },
    async (argv: any) => {
      const { env, message, address } = argv
      const client = await Client.create(loadWallet(), { env })
      const conversation = await client.conversations.newConversation(address)
      const sent = await conversation.send(message)
      // Use the Ink renderer provided in the example
      render(<Message {...sent} />)
    }
  )
```

### List all messages from an address

The next command we are going to implement is `list-messages`. The starter looks like

```ts
.command(
    'list-messages <address>',
    'List all messages from an address',
    { address: { type: 'string', demand: true } },
    async (argv) => {
      throw new Error('BUILD ME!')
    }
  )
```

Load the Client the same as before, and then load the conversation with the supplied address

```ts
const client = await Client.create(loadWallet(), { env })
const convo = await client.conversations.newConversation(address)
```

Get all the messages in the conversation with

```ts
const messages = await convo.messages()
```

You can then render them prettily with the supplied renderer component

```ts
const title = `Messages between ${truncateEthAddress(
  client.address
)} and ${truncateEthAddress(convo.peerAddress)}`
render(<MessageList title={title} messages={messages} />)
```

The completed command will look like:

```ts
const client = await getClient(argv.env as ClientOptions['env'])
const conversation = await client.conversations.newConversation(argv.address)
const messages = await conversation.messages()
const title = `Messages between ${truncateEthAddress(
  client.address
)} and ${truncateEthAddress(conversation.peerAddress)}`

render(<MessageList title={title} messages={messages} />)
```
