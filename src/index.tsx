import React from 'react'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Client } from '@xmtp/xmtp-js'
import { render, Text } from 'ink'
import { MessageList, MessageStream, Message } from './renderers'
import {
  loadWallet,
  saveRandomWallet,
  truncateEthAddress,
  WALLET_FILE_LOCATION,
} from './utils'

yargs(hideBin(process.argv))
  .command('init', 'Initialize wallet', {}, async (argv: any) => {
    const { env } = argv
    saveRandomWallet()
    const client = await Client.create(loadWallet(), { env })

    render(
      <Text>
        New wallet with address {client.address} saved at {WALLET_FILE_LOCATION}
      </Text>
    )
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
    async (argv: any) => {
      const { env, address } = argv
      const client = await Client.create(loadWallet(), { env })
      const conversation = await client.conversations.newConversation(address)
      const messages = await conversation.messages()
      const title = `Messages between ${truncateEthAddress(
        client.address
      )} and ${truncateEthAddress(conversation.peerAddress)}`

      render(<MessageList title={title} messages={messages} />)
    }
  )
  .command(
    'stream',
    'Stream messages coming from any address',
    async (argv: any) => {
      const { env } = argv
      const client = await Client.create(loadWallet(), { env })
      const stream = await client.conversations.streamAllMessages()

      render(<MessageStream stream={stream} title="Streaming messages" />)
    }
  )
  .command(
    'stream <address>',
    'Stream messages from an address',
    { address: { type: 'string', demand: true } },
    async (argv: any) => {
      const { address, env } = argv
      const client = await Client.create(loadWallet(), { env })
      const convo = await client.conversations.newConversation(address)
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
