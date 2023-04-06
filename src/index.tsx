import React from 'react'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Client } from '@xmtp/xmtp-js'
import { render, Text } from 'ink'
import { MessageList, Message, renderMessages } from './renderers'
import {
  loadWallet,
  saveRandomWallet,
  truncateEthAddress,
  WALLET_FILE_LOCATION,
} from './utils'


// Run an infinite loop, asking for commands: [send, messages, exit]
const run = async () => {
  await saveRandomWallet()
  const client = await Client.createVoodoo(loadWallet(), {env: 'local'})
  // Print address
  console.log(`Your address is ${client.address}`)
  while (true) {
    console.log('Enter a command: [send, messages, exit]')
    const input_raw: string = await new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim())
      })
    })

    // Split input into command and args, parse as a shell command so group quotes etc
    const parsed = input_raw.split(',')
    const command = parsed[0]
    const args = parsed.slice(1)
    if (command === 'send') {
      // Check if client.conversations has this conversation
      const [address, message] = args
      if (!address || !message) {
        console.log('Invalid arguments')
        continue
      }
      const conversations = await client.conversations.list()
      let conversation = conversations.find((c: any) => c.peerAddress === address)
      if (!conversation) {
        console.log('Conversation not found, creating...')
        conversation = await client.conversations.newConversation(address)
      }

      await conversation.send(message)
      console.log(renderMessages(await conversation.messages()))
    } else if (command === 'messages') {
      const [address] = args
      if (!address) {
        console.log('Need address')
        continue
      }
      const conversations = await client.conversations.list()
      let conversation = conversations.find((c: any) => c.peerAddress === address)
      if (!conversation) {
        console.log('Conversation not found.')
        continue
      }
      const messages = await conversation.messages()
      console.log(renderMessages(await conversation.messages()))
    } else if (command === 'exit') {
      process.exit(0)
    } else {
      console.log('Usage: send|messages|stream|exit')
    }
  }
}

run()

/*
yargs(hideBin(process.argv))
  .command('init', 'Initialize wallet', {}, async (argv: any) => {
    const { env } = argv
    saveRandomWallet()
    if (!cachedClient) {
      cachedClient = await Client.createVoodoo(loadWallet(), {env})
    }

    render(
      <Text>
        New wallet with address {cachedClient.address} saved at {WALLET_FILE_LOCATION}
      </Text>
    )
  })
  .command(
    'send <address> <message>',
    'Send a message to a blockchain address',
    {
      address: { type: 'string', demand: true },
      message: { type: 'string', demand: true },
      conversationId: { type: 'string', demand: false },
    },
    async (argv: any) => {
      const { env, message, address, conversationId } = argv
      if (!cachedClient) {
        cachedClient = await Client.createVoodoo(loadWallet(), {env})
      }
      const conversation = await cachedClient.conversations.newConversation(address, {
        conversationId,
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
  .option('env', {
    alias: 'e',
    type: 'string',
    default: 'dev',
    choices: ['dev', 'production', 'local'] as const,
    description: 'The XMTP environment to use',
  })
  .demandCommand(1)
  .parse()
*/
