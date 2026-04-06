export const WithdrawalMethod = {
  PAYPAL: 'paypal',
  REVOLUT: 'revolut',
  BANK: 'bank',
  CRYPTO: 'crypto'
} as const;

export type WithdrawalMethod = (typeof WithdrawalMethod)[keyof typeof WithdrawalMethod];

export const withdrawalMethodValues = Object.values(WithdrawalMethod);

export const WithdrawalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export type WithdrawalStatus = (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

export const withdrawalStatusValues = Object.values(WithdrawalStatus);

export const WITHDRAWAL_SETTINGS_ID = 'withdrawal_settings';
