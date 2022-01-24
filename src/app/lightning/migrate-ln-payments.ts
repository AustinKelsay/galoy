import { PaymentStatus } from "@domain/bitcoin/lightning"
import { LndService, parseLndErrorDetails } from "@services/lnd"
import { baseLogger } from "@services/logger"
import { LnPaymentsRepository } from "@services/mongoose"

export const migrateLnPaymentsFromLnd = async (): Promise<true | ApplicationError> => {
  const lndService = LndService()
  if (lndService instanceof Error) return lndService
  const pubkeys = lndService.listActivePubkeys()

  for (const key of pubkeys) {
    const pubkey = key as Pubkey

    let after: PagingStartToken | PagingContinueToken | PagingStopToken = undefined
    while (after !== false) {
      const results: ListLnPaymentsResult | LightningServiceError =
        await lndService.listPayments({
          pubkey,
          after,
        })
      if (results instanceof Error) {
        baseLogger.error(
          { error: results },
          `Could not fetch payments for pubkey ${pubkey}`,
        )
        break
      }
      if (after == results.endCursor) break
      after = results.endCursor

      const hashes = results.lnPayments.map((p) => p.paymentHash)

      // Fetch all hashes from lnPayments repo
      const lnPaymentsRepo = LnPaymentsRepository()
      const lnPaymentsPersisted = await lnPaymentsRepo.listByPaymentHashes(hashes)
      if (lnPaymentsPersisted instanceof Error) continue

      // Persist if lndPayment doesn't exist
      for (const payment of results.lnPayments) {
        const persistedPaymentLookup = lnPaymentsPersisted.find(
          (elem) => elem.paymentHash === payment.paymentHash,
        )
        if (persistedPaymentLookup) continue

        const partialLnPayment = {
          paymentHash: payment.paymentHash,
          paymentRequest: payment.paymentRequest,
          sentFromPubkey: pubkey,
        }
        const newLnPayment =
          payment.status === PaymentStatus.Pending
            ? partialLnPayment
            : {
                ...partialLnPayment,
                createdAt: payment.createdAt,
                status: payment.status,
                milliSatsAmount: payment.milliSatsAmount,
                roundedUpAmount: payment.roundedUpAmount,
                confirmedDetails: payment.confirmedDetails,
                attempts: payment.attempts,
                isCompleteRecord: true,
              }

        const updatedPaymentLookup = await LnPaymentsRepository().persistNew(newLnPayment)
        if (updatedPaymentLookup instanceof Error) {
          baseLogger.error(
            { error: updatedPaymentLookup },
            "Could not update LnPayments repository",
          )
          continue
        }
      }
    }
  }
  return true
}

export const partialMigrateLnPaymentsFromLnd = async (
  lndService: ILightningService,
): Promise<true | ApplicationError> => {
  // const pubkey = key as Pubkey
  const pubkey = lndService.defaultPubkey()

  let after: PagingStartToken | PagingContinueToken | PagingStopToken =
    '{"offset":716895,"limit":20}' as PagingContinueToken
  while (after !== false) {
    const results: ListLnPaymentsResult | LightningServiceError =
      await lndService.listPayments({
        pubkey,
        after,
      })
    if (results instanceof Error) {
      baseLogger.error(
        { error: results },
        `Could not fetch payments for pubkey ${pubkey}`,
      )
      break
    }
    if (after == results.endCursor) break
    after = results.endCursor
    console.log("HERE 10:", after)

    const hashes = results.lnPayments.map((p) => p.paymentHash)

    // Fetch all hashes from lnPayments repo
    const lnPaymentsRepo = LnPaymentsRepository()
    const lnPaymentsPersisted = await lnPaymentsRepo.listByPaymentHashes(hashes)
    if (lnPaymentsPersisted instanceof Error) continue

    // Persist if lndPayment doesn't exist
    for (const payment of results.lnPayments) {
      const persistedPaymentLookup = lnPaymentsPersisted.find(
        (elem) => elem.paymentHash === payment.paymentHash,
      )
      if (persistedPaymentLookup) continue

      const partialLnPayment = {
        paymentHash: payment.paymentHash,
        paymentRequest: payment.paymentRequest,
        sentFromPubkey: pubkey,
      }
      const newLnPayment =
        payment.status === PaymentStatus.Pending
          ? partialLnPayment
          : {
              ...partialLnPayment,
              createdAt: payment.createdAt,
              status: payment.status,
              milliSatsAmount: payment.milliSatsAmount,
              roundedUpAmount: payment.roundedUpAmount,
              confirmedDetails: payment.confirmedDetails,
              attempts: payment.attempts,
              isCompleteRecord: true,
            }

      const updatedPaymentLookup = await LnPaymentsRepository().persistNew(newLnPayment)
      if (updatedPaymentLookup instanceof Error) {
        baseLogger.error(
          { error: updatedPaymentLookup },
          "Could not update LnPayments repository",
        )
        continue
      }
      console.log("HERE 11:", newLnPayment)
      break // HERE
    }
    break // HERE
  }
  return true
}
