# API Endpoint Reference

## Base URL

```text
http://localhost:4000
```

## Authentication

Use this header for protected routes:

```text
Authorization: Bearer <jwt_token>
```

## Content Types

- `application/json` for most endpoints
- `multipart/form-data` for `POST /admin/songs`

---

# Health

## `GET /health`

- **Auth**: None
- **Body**: None
- **Params**: None
- **Query**: None

---

# Auth

## `POST /auth/register`

- **Auth**: None
- **Content-Type**: `application/json`
- **Params**: None
- **Query**: None

### Body

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Validation

- `email`: valid email, trimmed, lowercased
- `password`: string, 8-128 characters

## `POST /auth/login`

- **Auth**: None
- **Content-Type**: `application/json`
- **Params**: None
- **Query**: None

### Body

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Validation

- `email`: valid email, trimmed, lowercased
- `password`: string, 8-128 characters

---

# Users

## `GET /users/me`

- **Auth**: Required
- **Body**: None
- **Params**: None
- **Query**: None

---

# Songs

All user-facing song endpoints are blocked when music is globally disabled.

## `GET /songs`

- **Auth**: None
- **Body**: None
- **Params**: None
- **Query**: None

## `GET /songs/:id`

- **Auth**: None
- **Body**: None
- **Query**: None

### Params

```json
{
  "id": "67f0c2e6c1234567890abcde"
}
```

### Validation

- `id`: string, exactly 24 characters

## `GET /songs/:id/stream`

- **Auth**: None
- **Body**: None
- **Query**: None

### Params

```json
{
  "id": "67f0c2e6c1234567890abcde"
}
```

### Headers

Optional:

```text
Range: bytes=0-1023
```

### Validation

- `id`: string, exactly 24 characters
- `Range`: if provided, must match `bytes=<start>-<end>`

---

# Admin Songs

All `/admin/*` endpoints require:

- valid JWT
- role = `admin`

## `POST /admin/songs`

- **Auth**: Admin required
- **Content-Type**: `multipart/form-data`
- **Params**: None
- **Query**: None

### Form fields

```text
title: string
artist: string
duration: number
audio: file
coverImage: file
```

### Validation

- `title`: string, trimmed, 1-200 chars
- `artist`: string, trimmed, 1-200 chars
- `duration`: positive number
- `audio`: required, max 1 file, MIME type must be one of:
  - `audio/mpeg`
  - `audio/mp3`
  - `audio/wav`
  - `audio/x-wav`
- `coverImage`: required, max 1 file, MIME type must start with `image/`
- maximum uploaded files: 2

## `PATCH /admin/songs/:id`

- **Auth**: Admin required
- **Content-Type**: `application/json`
- **Query**: None

### Params

```json
{
  "id": "67f0c2e6c1234567890abcde"
}
```

### Body

```json
{
  "title": "Updated Song Title",
  "artist": "Updated Artist",
  "duration": 240
}
```

### Allowed partial bodies

```json
{
  "title": "Updated Song Title"
}
```

```json
{
  "artist": "Updated Artist"
}
```

```json
{
  "duration": 240
}
```

### Validation

- `id`: string, exactly 24 characters
- body must include at least one of:
  - `title`
  - `artist`
  - `duration`
- `title`: string, trimmed, 1-200 chars
- `artist`: string, trimmed, 1-200 chars
- `duration`: positive number

## `DELETE /admin/songs/:id`

- **Auth**: Admin required
- **Body**: None
- **Query**: None

### Params

```json
{
  "id": "67f0c2e6c1234567890abcde"
}
```

### Validation

- `id`: string, exactly 24 characters

---

# Admin Platform Control

## `PATCH /admin/platform/enable`

- **Auth**: Admin required
- **Body**: None
- **Params**: None
- **Query**: None

## `PATCH /admin/platform/disable`

- **Auth**: Admin required
- **Body**: None
- **Params**: None
- **Query**: None

---

# Withdrawal User Endpoints

All `/withdrawal/*` endpoints require a valid JWT.

## `GET /withdrawal/methods`

- **Auth**: Required
- **Body**: None
- **Params**: None
- **Query**: None

## `POST /withdrawal`

- **Auth**: Required
- **Content-Type**: `application/json`
- **Params**: None
- **Query**: None

### PayPal using saved details

```json
{
  "method": "paypal",
  "useSavedDetails": true
}
```

### PayPal with new details

```json
{
  "method": "paypal",
  "useSavedDetails": false,
  "details": {
    "email": "paypaluser@example.com",
    "name": "John Doe",
    "paypalId": "PAYPAL-USER-123"
  }
}
```

### Revolut using saved details

```json
{
  "method": "revolut",
  "useSavedDetails": true
}
```

### Revolut with new details

```json
{
  "method": "revolut",
  "useSavedDetails": false,
  "details": {
    "fullName": "John Doe",
    "iban": "GB33BUKB20201555555555",
    "bic": "REVOGB21",
    "tag": "johnrevolut"
  }
}
```

### Bank using saved details

```json
{
  "method": "bank",
  "useSavedDetails": true
}
```

### Bank with new details

```json
{
  "method": "bank",
  "useSavedDetails": false,
  "details": {
    "accountName": "John Doe",
    "sortCode": "12-34-56",
    "accountNumber": "12345678",
    "bankName": "Example Bank",
    "iban": "GB29NWBK60161331926819",
    "bicSwift": "NWBKGB2L"
  }
}
```

