import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../database";
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

type CryptoNetworkRecord = {
  name: string;
  isEnabled: boolean;
};

type CryptoConfigRecord = {
  id: string;
  coin: string;
  isEnabled: boolean;
  networks: CryptoNetworkRecord[];
  createdAt?: Date;
  updatedAt?: Date;
};

type WithdrawalSnapshotRecord = Record<string, unknown> & {
  withdrawalId?: string;
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
    await prisma.withdrawalSetting.upsert({
      where: { id: WITHDRAWAL_SETTINGS_ID },
      update: {},
      create: {
        id: WITHDRAWAL_SETTINGS_ID,
        paypalEnabled: true,
        revolutEnabled: true,
        bankEnabled: true,
        cryptoEnabled: true,
      },
    });
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
      const enabledCoins = await prisma.cryptoConfig.findMany({
        where: {
          isEnabled: true,
          networks: {
            some: {
              isEnabled: true,
            },
          },
        },
        include: {
          networks: true,
        },
        orderBy: { createdAt: "asc" },
      });

      methods.push({
        method: WithdrawalMethod.CRYPTO,
        coins: enabledCoins
          .map((coinConfig: CryptoConfigRecord) => ({
            coin: coinConfig.coin,
            networks: coinConfig.networks
              .filter((network: CryptoNetworkRecord) => network.isEnabled)
              .map((network: CryptoNetworkRecord) => ({
                name: network.name,
              })),
          }))
          .filter((coinConfig: { coin: string; networks: Array<{ name: string }> }) => coinConfig.networks.length > 0),
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

      const withdrawal = await prisma.withdrawal.create({
        data: {
          userId,
          method: WithdrawalMethod.CRYPTO,
          status: WithdrawalStatus.PENDING,
          snapshot: {
            create: snapshot,
          },
        },
        include: {
          snapshot: true,
        },
      });

      return this.serializeWithdrawal(withdrawal);
    }

    const snapshot = await this.resolveNonCryptoSnapshot(
      userId,
      settings,
      payload,
    );

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        method: payload.method,
        status: WithdrawalStatus.PENDING,
        snapshot: {
          create: snapshot,
        },
      },
      include: {
        snapshot: true,
      },
    });

    return this.serializeWithdrawal(withdrawal);
  }

  public async updateMethodSettings(payload: {
    paypalEnabled?: boolean;
    revolutEnabled?: boolean;
    bankEnabled?: boolean;
    cryptoEnabled?: boolean;
  }) {
    const updated = await prisma.withdrawalSetting.upsert({
      where: { id: WITHDRAWAL_SETTINGS_ID },
      update: payload,
      create: {
        id: WITHDRAWAL_SETTINGS_ID,
        paypalEnabled: payload.paypalEnabled ?? true,
        revolutEnabled: payload.revolutEnabled ?? true,
        bankEnabled: payload.bankEnabled ?? true,
        cryptoEnabled: payload.cryptoEnabled ?? true,
      },
    });

    return {
      paypalEnabled: updated.paypalEnabled,
      revolutEnabled: updated.revolutEnabled,
      bankEnabled: updated.bankEnabled,
      cryptoEnabled: updated.cryptoEnabled,
      updatedAt: updated.updatedAt,
    };
  }

  public async createCoin(payload: { coin: string }) {
    const existing = await prisma.cryptoConfig.findUnique({
      where: { coin: payload.coin },
    });

    if (existing) {
      throw new AppError(409, "Coin already exists");
    }

    const coin = await prisma.cryptoConfig.create({
      data: {
        coin: payload.coin,
        isEnabled: true,
      },
      include: {
        networks: true,
      },
    });

    return this.serializeCoinConfig(coin);
  }

  public async updateCoin(coinName: string, payload: { isEnabled: boolean }) {
    const existing = await prisma.cryptoConfig.findUnique({
      where: { coin: coinName },
    });

    if (!existing) {
      throw new AppError(404, "Coin not found");
    }

    const coin = await prisma.cryptoConfig.update({
      where: { coin: coinName },
      data: {
        isEnabled: payload.isEnabled,
      },
      include: {
        networks: true,
      },
    });

    return this.serializeCoinConfig(coin);
  }

  public async addNetwork(coinName: string, payload: { name: string }) {
    const coin = await prisma.cryptoConfig.findUnique({
      where: { coin: coinName },
      include: {
        networks: true,
      },
    });

    if (!coin) {
      throw new AppError(404, "Coin not found");
    }

    const networkExists = coin.networks.some(
      (network: CryptoNetworkRecord) => network.name === payload.name,
    );

    if (networkExists) {
      throw new AppError(409, "Network already exists for this coin");
    }

    await prisma.cryptoNetwork.create({
      data: {
        cryptoConfigId: coin.id,
        name: payload.name,
        isEnabled: true,
      },
    });

    const updatedCoin = await prisma.cryptoConfig.findUnique({
      where: { coin: coinName },
      include: {
        networks: true,
      },
    });

    if (!updatedCoin) {
      throw new AppError(404, "Coin not found");
    }

    return this.serializeCoinConfig(updatedCoin);
  }

  public async updateNetwork(
    coinName: string,
    networkName: string,
    payload: { isEnabled: boolean },
  ) {
    const coin = await prisma.cryptoConfig.findUnique({
      where: { coin: coinName },
      include: {
        networks: true,
      },
    });

    if (!coin) {
      throw new AppError(404, "Coin not found");
    }

    const network = coin.networks.find(
      (item: CryptoNetworkRecord) => item.name === networkName,
    );

    if (!network) {
      throw new AppError(404, "Network not found");
    }

    await prisma.cryptoNetwork.update({
      where: {
        cryptoConfigId_name: {
          cryptoConfigId: coin.id,
          name: networkName,
        },
      },
      data: {
        isEnabled: payload.isEnabled,
      },
    });

    const updatedCoin = await prisma.cryptoConfig.findUnique({
      where: { coin: coinName },
      include: {
        networks: true,
      },
    });

    if (!updatedCoin) {
      throw new AppError(404, "Coin not found");
    }

    return this.serializeCoinConfig(updatedCoin);
  }

  public async listWithdrawals() {
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        snapshot: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return withdrawals.map((withdrawal: {
      id: string;
      userId: string;
      method: string;
      status: string;
      snapshot: WithdrawalSnapshotRecord | null;
      createdAt: Date;
    }) =>
      this.serializeWithdrawal(withdrawal),
    );
  }

  public async getWithdrawalById(withdrawalId: string) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        snapshot: true,
      },
    });

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
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        snapshot: true,
      },
    });

    if (!withdrawal) {
      throw new AppError(404, "Withdrawal not found");
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new AppError(409, "Only pending withdrawals can be updated");
    }

    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status,
      },
      include: {
        snapshot: true,
      },
    });

    return this.serializeWithdrawal(updatedWithdrawal);
  }

  private async resolveNonCryptoSnapshot(
    userId: string,
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
    userId: string,
    method: Exclude<WithdrawalMethodType, "crypto">,
    useSavedDetails: boolean,
    providedDetails?: PaypalDetails | RevolutDetails | BankDetails,
  ) {
    if (useSavedDetails) {
      const paymentDetails = await prisma.userPaymentDetails.findUnique({
        where: { userId },
      });

      if (!paymentDetails) {
        throw new AppError(400, "No saved payment details found for this user");
      }

      const snapshot = this.getSavedMethodDetails(paymentDetails, method);

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

    await prisma.userPaymentDetails.upsert({
      where: { userId },
      update: this.toPaymentDetailsUpdate(method, providedDetails),
      create: {
        userId,
        ...this.toPaymentDetailsCreate(method, providedDetails),
      },
    });

    return this.cloneSnapshot(providedDetails);
  }

  private async assertCryptoRouteEnabled(
    coinName: string,
    networkName: string,
  ) {
    const coin = await prisma.cryptoConfig.findUnique({
      where: { coin: coinName },
      include: {
        networks: true,
      },
    });

    if (!coin || !coin.isEnabled) {
      throw new AppError(400, "Selected coin is not enabled");
    }

    const network = coin.networks.find(
      (item: CryptoNetworkRecord) => item.name === networkName && item.isEnabled,
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
    const settings = await prisma.withdrawalSetting.findUnique({
      where: { id: WITHDRAWAL_SETTINGS_ID },
    });

    if (!settings) {
      throw new AppError(500, "Withdrawal settings are not initialized");
    }

    return settings;
  }

  private cloneSnapshot<T extends Record<string, unknown>>(value: T) {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private serializeCoinConfig(coin: {
    id?: string;
    coin: string;
    isEnabled: boolean;
    networks: CryptoNetworkRecord[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return {
      id: coin.id,
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

  private getSavedMethodDetails(
    paymentDetails: {
      paypalEmail: string | null;
      paypalName: string | null;
      paypalPaypalId: string | null;
      revolutFullName: string | null;
      revolutIban: string | null;
      revolutBic: string | null;
      revolutTag: string | null;
      bankAccountName: string | null;
      bankSortCode: string | null;
      bankAccountNumber: string | null;
      bankBankName: string | null;
      bankIban: string | null;
      bankBicSwift: string | null;
    },
    method: Exclude<WithdrawalMethodType, "crypto">,
  ) {
    if (method === WithdrawalMethod.PAYPAL) {
      if (
        !paymentDetails.paypalEmail ||
        !paymentDetails.paypalName ||
        !paymentDetails.paypalPaypalId
      ) {
        return null;
      }

      return {
        email: paymentDetails.paypalEmail,
        name: paymentDetails.paypalName,
        paypalId: paymentDetails.paypalPaypalId,
      };
    }

    if (method === WithdrawalMethod.REVOLUT) {
      if (
        !paymentDetails.revolutFullName ||
        !paymentDetails.revolutIban ||
        !paymentDetails.revolutBic
      ) {
        return null;
      }

      return {
        fullName: paymentDetails.revolutFullName,
        iban: paymentDetails.revolutIban,
        bic: paymentDetails.revolutBic,
        ...(paymentDetails.revolutTag
          ? { tag: paymentDetails.revolutTag }
          : {}),
      };
    }

    if (
      !paymentDetails.bankAccountName ||
      !paymentDetails.bankSortCode ||
      !paymentDetails.bankAccountNumber ||
      !paymentDetails.bankBankName ||
      !paymentDetails.bankIban ||
      !paymentDetails.bankBicSwift
    ) {
      return null;
    }

    return {
      accountName: paymentDetails.bankAccountName,
      sortCode: paymentDetails.bankSortCode,
      accountNumber: paymentDetails.bankAccountNumber,
      bankName: paymentDetails.bankBankName,
      iban: paymentDetails.bankIban,
      bicSwift: paymentDetails.bankBicSwift,
    };
  }

  private toPaymentDetailsCreate(
    method: Exclude<WithdrawalMethodType, "crypto">,
    providedDetails: PaypalDetails | RevolutDetails | BankDetails,
  ) {
    return this.toPaymentDetailsUpdate(method, providedDetails);
  }

  private toPaymentDetailsUpdate(
    method: Exclude<WithdrawalMethodType, "crypto">,
    providedDetails: PaypalDetails | RevolutDetails | BankDetails,
  ) {
    if (method === WithdrawalMethod.PAYPAL) {
      const details = providedDetails as PaypalDetails;
      return {
        paypalEmail: details.email,
        paypalName: details.name,
        paypalPaypalId: details.paypalId,
      };
    }

    if (method === WithdrawalMethod.REVOLUT) {
      const details = providedDetails as RevolutDetails;
      return {
        revolutFullName: details.fullName,
        revolutIban: details.iban,
        revolutBic: details.bic,
        revolutTag: details.tag ?? null,
      };
    }

    const details = providedDetails as BankDetails;
    return {
      bankAccountName: details.accountName,
      bankSortCode: details.sortCode,
      bankAccountNumber: details.accountNumber,
      bankBankName: details.bankName,
      bankIban: details.iban,
      bankBicSwift: details.bicSwift,
    };
  }

  private serializeWithdrawal(withdrawal: {
    id: string;
    userId: string;
    method: string;
    status: string;
    snapshot: WithdrawalSnapshotRecord | null;
    createdAt: Date;
  }) {
    const snapshot = this.cloneSnapshot(
      (withdrawal.snapshot ?? {}) as WithdrawalSnapshotRecord,
    );
    delete snapshot.withdrawalId;

    return {
      id: withdrawal.id,
      userId: withdrawal.userId,
      method: withdrawal.method as WithdrawalMethodType,
      status: withdrawal.status as "pending" | "approved" | "rejected",
      snapshot,
      createdAt: withdrawal.createdAt,
    };
  }
}

export const withdrawalService = new WithdrawalService();
