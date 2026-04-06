import { Types } from "mongoose";
import { AppError } from "../../common/errors/app-error";
import { CryptoConfigModel } from "./crypto-config.model";
import { UserPaymentDetailsModel } from "./user-payment-details.model";
import { WithdrawalModel } from "./withdrawal.model";
import { WithdrawalSettingsModel } from "./withdrawal-settings.model";
import {
  WITHDRAWAL_SETTINGS_ID,
  WithdrawalMethod,
  WithdrawalStatus,
  type WithdrawalMethod as WithdrawalMethodType,
} from "./withdrawal.constants";

type PaypalDetails = {
  email: string;
  name: string;
  paypalId: string;
};

type RevolutDetails = {
  fullName: string;
  iban: string;
  bic: string;
  tag?: string;
};

type BankDetails = {
  accountName: string;
  sortCode: string;
  accountNumber: string;
  bankName: string;
  iban: string;
  bicSwift: string;
};

type CreateWithdrawalPayload =
  | { method: "paypal"; useSavedDetails?: boolean; details?: PaypalDetails }
  | { method: "revolut"; useSavedDetails?: boolean; details?: RevolutDetails }
  | { method: "bank"; useSavedDetails?: boolean; details?: BankDetails }
  | {
      method: "crypto";
      coin: string;
      network: string;
      walletAddress: string;
      confirmWallet: string;
    };

