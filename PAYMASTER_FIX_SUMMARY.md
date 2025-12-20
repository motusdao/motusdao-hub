# Paymaster Fix Summary

## Problem Analysis

The application was experiencing errors when trying to send gasless transactions:

1. **Error 1**: `MethodNotFoundRpcError: The method "eth_estimateUserOperationGas" does not exist / is not available.`
2. **Error 2**: `Validation error: Unrecognized key: "paymasterAndData" at "params[0].userOp"`

### Root Cause

The bundler routing logic was incorrectly routing `eth_estimateUserOperationGas` to ZeroDev bundler, which:
- Rejects `paymasterAndData` during gas estimation
- Causes validation errors when the userOp includes paymaster data

Additionally, the code had an incorrect assumption that Pimlico doesn't support `eth_estimateUserOperationGas`, when in fact Pimlico **does support** this method.

## Solution Implemented

### 1. Fixed Bundler Routing Logic

**File**: `lib/contexts/ZeroDevSmartWalletProvider.tsx`

**Changes**:
- Removed incorrect routing of `eth_estimateUserOperationGas` to ZeroDev bundler
- Now routes all standard ERC-4337 methods (including `eth_estimateUserOperationGas`) to Pimlico bundler
- Only ZeroDev-specific methods (starting with `zd_` or containing `zerodev`) are routed to ZeroDev bundler

**Before**:
```typescript
if (method.startsWith('zd_') || 
    method.includes('zerodev') ||
    method === 'eth_estimateUserOperationGas') {
  shouldUseZeroDevBundler = true
}
```

**After**:
```typescript
if (method.startsWith('zd_') || method.includes('zerodev')) {
  shouldUseZeroDevBundler = true
}
// All other methods (including eth_estimateUserOperationGas) go to Pimlico bundler
```

### 2. Pimlico Bundler Proxy Already Handles paymasterAndData

**File**: `app/api/pimlico/bundler/route.ts`

The proxy already correctly strips `paymasterAndData` from userOps during gas estimation:
- Detects `eth_estimateUserOperationGas` method
- Removes `paymasterAndData` from the userOp before forwarding to Pimlico
- This prevents validation errors

## Architecture After Fix

```
┌─────────────────────────────────────────┐
│         ZeroDev SDK (Client)            │
│  - Smart wallet creation                │
│  - User operation preparation            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      Smart Bundler Router               │
│  - ZeroDev-specific (zd_*) → ZeroDev    │
│  - Standard ERC-4337 → Pimlico          │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│  ZeroDev Bundler │  │ Pimlico Bundler   │
│  (Direct)        │  │ Proxy             │
│                  │  │ - Strips          │
│                  │  │   paymasterAndData│
│                  │  │ - Adds API key    │
└──────────────────┘  └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Pimlico API     │
                    │  (with API key)  │
                    └──────────────────┘
```

## Benefits

1. ✅ **Gas estimation works**: `eth_estimateUserOperationGas` now goes to Pimlico bundler which supports it
2. ✅ **No validation errors**: `paymasterAndData` is automatically stripped during gas estimation
3. ✅ **Consistent routing**: All standard ERC-4337 methods use Pimlico bundler
4. ✅ **ZeroDev compatibility**: ZeroDev-specific methods still work via ZeroDev bundler

## Testing

After this fix, gasless transactions should work correctly:

1. Gas estimation will succeed (no more "method does not exist" errors)
2. No validation errors about `paymasterAndData`
3. Transactions can be sent without gas (sponsored by Pimlico paymaster)

## Configuration Requirements

Ensure these environment variables are set:

- `PIMLICO_API_KEY`: Required for Pimlico bundler and paymaster (server-side only)
- `NEXT_PUBLIC_ZERODEV_PROJECT_ID`: Required for ZeroDev smart wallet creation

## Notes

- Pimlico bundler **does support** `eth_estimateUserOperationGas` (contrary to previous assumption)
- The Pimlico bundler proxy automatically handles `paymasterAndData` stripping
- ZeroDev bundler is only used for ZeroDev-specific methods (zd_*)
- All standard ERC-4337 operations use Pimlico bundler for consistency

