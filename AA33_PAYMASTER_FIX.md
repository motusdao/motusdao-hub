# AA33 Paymaster Error - FIXED

## Problem

The application was throwing an AA33 error when trying to send token payments:

```
PaymasterFunctionRevertedError: The `validatePaymasterUserOp` function on the Paymaster reverted.
Details: UserOperation reverted with reason: AA33 reverted 0x
```

## Root Cause

The AA33 error occurs when the paymaster validation fails. In this case, the issue was that the **paymaster gas limits were being set to 0**:

```
paymasterPostOpGasLimit: 0
paymasterVerificationGasLimit: 0
```

### Why This Happened

1. **Pimlico returns EntryPoint v0.7 format** with unpacked paymaster data:
   - `paymaster` (address)
   - `paymasterData` (hex data)
   - `paymasterVerificationGasLimit` (gas for validation)
   - `paymasterPostOpGasLimit` (gas for post-operation)

2. **Previous code was converting to packed format** (`paymasterAndData`) for viem/ZeroDev compatibility, but this **lost the gas limit information**.

3. **Without proper gas limits**, the EntryPoint contract couldn't allocate enough gas for paymaster validation, causing the AA33 revert.

## Solution

### 1. Updated `getPaymasterData` to Return v0.7 Unpacked Format

**File**: `/lib/contexts/ZeroDevSmartWalletProvider.tsx`

Changed from returning packed format:
```typescript
return {
  paymasterAndData: paymasterAndData as `0x${string}`,
}
```

To returning unpacked format with gas limits:
```typescript
return {
  paymaster: result.paymaster as `0x${string}`,
  paymasterData: (result.paymasterData || '0x') as `0x${string}`,
  paymasterVerificationGasLimit: toGasLimit(result.paymasterVerificationGasLimit),
  paymasterPostOpGasLimit: toGasLimit(result.paymasterPostOpGasLimit),
}
```

### 2. Updated Bundler Proxy to Handle Both Formats

**File**: `/app/api/pimlico/bundler/route.ts`

- **CRITICAL FIX**: Remove `paymasterAndData` when v0.7 unpacked fields are present
  - Viem/ZeroDev adds both packed and unpacked formats to the UserOperation
  - Pimlico v0.7 API rejects UserOps with `paymasterAndData` field
  - Solution: Strip `paymasterAndData` when `paymaster` field exists
- Added proper handling for v0.7 unpacked format
- Added validation to ensure gas limits are present
- Added detailed logging for debugging

**The Issue:**
```json
// Viem was sending BOTH formats (Pimlico rejects this):
{
  "paymaster": "0x777...",              // ✅ v0.7 unpacked
  "paymasterData": "0x01000...",        // ✅ v0.7 unpacked
  "paymasterAndData": "0x",             // ❌ v0.6 packed (causes error!)
  "paymasterVerificationGasLimit": "0x8a8e",  // ✅ v0.7 unpacked
  "paymasterPostOpGasLimit": "0x1"     // ✅ v0.7 unpacked
}
```

**The Fix:**
```typescript
// Remove paymasterAndData when unpacked fields exist
if ('paymasterAndData' in userOp) {
  const { paymasterAndData: _, ...userOpClean } = userOp
  jsonRpcRequest.params[0] = userOpClean
}
```

## How It Works Now

1. **User initiates payment** → ZeroDev Kernel client prepares UserOperation
2. **getPaymasterData is called** → Requests sponsorship from Pimlico
3. **Pimlico returns v0.7 format** with paymaster address, data, and gas limits
4. **Gas limits are preserved** and included in the UserOperation
5. **UserOperation is sent** to bundler with all required fields
6. **EntryPoint validates paymaster** with proper gas allocation → ✅ Success!

## Testing

To verify the fix is working:

1. Try sending a token payment
2. Check the console logs for:
   ```
   [ZERODEV] ✅ Using v0.7 unpacked format with gas limits
   [PIMLICO BUNDLER PROXY] ✅ Already in v0.7 unpacked format
   [PIMLICO BUNDLER PROXY] 📋 Paymaster fields: { 
     paymasterVerificationGasLimit: <non-zero value>,
     paymasterPostOpGasLimit: <non-zero value>
   }
   ```
3. Transaction should succeed without AA33 error

## Common AA33 Causes (Reference)

If you still encounter AA33 errors after this fix, check:

1. **Paymaster has insufficient funds** - Check Pimlico dashboard balance
2. **Paymaster API key is invalid** - Verify `PIMLICO_API_KEY` in Vercel
3. **Paymaster signature expired** - This can happen if the UserOperation is modified after getting paymaster approval
4. **Network issues** - Ensure stable connection to Pimlico API

## Related Files

- `/lib/contexts/ZeroDevSmartWalletProvider.tsx` - Paymaster client setup
- `/app/api/pimlico/bundler/route.ts` - Bundler proxy with format conversion
- `/app/api/pimlico/paymaster/route.ts` - Paymaster proxy (unchanged)

## References

- [ERC-4337 Error Codes](https://eips.ethereum.org/EIPS/eip-4337#entrypoint-definition)
- [Pimlico EntryPoint v0.7 Documentation](https://docs.pimlico.io/references/entrypoint/v07)
- [ZeroDev Kernel Documentation](https://docs.zerodev.app/)

