import assert from 'node:assert/strict';
import { type Address, encodeAbiParameters, zeroAddress } from 'viem';
import { readContract } from 'viem/actions';

/** thirdweb native-token sentinel used by distributeMintPrice */
export const NATIVE_TOKEN_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address;

export const SALE_RECIPIENT =
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Address;

/** viem needs tuple components; export-abi often leaves `ModuleConfig` unexpanded */
const GET_MODULE_CONFIG_ABI = [
  {
    type: 'function',
    name: 'getModuleConfig',
    inputs: [],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'registerInstallationCallback', type: 'bool' },
          { name: 'requiredInterfaces', type: 'bytes4[]' },
          { name: 'supportedInterfaces', type: 'bytes4[]' },
          {
            name: 'callbackFunctions',
            type: 'tuple[]',
            components: [{ name: 'selector', type: 'bytes4' }],
          },
          {
            name: 'fallbackFunctions',
            type: 'tuple[]',
            components: [
              { name: 'selector', type: 'bytes4' },
              { name: 'permissionBits', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const;

export function expectedInstallBytes(recipient: Address): `0x${string}` {
  return encodeAbiParameters([{ type: 'address' }], [recipient]);
}

export async function assertInitialSaleConfig(contract: {
  read: { getSaleConfig: () => Promise<Address> };
}): Promise<void> {
  assert.equal(await contract.read.getSaleConfig(), zeroAddress);
}

export async function assertModuleInterface(
  publicClient: Parameters<typeof readContract>[0],
  contract: { address: Address },
  requiredInterfaceId: `0x${string}`,
  options?: { registerInstallationCallback?: boolean },
): Promise<void> {
  const config = await readContract(publicClient, {
    address: contract.address,
    abi: GET_MODULE_CONFIG_ABI,
    functionName: 'getModuleConfig',
  });

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
