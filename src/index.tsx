import React from 'react'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Client, ClientOptions, DecodedMessage, Stream } from '@xmtp/xmtp-js'
import { readFileSync, writeFileSync } from 'fs'
import { Wallet } from 'ethers'
import { render } from 'ink'
import { MessageList, MessageStream, Message } from './renderers'
import { truncateEthAddress } from './utils'

const WALLET_FILE_LOCATION = './xmtp_wallet'

const loadWallet = () => {
  try {
    const existing = readFileSync(WALLET_FILE_LOCATION)
    return Wallet.fromMnemonic(existing.toString())
  } catch (e) {
    const newWallet = Wallet.createRandom()
    writeFileSync(WALLET_FILE_LOCATION, newWallet.mnemonic.phrase)
    return newWallet
  }
}

const getClient = (env: ClientOptions['env']) => {
  const wallet = loadWallet()
  return Client.create(wallet, { env })
}

const printMessage = (message: DecodedMessage) => {
  console.log(console.log(`[${message.senderAddress}]: ${message.content}`))
}

yargs(hideBin(process.argv))
  .command(
    'send <address> <message>',
    'Send a message',
    { address: { type: 'string' } },
    async (argv: any) => {
      const client = await getClient(argv.env)
      const conversation = await client.conversations.newConversation(
        argv.address.toString()
      )
      const message = await conversation.send(argv.message)
      console.log('Message sent')
      render(<Message {...message} />)
    }
  )
  .command(
    'stream',
    'Stream messages',
    (argv) => argv.option('address', { alias: 'a', type: 'string' }),
    async (argv: any) => {
      const client = await getClient(argv.env)
      let stream: Stream<DecodedMessage> | AsyncGenerator<DecodedMessage>
      if (argv.address) {
        const convo = await client.conversations.newConversation(
          argv.address.toString()
        )
        stream = await convo.streamMessages()
      } else {
        stream = await client.conversations.streamAllMessages()
      }

      render(<MessageStream stream={stream} title="Streaming messages" />)
    }
  )
  .command(
    'list-messages <address>',
    'List all messages from an address',
    { address: { type: 'string' } },
    async (argv: any) => {
      const client = await getClient(argv.env)
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
  .option('env', {
    alias: 'e',
    type: 'string',
    default: 'dev',
    choices: ['dev', 'production'],
    description: 'The address you want to communicate with',
  })
  .demandCommand(1)
  .parse()
