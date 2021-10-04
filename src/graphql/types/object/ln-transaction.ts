import { GT } from "@graphql/index"
import ITransaction from "../abstract/transaction"
import LnPaymentHash from "../scalar/ln-payment-hash"
import Memo from "../scalar/memo"
import PaymentInitiationMethod from "../scalar/payment-initiation-method"
import SatAmount from "../scalar/sat-amount"
import SettlementMethod from "../scalar/settlement-method"
import Timestamp from "../scalar/timestamp"
// import TxDirection from "../scalar/tx-direction"
import TxStatus from "../scalar/tx-status"
import WalletName from "../scalar/wallet-name"
// import BtcUsdPrice from "./btc-usd-price"
import { SettlementMethod as DomainSettlementMethod } from "@domain/wallets"

const LnTransaction = new GT.Object({
  name: "LnTransaction",
  interfaces: () => [ITransaction],
  isTypeOf: (source) => source.settlementVia === DomainSettlementMethod.Lightning,
  fields: () => ({
    id: {
      type: GT.NonNullID,
    },
    walletId: {
      type: GT.NonNullID,
    },
    initiationVia: {
      type: GT.NonNull(PaymentInitiationMethod),
    },
    settlementVia: {
      type: GT.NonNull(SettlementMethod),
    },
    settlementAmount: {
      type: GT.NonNull(SatAmount),
    },
    settlementFee: {
      type: GT.NonNull(SatAmount),
    },
    // priceAtSettlement: {
    //   type: GT.NonNull(BtcUsdPrice),
    // },
    // direction: {
    //   type: GT.NonNull(TxDirection),
    // },
    memo: {
      type: Memo,
    },
    status: {
      type: TxStatus,
    },
    recipient: {
      type: WalletName,
      resolve: () => null,
    },
    createdAt: {
      type: GT.NonNull(Timestamp),
    },

    // Non-interface fields
    paymentHash: {
      type: GT.NonNull(LnPaymentHash),
    },
  }),
})

export default LnTransaction
