// an accounting reminder:
// https://en.wikipedia.org/wiki/Double-entry_bookkeeping

import { liabilitiesMainAccount } from "@domain/ledger"

// assets:
export const assetsMainAccount = "Assets"
export const bitcoindAccountingPath = `${assetsMainAccount}:Reserve:Bitcoind`
export const lndAccountingPath = `${assetsMainAccount}:Reserve:Lightning` // TODO: rename to Assets:Lnd
export const escrowAccountingPath = `${assetsMainAccount}:Reserve:Escrow` // TODO: rename to Assets:Lnd:Escrow

export const resolveWalletId = (walletPath: string | string[]) => {
  let id: WalletId | null = null

  if (!walletPath) {
    return null
  }

  let path = walletPath

  if (typeof walletPath === "string") {
    path = walletPath.split(":")
  }

  if (
    Array.isArray(path) &&
    path.length === 2 &&
    path[0] === liabilitiesMainAccount &&
    path[1]
  ) {
    id = path[1] as WalletId
  }

  return id as WalletId
}

let cacheDealerBtcWalletId: WalletId
let cacheDealerUsdWalletId: WalletId
let cacheBankOwnerWalletId: WalletId
let cacheFunderWalletId: WalletId

const throwError = (wallet) => Promise.reject(`Invalid ${wallet}WalletPath`)
let bankOwnerResolver = (): Promise<WalletId> => throwError("bankOwner")
let dealerBtcResolver = (): Promise<WalletId> => throwError("dealerBtc")
let dealerUsdResolver = (): Promise<WalletId> => throwError("dealerUsd")
let funderResolver = (): Promise<WalletId> => throwError("funder")

export function setBankOwnerWalletResolver(resolver: () => Promise<WalletId>) {
  bankOwnerResolver = resolver
}

export function setDealerBtcWalletResolver(resolver: () => Promise<WalletId>) {
  dealerBtcResolver = resolver
}

export function setDealerUsdWalletResolver(resolver: () => Promise<WalletId>) {
  dealerUsdResolver = resolver
}

export function setFunderWalletResolver(resolver: () => Promise<WalletId>) {
  funderResolver = resolver
}

export const getDealerBtcWalletId = async () => {
  if (cacheDealerBtcWalletId) {
    return cacheDealerBtcWalletId
  }

  const dealerBtcId = await dealerBtcResolver()
  cacheDealerBtcWalletId = dealerBtcId
  return cacheDealerBtcWalletId
}

export const getDealerUsdWalletId = async () => {
  if (cacheDealerUsdWalletId) {
    return cacheDealerUsdWalletId
  }

  const dealerUsdId = await dealerUsdResolver()
  cacheDealerUsdWalletId = dealerUsdId
  return cacheDealerUsdWalletId
}

export const getBankOwnerWalletId = async () => {
  if (cacheBankOwnerWalletId) {
    return cacheBankOwnerWalletId
  }

  const bankOwnerId = await bankOwnerResolver()
  cacheBankOwnerWalletId = bankOwnerId
  return cacheBankOwnerWalletId
}

export const getFunderWalletId = async () => {
  if (cacheFunderWalletId) {
    return cacheFunderWalletId
  }

  const funderId = await funderResolver()
  cacheFunderWalletId = funderId
  return cacheFunderWalletId
}