class WithdrawalService {
  public async ensureSettingsDocument() {
    await WithdrawalSettingsModel.updateOne(
      { _id: WITHDRAWAL_SETTINGS_ID },
      {
        $setOnInsert: {
          _id: WITHDRAWAL_SETTINGS_ID,
          paypalEnabled: true,
          revolutEnabled: true,
          bankEnabled: true,
          cryptoEnabled: true,
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).exec();
  }

  public async getAvailableMethods() {
    const settings = await this.getSettings();
    const methods: Array<Record<string, unknown>> = [];

    if (settings.paypalEnabled) {
      methods.push({ method: WithdrawalMethod.PAYPAL });
    }

    if (settings.revolutEnabled) {
      methods.push({ method: WithdrawalMethod.REVOLUT });
    }

    if (settings.bankEnabled) {
      methods.push({ method: WithdrawalMethod.BANK });
    }

    if (settings.cryptoEnabled) {
      const enabledCoins = await CryptoConfigModel.find({
        isEnabled: true,
        "networks.isEnabled": true,
      })
        .lean()
        .exec();

      methods.push({
        method: WithdrawalMethod.CRYPTO,
        coins: enabledCoins
          .map((coinConfig) => ({
            coin: coinConfig.coin,
            networks: coinConfig.networks
              .filter((network) => network.isEnabled)
              .map((network) => ({
                name: network.name,
              })),
          }))
          .filter((coinConfig) => coinConfig.networks.length > 0),
      });
    }

    return {
      methods,
    };
  }

  public async createWithdrawal(
    userId: string,
    payload: CreateWithdrawalPayload,
  ) {
    const settings = await this.getSettings();
    const objectId = new Types.ObjectId(userId);

    if (payload.method === WithdrawalMethod.CRYPTO) {
      this.assertMethodEnabled(settings.cryptoEnabled, WithdrawalMethod.CRYPTO);

      if (payload.walletAddress !== payload.confirmWallet) {
        throw new AppError(400, "walletAddress and confirmWallet must match");
      }

      await this.assertCryptoRouteEnabled(payload.coin, payload.network);

      const snapshot = {
        coin: payload.coin,
        network: payload.network,
        walletAddress: payload.walletAddress,
      };

      const withdrawal = await WithdrawalModel.create({
        userId: objectId,
        method: WithdrawalMethod.CRYPTO,
        status: WithdrawalStatus.PENDING,
        snapshot,
      });

      return this.serializeWithdrawal(withdrawal);
    }

    const snapshot = await this.resolveNonCryptoSnapshot(
      objectId,
      settings,
      payload,
    );

    const withdrawal = await WithdrawalModel.create({
      userId: objectId,
      method: payload.method,
      status: WithdrawalStatus.PENDING,
      snapshot,
    });

    return this.serializeWithdrawal(withdrawal);
  }

  public async updateMethodSettings(payload: {
    paypalEnabled?: boolean;
    revolutEnabled?: boolean;
    bankEnabled?: boolean;
    cryptoEnabled?: boolean;
  }) {
    const updated = await WithdrawalSettingsModel.findOneAndUpdate(
      { _id: WITHDRAWAL_SETTINGS_ID },
      {
        $set: payload,
        $setOnInsert: {
          _id: WITHDRAWAL_SETTINGS_ID,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    ).exec();

    if (!updated) {
      throw new AppError(500, "Unable to update withdrawal settings");
    }

    return {
      paypalEnabled: updated.paypalEnabled,
      revolutEnabled: updated.revolutEnabled,
      bankEnabled: updated.bankEnabled,
      cryptoEnabled: updated.cryptoEnabled,
      updatedAt: updated.updatedAt,
    };
  }

  public async createCoin(payload: { coin: string }) {
    const existing = await CryptoConfigModel.findOne({
      coin: payload.coin,
    }).exec();

    if (existing) {
      throw new AppError(409, "Coin already exists");
    }

    const coin = await CryptoConfigModel.create({
      coin: payload.coin,
      isEnabled: true,
      networks: [],
    });

    return this.serializeCoinConfig(coin);
  }

  public async updateCoin(coinName: string, payload: { isEnabled: boolean }) {
    const coin = await CryptoConfigModel.findOne({ coin: coinName }).exec();

    if (!coin) {
      throw new AppError(404, "Coin not found");
    }

    coin.isEnabled = payload.isEnabled;
    await coin.save();

    return this.serializeCoinConfig(coin);
  }

  public async addNetwork(coinName: string, payload: { name: string }) {
    const coin = await CryptoConfigModel.findOne({ coin: coinName }).exec();

    if (!coin) {
      throw new AppError(404, "Coin not found");
    }

    const networkExists = coin.networks.some(
      (network) => network.name === payload.name,
    );

    if (networkExists) {
      throw new AppError(409, "Network already exists for this coin");
    }

    coin.networks.push({
      name: payload.name,
      isEnabled: true,
    });

    await coin.save();

    return this.serializeCoinConfig(coin);
  }

  public async updateNetwork(
    coinName: string,
    networkName: string,
    payload: { isEnabled: boolean },
  ) {
    const coin = await CryptoConfigModel.findOne({ coin: coinName }).exec();

    if (!coin) {
      throw new AppError(404, "Coin not found");
    }

    const network = coin.networks.find((item) => item.name === networkName);

    if (!network) {
      throw new AppError(404, "Network not found");
    }

    network.isEnabled = payload.isEnabled;
    await coin.save();

    return this.serializeCoinConfig(coin);
  }

  public async listWithdrawals() {
    const withdrawals = await WithdrawalModel.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return withdrawals.map((withdrawal) =>
      this.serializeWithdrawal(withdrawal),
    );
  }

  public async getWithdrawalById(withdrawalId: string) {
    const withdrawal = await WithdrawalModel.findById(withdrawalId)
      .lean()
      .exec();

    if (!withdrawal) {
      throw new AppError(404, "Withdrawal not found");
    }

    return this.serializeWithdrawal(withdrawal);
  }

  public async approveWithdrawal(withdrawalId: string) {
    return this.updateWithdrawalStatus(withdrawalId, WithdrawalStatus.APPROVED);
  }

  public async rejectWithdrawal(withdrawalId: string) {
    return this.updateWithdrawalStatus(withdrawalId, WithdrawalStatus.REJECTED);
  }

  private async updateWithdrawalStatus(
    withdrawalId: string,
    status: "approved" | "rejected",
  ) {
    const withdrawal = await WithdrawalModel.findById(withdrawalId).exec();

    if (!withdrawal) {
      throw new AppError(404, "Withdrawal not found");
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new AppError(409, "Only pending withdrawals can be updated");
    }

    withdrawal.status = status;
    await withdrawal.save();

    return this.serializeWithdrawal(withdrawal);
  }

  private async resolveNonCryptoSnapshot(
    userId: Types.ObjectId,
    settings: {
      paypalEnabled: boolean;
      revolutEnabled: boolean;
      bankEnabled: boolean;
      cryptoEnabled: boolean;
    },
    payload: Exclude<CreateWithdrawalPayload, { method: "crypto" }>,
  ) {
    if (payload.method === WithdrawalMethod.PAYPAL) {
      this.assertMethodEnabled(settings.paypalEnabled, payload.method);
      return this.resolvePaymentSnapshot(
        userId,
        payload.method,
        payload.useSavedDetails === true,
        payload.details,
      );
    }

    if (payload.method === WithdrawalMethod.REVOLUT) {
      this.assertMethodEnabled(settings.revolutEnabled, payload.method);
      return this.resolvePaymentSnapshot(
        userId,
        payload.method,
        payload.useSavedDetails === true,
        payload.details,
      );
    }

    this.assertMethodEnabled(settings.bankEnabled, payload.method);
    return this.resolvePaymentSnapshot(
      userId,
      payload.method,
      payload.useSavedDetails === true,
      payload.details,
    );
  }

  private async resolvePaymentSnapshot(
    userId: Types.ObjectId,
    method: Exclude<WithdrawalMethodType, "crypto">,
    useSavedDetails: boolean,
    providedDetails?: PaypalDetails | RevolutDetails | BankDetails,
  ) {
    if (useSavedDetails) {
      const paymentDetails = await UserPaymentDetailsModel.findOne({ userId })
        .lean()
        .exec();

      if (!paymentDetails) {
        throw new AppError(400, "No saved payment details found for this user");
      }

      const snapshot = paymentDetails[method];

      if (!snapshot) {
        throw new AppError(
          400,
          `No saved ${method} details found for this user`,
        );
      }

      return this.cloneSnapshot(snapshot);
    }

    if (!providedDetails) {
      throw new AppError(400, "Payment details are required");
    }

    await UserPaymentDetailsModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          [method]: providedDetails,
        },
        $setOnInsert: {
          userId,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    ).exec();

    return this.cloneSnapshot(providedDetails);
  }

  private async assertCryptoRouteEnabled(
    coinName: string,
    networkName: string,
  ) {
    const coin = await CryptoConfigModel.findOne({
      coin: coinName,
      isEnabled: true,
    })
      .lean()
      .exec();

    if (!coin) {
      throw new AppError(400, "Selected coin is not enabled");
    }

    const network = coin.networks.find(
      (item) => item.name === networkName && item.isEnabled,
    );

    if (!network) {
      throw new AppError(400, "Selected network is not enabled for this coin");
    }
  }

  private assertMethodEnabled(
    isEnabled: boolean,
    method: WithdrawalMethodType,
  ) {
    if (!isEnabled) {
      throw new AppError(403, `${method} withdrawals are currently disabled`);
    }
  }

  private async getSettings() {
    const settings = await WithdrawalSettingsModel.findById(
      WITHDRAWAL_SETTINGS_ID,
    )
      .lean()
      .exec();

    if (!settings) {
      throw new AppError(500, "Withdrawal settings are not initialized");
    }

    return settings;
  }

  private cloneSnapshot<T extends Record<string, unknown>>(value: T) {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private serializeCoinConfig(coin: {
    _id?: unknown;
    coin: string;
    isEnabled: boolean;
    networks: Array<{ name: string; isEnabled: boolean }>;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return {
      id: coin._id ? String(coin._id) : undefined,
      coin: coin.coin,
      isEnabled: coin.isEnabled,
      networks: coin.networks.map((network) => ({
        name: network.name,
        isEnabled: network.isEnabled,
      })),
      ...(coin.createdAt ? { createdAt: coin.createdAt } : {}),
      ...(coin.updatedAt ? { updatedAt: coin.updatedAt } : {}),
    };
  }

  private serializeWithdrawal(withdrawal: {
    _id: { toString(): string } | string;
    userId: Types.ObjectId | { toString(): string } | string;
    method: WithdrawalMethodType;
    status: "pending" | "approved" | "rejected";
    snapshot: Record<string, unknown>;
    createdAt: Date;
  }) {
    return {
      id:
        typeof withdrawal._id === "string"
          ? withdrawal._id
          : withdrawal._id.toString(),
      userId:
        typeof withdrawal.userId === "string"
          ? withdrawal.userId
          : withdrawal.userId.toString(),
      method: withdrawal.method,
      status: withdrawal.status,
      snapshot: this.cloneSnapshot(withdrawal.snapshot),
      createdAt: withdrawal.createdAt,
    };
  }
}

export const withdrawalService = new WithdrawalService();
