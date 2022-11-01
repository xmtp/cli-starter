import { readFileSync, writeFileSync } from 'fs'
import { Wallet } from 'ethers'

const WALLET_FILE_LOCATION = './xmtp_wallet'

export const loadWallet = () => {
  try {
    const existing = readFileSync(WALLET_FILE_LOCATION)
    return Wallet.fromMnemonic(existing.toString())
  } catch (e) {
    const newWallet = Wallet.createRandom()
    writeFileSync(WALLET_FILE_LOCATION, newWallet.mnemonic.phrase)
    return newWallet
  }
}

const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/

export const truncateEthAddress = (address: string) => {
  const match = address.match(truncateRegex)
  if (!match) return address
  return `${match[1]}…${match[2]}`
}