### Crypto withdrawal

```json
{
  "method": "crypto",
  "coin": "USDT",
  "network": "TRC20",
  "walletAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "confirmWallet": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
}
```

### Validation

- `method` must be one of:
  - `paypal`
  - `revolut`
  - `bank`
  - `crypto`
- for `paypal`, `revolut`, `bank`:
  - if `useSavedDetails: true`, do not send `details`
  - if `useSavedDetails` is omitted or false, `details` is required
- PayPal details:
  - `email`: valid email
  - `name`: non-empty string
  - `paypalId`: non-empty string
- Revolut details:
  - `fullName`: non-empty string
  - `iban`: non-empty string
  - `bic`: non-empty string
  - `tag`: optional non-empty string
- Bank details:
  - `accountName`: non-empty string
  - `sortCode`: non-empty string
  - `accountNumber`: non-empty string
  - `bankName`: non-empty string
  - `iban`: non-empty string
  - `bicSwift`: non-empty string
- Crypto details:
  - `coin`: non-empty string
  - `network`: non-empty string
  - `walletAddress`: non-empty string
  - `confirmWallet`: non-empty string
  - `walletAddress` must equal `confirmWallet`
- disabled methods are blocked
- disabled coins or networks are blocked
- crypto details are never saved to user profile

---

# Admin Withdrawal Settings and Crypto Management

## `PATCH /admin/settings/methods`

- **Auth**: Admin required
- **Content-Type**: `application/json`
- **Params**: None
- **Query**: None

### Body

```json
{
  "paypalEnabled": true,
  "revolutEnabled": true,
  "bankEnabled": true,
  "cryptoEnabled": true
}
```

### Partial examples

```json
{
  "paypalEnabled": false
}
```

```json
{
  "cryptoEnabled": false
}
```

### Validation

- send at least one field
- allowed fields:
  - `paypalEnabled`: boolean
  - `revolutEnabled`: boolean
  - `bankEnabled`: boolean
  - `cryptoEnabled`: boolean

## `POST /admin/crypto/coins`

- **Auth**: Admin required
- **Content-Type**: `application/json`
- **Params**: None
- **Query**: None

### Body

```json
{
  "coin": "USDT"
}
```

### Validation

- `coin`: non-empty string

## `PATCH /admin/crypto/coins/:coin`

- **Auth**: Admin required
- **Content-Type**: `application/json`
- **Query**: None

### Params

```json
{
  "coin": "USDT"
}
```

### Body

```json
{
  "isEnabled": true
}
```

### Validation

- `coin`: non-empty string
- `isEnabled`: boolean

## `POST /admin/crypto/coins/:coin/networks`

- **Auth**: Admin required
- **Content-Type**: `application/json`
- **Query**: None

### Params

```json
{
  "coin": "USDT"
}
```

### Body

```json
{
  "name": "TRC20"
}
```

### Validation

- `coin`: non-empty string
- `name`: non-empty string

## `PATCH /admin/crypto/coins/:coin/networks/:network`

- **Auth**: Admin required
- **Content-Type**: `application/json`
- **Query**: None

### Params

```json
{
  "coin": "USDT",
  "network": "TRC20"
}
```

### Body

```json
{
  "isEnabled": true
}
```

### Validation

- `coin`: non-empty string
- `network`: non-empty string
- `isEnabled`: boolean

---

# Admin Withdrawal Review

## `GET /admin/withdrawals`

- **Auth**: Admin required
- **Body**: None
- **Params**: None
- **Query**: None

## `GET /admin/withdrawals/:id`

- **Auth**: Admin required
- **Body**: None
- **Query**: None

### Params

```json
{
  "id": "67f0c2e6c1234567890abcde"
}
```

### Validation

- `id`: string, exactly 24 characters

## `PATCH /admin/withdrawals/:id/approve`

- **Auth**: Admin required
- **Body**: None
- **Query**: None

### Params

```json
{
  "id": "67f0c2e6c1234567890abcde"
}
```

### Validation

- `id`: string, exactly 24 characters
- endpoint only changes status to `approved`
- no external payment action occurs

## `PATCH /admin/withdrawals/:id/reject`

- **Auth**: Admin required
- **Body**: None
- **Query**: None

### Params

```json
{
  "id": "67f0c2e6c1234567890abcde"
}
```

### Validation

- `id`: string, exactly 24 characters
- endpoint only changes status to `rejected`
- no external payment action occurs

---

# Quick Endpoint Inventory

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `GET /songs`
- `GET /songs/:id`
- `GET /songs/:id/stream`
- `POST /admin/songs`
- `PATCH /admin/songs/:id`
- `DELETE /admin/songs/:id`
- `PATCH /admin/platform/enable`
- `PATCH /admin/platform/disable`
- `GET /withdrawal/methods`
- `POST /withdrawal`
- `PATCH /admin/settings/methods`
- `POST /admin/crypto/coins`
- `PATCH /admin/crypto/coins/:coin`
- `POST /admin/crypto/coins/:coin/networks`
- `PATCH /admin/crypto/coins/:coin/networks/:network`
- `GET /admin/withdrawals`
- `GET /admin/withdrawals/:id`
- `PATCH /admin/withdrawals/:id/approve`
- `PATCH /admin/withdrawals/:id/reject`
