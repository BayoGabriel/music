import {
  WithdrawalMethod,
  withdrawalMethodValues,
  WithdrawalStatus,
  withdrawalStatusValues,
} from "./withdrawal.constants";

export type WithdrawalSnapshotDocument = {
  email?: string;
  name?: string;
  paypalId?: string;
  fullName?: string;
  iban?: string;
  bic?: string;
  tag?: string;
  accountName?: string;
  sortCode?: string;
  accountNumber?: string;
  bankName?: string;
  bicSwift?: string;
  coin?: string;
  network?: string;
  walletAddress?: string;
};

export type WithdrawalDocument = {
  id: string;
  userId: string;
  method: (typeof withdrawalMethodValues)[number];
  status: (typeof withdrawalStatusValues)[number];
  snapshot: WithdrawalSnapshotDocument;
  createdAt: Date;
};

export const isValidSnapshotForMethod = (
  method: string,
  snapshot: Record<string, string | undefined>,
) => {
  const keys = Object.entries(snapshot)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key)
    .sort();

  const allowedByMethod: Record<string, string[]> = {
    [WithdrawalMethod.PAYPAL]: ["email", "name", "paypalId"],
    [WithdrawalMethod.REVOLUT]: ["bic", "fullName", "iban", "tag"],
    [WithdrawalMethod.BANK]: [
      "accountName",
      "accountNumber",
      "bankName",
      "bicSwift",
      "iban",
      "sortCode",
    ],
    [WithdrawalMethod.CRYPTO]: ["coin", "network", "walletAddress"],
  };

  const requiredByMethod: Record<string, string[]> = {
    [WithdrawalMethod.PAYPAL]: ["email", "name", "paypalId"],
    [WithdrawalMethod.REVOLUT]: ["bic", "fullName", "iban"],
    [WithdrawalMethod.BANK]: [
      "accountName",
      "accountNumber",
      "bankName",
      "bicSwift",
      "iban",
      "sortCode",
    ],
    [WithdrawalMethod.CRYPTO]: ["coin", "network", "walletAddress"],
  };

  const allowed = allowedByMethod[method] ?? [];
  const required = requiredByMethod[method] ?? [];

  if (keys.some((key) => !allowed.includes(key))) {
    return false;
  }

  return required.every(
    (key) => typeof snapshot[key] === "string" && snapshot[key] !== undefined,
  );
};
