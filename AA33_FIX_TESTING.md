# AA33 Paymaster Fix - Testing Guide

## What Was Fixed

### Issue
The AA33 error was caused by paymaster gas limits being set to 0:
- `paymasterVerificationGasLimit: 0`
- `paymasterPostOpGasLimit: 0`

This happened because the paymaster response from Pimlico (EntryPoint v0.7 format) was being converted to packed format (`paymasterAndData`), which lost the gas limit information.

### Solution
1. **Updated `getPaymasterData` in ZeroDevSmartWalletProvider.tsx** to return v0.7 unpacked format with gas limits preserved:
   - Returns `paymaster`, `paymasterData`, `paymasterVerificationGasLimit`, and `paymasterPostOpGasLimit` as separate fields
   - Converts hex gas limits to BigInt as required by viem types

2. **Improved bundler proxy** to handle both packed and unpacked formats:
   - Added logging to track gas limits through the conversion process
   - Ensures gas limits are preserved when converting formats

## How to Test

### 1. Restart the Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Check the Console Logs
When you try to send a payment, you should see:

**Paymaster Response (should include gas limits):**
```
[PIMLICO PAYMASTER PROXY] ✅ Paymaster response: {
  hasPaymaster: true,
  hasPaymasterData: true,
  paymasterVerificationGasLimit: 0x8a8e,  // ← Should be non-zero
  paymasterPostOpGasLimit: 0x1,           // ← Should be non-zero
}
```

**ZeroDev Client (should return unpacked format):**
```
[ZERODEV] ✅ Using v0.7 unpacked format with gas limits
[ZERODEV] ✅ Returning packed paymasterAndData, length: 198
```

**Bundler Proxy (should show gas limits when converting):**
```
[PIMLICO BUNDLER PROXY] 📋 UserOp gas limits before conversion: {
  hasVerificationGasLimit: true,
  verificationGasLimit: 0x8a8e,  // ← Should be non-zero
  hasPostOpGasLimit: true,
  postOpGasLimit: 0x1,           // ← Should be non-zero
}
```

### 3. Send a Test Payment
1. Go to the payments page (`/pagos`)
2. Enter payment details (amount, token, recipient)
3. Click "Send Payment"
4. **Expected Result**: Transaction should succeed without AA33 error

### 4. Verify on Block Explorer
If the transaction succeeds, you should see:
- Transaction hash in the console
- Link to Celo block explorer
- Status: "Success" ✅

## Troubleshooting

### Still Getting AA33 Error?

**Check 1: Are gas limits actually non-zero?**
Look in console for:
```
paymasterVerificationGasLimit: 0x8a8e  // ← Should NOT be 0x0
paymasterPostOpGasLimit: 0x1          // ← Should NOT be 0x0
```

If they're still `0x0`, the issue is that Pimlico isn't returning gas limits. This could mean:
- Pimlico API version mismatch
- Pimlico account issue

**Check 2: Verify Pimlico is returning v0.7 format**
Look for:
```
[PIMLICO PAYMASTER PROXY] ✅ EntryPoint v0.7 response (unpacked format)
```

If you see "v0.6" or errors about missing fields, the Pimlico API might not be using v0.7.

**Check 3: Check Pimlico Account Balance**
Go to https://dashboard.pimlico.io and verify:
- Your account has sufficient credits or deposit
- The API key is active
- Access to Celo Mainnet (chain 42220) is enabled

### Other AA33 Causes

If gas limits are correct but you still get AA33:
1. **Paymaster signature expired** - Retry the transaction (paymaster signatures have a short validity window)
2. **UserOperation modified after paymaster approval** - Check if any middleware is modifying the UserOp
3. **Paymaster contract issue** - Verify Pimlico's paymaster contract is functioning (check their status page)

## Expected Console Output (Success)

```
[ZERODEV] 💰 getPaymasterData called
[ZERODEV] 📤 Calling Pimlico paymaster via secure proxy...
[PIMLICO PAYMASTER PROXY] ✅ API key found, length: 26
[PIMLICO PAYMASTER PROXY] ✅ Paymaster response: {
  hasPaymaster: true,
  hasPaymasterData: true,
  paymasterVerificationGasLimit: 0x8a8e,
  paymasterPostOpGasLimit: 0x1
}
[PIMLICO PAYMASTER PROXY] ✅ EntryPoint v0.7 response (unpacked format)
[ZERODEV] ✅ Using v0.7 unpacked format with gas limits
[PIMLICO BUNDLER PROXY] 📋 UserOp gas limits before conversion: {
  hasVerificationGasLimit: true,
  verificationGasLimit: 0x8a8e,
  hasPostOpGasLimit: true,
  postOpGasLimit: 0x1
}
[PIMLICO BUNDLER PROXY] ✅ Unpacked format
✅ User operation enviada, esperando confirmación...
✅ Transacción confirmada: 0x...
```

## Documentation
- See `AA33_PAYMASTER_FIX.md` for detailed technical explanation
- See `PIMLICO_PAYMASTER_SETUP.md` for Pimlico configuration
- See `HOW_TO_FUND_PAYMASTER.md` for paymaster funding instructions




