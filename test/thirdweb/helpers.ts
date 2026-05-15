import assert from 'node:assert/strict';
import { type Address, encodeAbiParameters, zeroAddress } from 'viem';

/** thirdweb native-token sentinel used by distributeMintPrice */
export const NATIVE_TOKEN_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address;

export const SALE_RECIPIENT =
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Address;

export function expectedInstallBytes(recipient: Address): `0x${string}` {
  return encodeAbiParameters([{ type: 'address' }], [recipient]);
}

export async function assertInitialSaleConfig(contract: {
  read: { getSaleConfig: () => Promise<Address> };
}): Promise<void> {
  assert.equal(await contract.read.getSaleConfig(), zeroAddress);
}

/**
 * Asserts getModuleConfig() decodes correctly.
 * Uses the same ABI path as deploy: artifact from `arb:compile`, or
 * `cargo stylus export-abi` fallback inside stylusViem.deployContract.
 */
export async function assertModuleInterface(
  contract: {
    read: {
      getModuleConfig: () => Promise<{
        registerInstallationCallback: boolean;
        requiredInterfaces: readonly `0x${string}`[];
        supportedInterfaces: readonly `0x${string}`[];
        callbackFunctions: readonly { selector: `0x${string}` }[];
        fallbackFunctions: readonly {
          selector: `0x${string}`;
          permissionBits: bigint;
        }[];
      }>;
    };
  },
  requiredInterfaceId: `0x${string}`,
  options?: { registerInstallationCallback?: boolean },
): Promise<void> {
  const config = await contract.read.getModuleConfig();

  assert.equal(
    config.registerInstallationCallback,
    options?.registerInstallationCallback ?? true,
  );
  assert.ok(
    config.requiredInterfaces.some(
      (iface) => iface.toLowerCase() === requiredInterfaceId.toLowerCase(),
    ),
  );
  assert.equal(config.supportedInterfaces.length, 0);
  assert.ok(config.callbackFunctions.length >= 1);
  assert.ok(config.fallbackFunctions.length >= 2);
}
