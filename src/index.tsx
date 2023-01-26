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
import { randomBytes } from 'crypto'
import { Wallet } from 'ethers'

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
      const conversation = await client.conversations.newConversation(address, {
        conversationId: 'xmtp.org/foo',
        metadata: {},
      })
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
    'list-conversations',
    'List all conversations',
    {},
    async (argv: any) => {
      const { env } = argv
      const client = await Client.create(loadWallet(), { env })
      const convos = await client.conversations.list()
      for (const convo of convos) {
        console.log(
          `Address: ${convo.peerAddress}. Topic: ${convo.topic}. ID: ${convo.context?.conversationId}}`
        )
      }
    }
  )
  .command(
    'stream-all',
    'Stream messages coming from any address',
    {},
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
  .command(
    'perf <numMessages>',
    'Send and receive a bunch of messages',
    {},
    async (argv: any) => {
      const { env, numMessages } = argv
      const client = await Client.create(loadWallet(), { env })
      const tmpClient = await Client.create(Wallet.createRandom(), { env })
      const convo = await tmpClient.conversations.newConversation(
        client.address
      )

      for (let i = 0; i < numMessages; i++) {
        const sent = await convo.send(`Message ${i + 1} ${randomBytes(512)}`)
      }
      const startTime = Date.now()
      const messages = await convo.messages()
      console.log(
        `${messages.length} messages read in ${Date.now() - startTime}ms`
      )
    }
  )
  .command(
    'seed <numConvos>',
    'Create a bunch of Lens conversations',
    { numConvos: { type: 'number', demand: true } },
    async (argv: any) => {
      const { env, numConvos } = argv
      const client = await Client.create(loadWallet(), { env })
      for (let i = 0; i < numConvos; i++) {
        const wallet = Wallet.createRandom()
        const tmpClient = await Client.create(wallet, { env })
        console.log(`Created wallet ${i + 1}`)
        tmpClient.conversations.newConversation(client.address, {
          conversationId: `convo-${i}`,
          metadata: {},
        })
      }
    }
  )
  .option('env', {
    alias: 'e',
    type: 'string',
    default: 'dev',
    choices: ['dev', 'production', 'local'] as const,
    description: 'The XMTP environment to use',
  })
  .demandCommand(1)
  .parse()
