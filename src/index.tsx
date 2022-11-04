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
      throw new Error('BUILD ME')
    }
  )
  .command(
    'list-messages <address>',
    'List all messages from an address',
    { address: { type: 'string', demand: true } },
    async (argv: any) => {
      throw new Error('BUILD ME')
    }
  )
  .command(
    'stream-all',
    'Stream messages coming from any address',
    {},
    async (argv: any) => {
      throw new Error('BUILD ME')
    }
  )
  .command(
    'stream <address>',
    'Stream messages from an address',
    { address: { type: 'string', demand: true } },
    async (argv: any) => {
      throw new Error('BUILD ME')
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
