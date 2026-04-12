import { WITHDRAWAL_SETTINGS_ID } from "./withdrawal.constants";

export type WithdrawalSettingsDocument = {
  id: typeof WITHDRAWAL_SETTINGS_ID;
  paypalEnabled: boolean;
  revolutEnabled: boolean;
  bankEnabled: boolean;
  cryptoEnabled: boolean;
  updatedAt: Date;
};
