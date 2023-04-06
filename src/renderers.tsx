import React, { FC, useState, useEffect } from 'react'
import { Box, render, Spacer, Text } from 'ink'
import { DecodedMessage, Stream } from '@xmtp/xmtp-js'
import { truncateEthAddress } from './utils'

export const Message = ({
  senderAddress,
  plaintext,
  timestamp,
}: VoodooMessage) => {
  return (
    <Box flexDirection="row" key={timestamp}>
      <Box marginRight={2}>
        <Text color="red">{truncateEthAddress(senderAddress)}: </Text>
        <Text>{plaintext}</Text>
      </Box>
      <Spacer />
      <Text italic color="gray">
        {new Date(timestamp).toLocaleString()}
      </Text>
    </Box>
  )
}

// This should be exported from xmtp-js
export type VoodooMessage = {
  // All plaintext fields
  senderAddress: string
  timestamp: number
  plaintext: string
  // SessionId may be dropped in the future
  sessionId: string
}


type MessagesProps = {
  messages: VoodooMessage[]
  title?: string
}

export const MessageList = ({ messages, title }: MessagesProps) => {
  return (
    <Box flexDirection="column" margin={1}>
      <Text bold>{title}</Text>
      <Box flexDirection="column" borderStyle="single">
        {messages && messages.length ? (
          messages.map((message) => <Message {...message} key={message.timestamp} />)
        ) : (
          <Text color="red" bold>
            No messages
          </Text>
        )}
      </Box>
    </Box>
  )
}
