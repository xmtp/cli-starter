import React, { FC, useState, useEffect } from 'react'
import { Box, render, Spacer, Text } from 'ink'
import { DecodedMessage, Stream } from '@xmtp/xmtp-js'
import { truncateEthAddress } from './utils'

export const Message = ({
  id,
  senderAddress,
  content,
  sent,
}: DecodedMessage) => {
  return (
    <Box flexDirection="row" key={id}>
      <Box marginRight={2}>
        <Text color="red">{truncateEthAddress(senderAddress)}: </Text>
        <Text>{content}</Text>
      </Box>
      <Spacer />
      <Text italic color="gray">
        {sent.toLocaleString()}
      </Text>
    </Box>
  )
}

type MessagesProps = {
  messages: DecodedMessage[]
  title?: string
}

export const MessageList = ({ messages, title }: MessagesProps) => {
  return (
    <Box flexDirection="column" margin={1}>
      <Text bold>{title}</Text>
      <Box flexDirection="column" borderStyle="single">
        {messages && messages.length ? (
          messages.map((message) => <Message {...message} key={message.id} />)
        ) : (
          <Text color="red" bold>
            No messages
          </Text>
        )}
      </Box>
    </Box>
  )
}

type MessageStreamProps = {
  stream: Stream<DecodedMessage> | AsyncGenerator<DecodedMessage>
  title?: string
}

export const MessageStream = ({ stream, title }: MessageStreamProps) => {
  const [messages, setMessages] = useState<DecodedMessage[]>([])

  useEffect(() => {
    if (!stream) {
      return
    }
    const seenMessages = new Set<string>()
    const listenForMessages = async () => {
      for await (const message of stream) {
        if (seenMessages.has(message.id)) {
          continue
        }
        setMessages((existing) => existing.concat(message))
        seenMessages.add(message.id)
      }
    }

    listenForMessages()

    return () => {
      if (stream) {
        stream.return(undefined)
      }
    }
  }, [stream])

  return <MessageList title={title} messages={messages} />
}
