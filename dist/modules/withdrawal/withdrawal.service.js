"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalService = void 0;
const app_error_1 = require("../../common/errors/app-error");
const database_1 = require("../../database");
const withdrawal_constants_1 = require("./withdrawal.constants");
class WithdrawalService {
    async ensureSettingsDocument() {
        await database_1.prisma.withdrawalSetting.upsert({
            where: { id: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID },
            update: {},
            create: {
                id: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID,
                paypalEnabled: true,
                revolutEnabled: true,
                bankEnabled: true,
                cryptoEnabled: true,
            },
        });
    }
    async getAvailableMethods() {
        const settings = await this.getSettings();
        const methods = [];
        if (settings.paypalEnabled) {
            methods.push({ method: withdrawal_constants_1.WithdrawalMethod.PAYPAL });
        }
        if (settings.revolutEnabled) {
            methods.push({ method: withdrawal_constants_1.WithdrawalMethod.REVOLUT });
        }
        if (settings.bankEnabled) {
            methods.push({ method: withdrawal_constants_1.WithdrawalMethod.BANK });
        }
        if (settings.cryptoEnabled) {
            const enabledCoins = await database_1.prisma.cryptoConfig.findMany({
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
                method: withdrawal_constants_1.WithdrawalMethod.CRYPTO,
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
    async createWithdrawal(userId, payload) {
        const settings = await this.getSettings();
        if (payload.method === withdrawal_constants_1.WithdrawalMethod.CRYPTO) {
            this.assertMethodEnabled(settings.cryptoEnabled, withdrawal_constants_1.WithdrawalMethod.CRYPTO);
            if (payload.walletAddress !== payload.confirmWallet) {
                throw new app_error_1.AppError(400, "walletAddress and confirmWallet must match");
            }
            await this.assertCryptoRouteEnabled(payload.coin, payload.network);
            const snapshot = {
                coin: payload.coin,
                network: payload.network,
                walletAddress: payload.walletAddress,
            };
            const withdrawal = await database_1.prisma.withdrawal.create({
                data: {
                    userId,
                    method: withdrawal_constants_1.WithdrawalMethod.CRYPTO,
                    status: withdrawal_constants_1.WithdrawalStatus.PENDING,
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
        const snapshot = await this.resolveNonCryptoSnapshot(userId, settings, payload);
        const withdrawal = await database_1.prisma.withdrawal.create({
            data: {
                userId,
                method: payload.method,
                status: withdrawal_constants_1.WithdrawalStatus.PENDING,
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
    async updateMethodSettings(payload) {
        const updated = await database_1.prisma.withdrawalSetting.upsert({
            where: { id: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID },
            update: payload,
            create: {
                id: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID,
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
    async createCoin(payload) {
        const existing = await database_1.prisma.cryptoConfig.findUnique({
            where: { coin: payload.coin },
        });
        if (existing) {
            throw new app_error_1.AppError(409, "Coin already exists");
        }
        const coin = await database_1.prisma.cryptoConfig.create({
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
    async updateCoin(coinName, payload) {
        const existing = await database_1.prisma.cryptoConfig.findUnique({
            where: { coin: coinName },
        });
        if (!existing) {
            throw new app_error_1.AppError(404, "Coin not found");
        }
        const coin = await database_1.prisma.cryptoConfig.update({
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
    async addNetwork(coinName, payload) {
        const coin = await database_1.prisma.cryptoConfig.findUnique({
            where: { coin: coinName },
            include: {
                networks: true,
            },
        });
        if (!coin) {
            throw new app_error_1.AppError(404, "Coin not found");
        }
        const networkExists = coin.networks.some((network) => network.name === payload.name);
        if (networkExists) {
            throw new app_error_1.AppError(409, "Network already exists for this coin");
        }
        await database_1.prisma.cryptoNetwork.create({
            data: {
                cryptoConfigId: coin.id,
                name: payload.name,
                isEnabled: true,
            },
        });
        const updatedCoin = await database_1.prisma.cryptoConfig.findUnique({
            where: { coin: coinName },
            include: {
                networks: true,
            },
        });
        if (!updatedCoin) {
            throw new app_error_1.AppError(404, "Coin not found");
        }
        return this.serializeCoinConfig(updatedCoin);
    }
    async updateNetwork(coinName, networkName, payload) {
        const coin = await database_1.prisma.cryptoConfig.findUnique({
            where: { coin: coinName },
            include: {
                networks: true,
            },
        });
        if (!coin) {
            throw new app_error_1.AppError(404, "Coin not found");
        }
        const network = coin.networks.find((item) => item.name === networkName);
        if (!network) {
            throw new app_error_1.AppError(404, "Network not found");
        }
        await database_1.prisma.cryptoNetwork.update({
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
        const updatedCoin = await database_1.prisma.cryptoConfig.findUnique({
            where: { coin: coinName },
            include: {
                networks: true,
            },
        });
        if (!updatedCoin) {
            throw new app_error_1.AppError(404, "Coin not found");
        }
        return this.serializeCoinConfig(updatedCoin);
    }
    async listWithdrawals() {
        const withdrawals = await database_1.prisma.withdrawal.findMany({
            include: {
                snapshot: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return withdrawals.map((withdrawal) => this.serializeWithdrawal(withdrawal));
    }
    async getWithdrawalById(withdrawalId) {
        const withdrawal = await database_1.prisma.withdrawal.findUnique({
            where: { id: withdrawalId },
            include: {
                snapshot: true,
            },
        });
        if (!withdrawal) {
            throw new app_error_1.AppError(404, "Withdrawal not found");
        }
        return this.serializeWithdrawal(withdrawal);
    }
    async approveWithdrawal(withdrawalId) {
        return this.updateWithdrawalStatus(withdrawalId, withdrawal_constants_1.WithdrawalStatus.APPROVED);
    }
    async rejectWithdrawal(withdrawalId) {
        return this.updateWithdrawalStatus(withdrawalId, withdrawal_constants_1.WithdrawalStatus.REJECTED);
    }
    async updateWithdrawalStatus(withdrawalId, status) {
        const withdrawal = await database_1.prisma.withdrawal.findUnique({
            where: { id: withdrawalId },
            include: {
                snapshot: true,
            },
        });
        if (!withdrawal) {
            throw new app_error_1.AppError(404, "Withdrawal not found");
        }
        if (withdrawal.status !== withdrawal_constants_1.WithdrawalStatus.PENDING) {
            throw new app_error_1.AppError(409, "Only pending withdrawals can be updated");
        }
        const updatedWithdrawal = await database_1.prisma.withdrawal.update({
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
    async resolveNonCryptoSnapshot(userId, settings, payload) {
        if (payload.method === withdrawal_constants_1.WithdrawalMethod.PAYPAL) {
            this.assertMethodEnabled(settings.paypalEnabled, payload.method);
            return this.resolvePaymentSnapshot(userId, payload.method, payload.useSavedDetails === true, payload.details);
        }
        if (payload.method === withdrawal_constants_1.WithdrawalMethod.REVOLUT) {
            this.assertMethodEnabled(settings.revolutEnabled, payload.method);
            return this.resolvePaymentSnapshot(userId, payload.method, payload.useSavedDetails === true, payload.details);
        }
        this.assertMethodEnabled(settings.bankEnabled, payload.method);
        return this.resolvePaymentSnapshot(userId, payload.method, payload.useSavedDetails === true, payload.details);
    }
    async resolvePaymentSnapshot(userId, method, useSavedDetails, providedDetails) {
        if (useSavedDetails) {
            const paymentDetails = await database_1.prisma.userPaymentDetails.findUnique({
                where: { userId },
            });
            if (!paymentDetails) {
                throw new app_error_1.AppError(400, "No saved payment details found for this user");
            }
            const snapshot = this.getSavedMethodDetails(paymentDetails, method);
            if (!snapshot) {
                throw new app_error_1.AppError(400, `No saved ${method} details found for this user`);
            }
            return this.cloneSnapshot(snapshot);
        }
        if (!providedDetails) {
            throw new app_error_1.AppError(400, "Payment details are required");
        }
        await database_1.prisma.userPaymentDetails.upsert({
            where: { userId },
            update: this.toPaymentDetailsUpdate(method, providedDetails),
            create: {
                userId,
                ...this.toPaymentDetailsCreate(method, providedDetails),
            },
        });
        return this.cloneSnapshot(providedDetails);
    }
    async assertCryptoRouteEnabled(coinName, networkName) {
        const coin = await database_1.prisma.cryptoConfig.findUnique({
            where: { coin: coinName },
            include: {
                networks: true,
            },
        });
        if (!coin || !coin.isEnabled) {
            throw new app_error_1.AppError(400, "Selected coin is not enabled");
        }
        const network = coin.networks.find((item) => item.name === networkName && item.isEnabled);
        if (!network) {
            throw new app_error_1.AppError(400, "Selected network is not enabled for this coin");
        }
    }
    assertMethodEnabled(isEnabled, method) {
        if (!isEnabled) {
            throw new app_error_1.AppError(403, `${method} withdrawals are currently disabled`);
        }
    }
    async getSettings() {
        const settings = await database_1.prisma.withdrawalSetting.findUnique({
            where: { id: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID },
        });
        if (!settings) {
            throw new app_error_1.AppError(500, "Withdrawal settings are not initialized");
        }
        return settings;
    }
    cloneSnapshot(value) {
        return JSON.parse(JSON.stringify(value));
    }
    serializeCoinConfig(coin) {
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
    getSavedMethodDetails(paymentDetails, method) {
        if (method === withdrawal_constants_1.WithdrawalMethod.PAYPAL) {
            if (!paymentDetails.paypalEmail ||
                !paymentDetails.paypalName ||
                !paymentDetails.paypalPaypalId) {
                return null;
            }
            return {
                email: paymentDetails.paypalEmail,
                name: paymentDetails.paypalName,
                paypalId: paymentDetails.paypalPaypalId,
            };
        }
        if (method === withdrawal_constants_1.WithdrawalMethod.REVOLUT) {
            if (!paymentDetails.revolutFullName ||
                !paymentDetails.revolutIban ||
                !paymentDetails.revolutBic) {
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
        if (!paymentDetails.bankAccountName ||
            !paymentDetails.bankSortCode ||
            !paymentDetails.bankAccountNumber ||
            !paymentDetails.bankBankName ||
            !paymentDetails.bankIban ||
            !paymentDetails.bankBicSwift) {
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
    toPaymentDetailsCreate(method, providedDetails) {
        return this.toPaymentDetailsUpdate(method, providedDetails);
    }
    toPaymentDetailsUpdate(method, providedDetails) {
        if (method === withdrawal_constants_1.WithdrawalMethod.PAYPAL) {
            const details = providedDetails;
            return {
                paypalEmail: details.email,
                paypalName: details.name,
                paypalPaypalId: details.paypalId,
            };
        }
        if (method === withdrawal_constants_1.WithdrawalMethod.REVOLUT) {
            const details = providedDetails;
            return {
                revolutFullName: details.fullName,
                revolutIban: details.iban,
                revolutBic: details.bic,
                revolutTag: details.tag ?? null,
            };
        }
        const details = providedDetails;
        return {
            bankAccountName: details.accountName,
            bankSortCode: details.sortCode,
            bankAccountNumber: details.accountNumber,
            bankBankName: details.bankName,
            bankIban: details.iban,
            bankBicSwift: details.bicSwift,
        };
    }
    serializeWithdrawal(withdrawal) {
        const snapshot = this.cloneSnapshot((withdrawal.snapshot ?? {}));
        delete snapshot.withdrawalId;
        return {
            id: withdrawal.id,
            userId: withdrawal.userId,
            method: withdrawal.method,
            status: withdrawal.status,
            snapshot,
            createdAt: withdrawal.createdAt,
        };
    }
}
exports.withdrawalService = new WithdrawalService();
//# sourceMappingURL=withdrawal.service.js.map