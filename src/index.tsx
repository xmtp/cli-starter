import React from 'react'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Client, ClientOptions, SortDirection } from '@xmtp/xmtp-js'
import { render } from 'ink'
import { MessageList, MessageStream, Message } from './renderers'
import { loadWallet, truncateEthAddress } from './utils'

const getClient = (env: ClientOptions['env']) => {
  const wallet = loadWallet()
  return Client.create(wallet, { env })
}

yargs(hideBin(process.argv))
  .command('init', 'Initialize wallet', {}, async (argv: any) => {
    const client = await getClient(argv.env)
    console.log('Your wallet address is', client.address)
  })
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
      render(<Message {...sent} />)
    }
  )
  .command(
    'list-messages <address>',
    'List all messages from an address',
    { address: { type: 'string', demand: true } },
    async (argv) => {
      const client = await getClient(argv.env as ClientOptions['env'])
      const convo = await client.conversations.newConversation(argv.address)
      const messages = await convo.messages()
      render(
        <MessageList
          title={`Messages between ${truncateEthAddress(
            client.address
          )} and ${truncateEthAddress(convo.peerAddress)}`}
          messages={messages}
        />
      )
    }
  )
  .command(
    'stream',
    'Stream messages coming from any address',
    async (argv: any) => {
      const client = await getClient(argv.env)
      const stream = await client.conversations.streamAllMessages()

      render(<MessageStream stream={stream} title="Streaming messages" />)
    }
  )
  .command(
    'stream <address>',
    'Stream messages from a particular address',
    { address: { type: 'string', demand: true } },
    async (argv: any) => {
      const client = await getClient(argv.env)
      const convo = await client.conversations.newConversation(argv.address)
      const stream = await convo.streamMessages()

      render(
        <MessageStream
          stream={stream}
          title={`Streaming messages from ${argv.address}`}
        />
      )
    }
  )
  .option('env', {
    alias: 'e',
    type: 'string',
    default: 'dev',
    choices: ['dev', 'production'] as const,
    description: 'The XMTP environment to use',
  })
  .demandCommand(1)
  .parse()
