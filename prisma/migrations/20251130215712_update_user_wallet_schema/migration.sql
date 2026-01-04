-- AlterTable: Update users table to use eoaAddress and smartWalletAddress
-- Step 1: Add new columns
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "eoaAddress" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "smartWalletAddress" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "registrationCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Migrate data from walletAddress to eoaAddress
UPDATE "users" SET "eoaAddress" = "walletAddress" WHERE "walletAddress" IS NOT NULL;

-- Step 3: Set registrationCompleted to true for users who have profiles
UPDATE "users" 
SET "registrationCompleted" = true 
WHERE EXISTS (
  SELECT 1 FROM "profiles" WHERE "profiles"."userId" = "users"."id"
);

-- Step 4: Drop the old unique constraint on walletAddress
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_walletAddress_key";

-- Step 5: Make eoaAddress NOT NULL and add unique constraint
ALTER TABLE "users" ALTER COLUMN "eoaAddress" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_eoaAddress_key" UNIQUE ("eoaAddress");

-- Step 6: Add unique constraint on smartWalletAddress (nullable)
ALTER TABLE "users" ADD CONSTRAINT "users_smartWalletAddress_key" UNIQUE ("smartWalletAddress");

-- Step 7: Drop the old walletAddress column
ALTER TABLE "users" DROP COLUMN IF EXISTS "walletAddress";













