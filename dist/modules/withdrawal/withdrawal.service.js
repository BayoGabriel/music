"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalService = void 0;
const mongoose_1 = require("mongoose");
const app_error_1 = require("../../common/errors/app-error");
const crypto_config_model_1 = require("./crypto-config.model");
const user_payment_details_model_1 = require("./user-payment-details.model");
const withdrawal_model_1 = require("./withdrawal.model");
const withdrawal_settings_model_1 = require("./withdrawal-settings.model");
const withdrawal_constants_1 = require("./withdrawal.constants");
class WithdrawalService {
    async ensureSettingsDocument() {
        await withdrawal_settings_model_1.WithdrawalSettingsModel.updateOne({ _id: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID }, {
            $setOnInsert: {
                _id: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID,
                paypalEnabled: true,
                revolutEnabled: true,
                bankEnabled: true,
                cryptoEnabled: true,
            },
        }, {
            upsert: true,
            setDefaultsOnInsert: true,
        }).exec();
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
            const enabledCoins = await crypto_config_model_1.CryptoConfigModel.find({
                isEnabled: true,
                "networks.isEnabled": true,
            })
                .lean()
                .exec();
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
        const objectId = new mongoose_1.Types.ObjectId(userId);
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
            const withdrawal = await withdrawal_model_1.WithdrawalModel.create({
                userId: objectId,
                method: withdrawal_constants_1.WithdrawalMethod.CRYPTO,
                status: withdrawal_constants_1.WithdrawalStatus.PENDING,
                snapshot,
            });
            return this.serializeWithdrawal(withdrawal);
        }
        const snapshot = await this.resolveNonCryptoSnapshot(objectId, settings, payload);
        const withdrawal = await withdrawal_model_1.WithdrawalModel.create({
            userId: objectId,
            method: payload.method,
            status: withdrawal_constants_1.WithdrawalStatus.PENDING,
            snapshot,
        });
        return this.serializeWithdrawal(withdrawal);
    }
    async updateMethodSettings(payload) {
        const updated = await withdrawal_settings_model_1.WithdrawalSettingsModel.findOneAndUpdate({ _id: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID }, {
            $set: payload,
            $setOnInsert: {
                _id: withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID,
            },
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }).exec();
        if (!updated) {
            throw new app_error_1.AppError(500, "Unable to update withdrawal settings");
        }
        return {
            paypalEnabled: updated.paypalEnabled,
            revolutEnabled: updated.revolutEnabled,
            bankEnabled: updated.bankEnabled,
            cryptoEnabled: updated.cryptoEnabled,
            updatedAt: updated.updatedAt,
        };
    }
    async createCoin(payload) {
        const existing = await crypto_config_model_1.CryptoConfigModel.findOne({
            coin: payload.coin,
        }).exec();
        if (existing) {
            throw new app_error_1.AppError(409, "Coin already exists");
        }
        const coin = await crypto_config_model_1.CryptoConfigModel.create({
            coin: payload.coin,
            isEnabled: true,
            networks: [],
        });
        return this.serializeCoinConfig(coin);
    }
    async updateCoin(coinName, payload) {
        const coin = await crypto_config_model_1.CryptoConfigModel.findOne({ coin: coinName }).exec();
        if (!coin) {
            throw new app_error_1.AppError(404, "Coin not found");
        }
        coin.isEnabled = payload.isEnabled;
        await coin.save();
        return this.serializeCoinConfig(coin);
    }
    async addNetwork(coinName, payload) {
        const coin = await crypto_config_model_1.CryptoConfigModel.findOne({ coin: coinName }).exec();
        if (!coin) {
            throw new app_error_1.AppError(404, "Coin not found");
        }
        const networkExists = coin.networks.some((network) => network.name === payload.name);
        if (networkExists) {
            throw new app_error_1.AppError(409, "Network already exists for this coin");
        }
        coin.networks.push({
            name: payload.name,
            isEnabled: true,
        });
        await coin.save();
        return this.serializeCoinConfig(coin);
    }
    async updateNetwork(coinName, networkName, payload) {
        const coin = await crypto_config_model_1.CryptoConfigModel.findOne({ coin: coinName }).exec();
        if (!coin) {
            throw new app_error_1.AppError(404, "Coin not found");
        }
        const network = coin.networks.find((item) => item.name === networkName);
        if (!network) {
            throw new app_error_1.AppError(404, "Network not found");
        }
        network.isEnabled = payload.isEnabled;
        await coin.save();
        return this.serializeCoinConfig(coin);
    }
    async listWithdrawals() {
        const withdrawals = await withdrawal_model_1.WithdrawalModel.find()
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return withdrawals.map((withdrawal) => this.serializeWithdrawal(withdrawal));
    }
    async getWithdrawalById(withdrawalId) {
        const withdrawal = await withdrawal_model_1.WithdrawalModel.findById(withdrawalId)
            .lean()
            .exec();
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
        const withdrawal = await withdrawal_model_1.WithdrawalModel.findById(withdrawalId).exec();
        if (!withdrawal) {
            throw new app_error_1.AppError(404, "Withdrawal not found");
        }
        if (withdrawal.status !== withdrawal_constants_1.WithdrawalStatus.PENDING) {
            throw new app_error_1.AppError(409, "Only pending withdrawals can be updated");
        }
        withdrawal.status = status;
        await withdrawal.save();
        return this.serializeWithdrawal(withdrawal);
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
            const paymentDetails = await user_payment_details_model_1.UserPaymentDetailsModel.findOne({ userId })
                .lean()
                .exec();
            if (!paymentDetails) {
                throw new app_error_1.AppError(400, "No saved payment details found for this user");
            }
            const snapshot = paymentDetails[method];
            if (!snapshot) {
                throw new app_error_1.AppError(400, `No saved ${method} details found for this user`);
            }
            return this.cloneSnapshot(snapshot);
        }
        if (!providedDetails) {
            throw new app_error_1.AppError(400, "Payment details are required");
        }
        await user_payment_details_model_1.UserPaymentDetailsModel.findOneAndUpdate({ userId }, {
            $set: {
                [method]: providedDetails,
            },
            $setOnInsert: {
                userId,
            },
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }).exec();
        return this.cloneSnapshot(providedDetails);
    }
    async assertCryptoRouteEnabled(coinName, networkName) {
        const coin = await crypto_config_model_1.CryptoConfigModel.findOne({
            coin: coinName,
            isEnabled: true,
        })
            .lean()
            .exec();
        if (!coin) {
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
        const settings = await withdrawal_settings_model_1.WithdrawalSettingsModel.findById(withdrawal_constants_1.WITHDRAWAL_SETTINGS_ID)
            .lean()
            .exec();
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
    serializeWithdrawal(withdrawal) {
        return {
            id: typeof withdrawal._id === "string"
                ? withdrawal._id
                : withdrawal._id.toString(),
            userId: typeof withdrawal.userId === "string"
                ? withdrawal.userId
                : withdrawal.userId.toString(),
            method: withdrawal.method,
            status: withdrawal.status,
            snapshot: this.cloneSnapshot(withdrawal.snapshot),
            createdAt: withdrawal.createdAt,
        };
    }
}
exports.withdrawalService = new WithdrawalService();
//# sourceMappingURL=withdrawal.service.js.map