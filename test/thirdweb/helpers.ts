import assert from 'node:assert/strict';
import {
  type Address,
  type PublicClient,
  encodeAbiParameters,
  zeroAddress,
} from 'viem';

/** thirdweb native-token sentinel used by distributeMintPrice */
export const NATIVE_TOKEN_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address;

export const SALE_RECIPIENT =
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Address;

export const getModuleConfigAbi = [
  {
    type: 'function',
    name: 'getModuleConfig',
    stateMutability: 'view',
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
  },
] as const;

export type DeployedModule = {
  address: Address;
  read: {
    getSaleConfig: () => Promise<Address>;
    encodeBytesOnInstall: (args: [Address]) => Promise<`0x${string}`>;
    encodeBytesOnUninstall: () => Promise<`0x${string}`>;
    hasMinterRole: (args: [Address]) => Promise<boolean>;
  };
  write: {
    setSaleConfig: (args: [Address]) => Promise<`0x${string}`>;
    onInstall: (args: [`0x${string}`]) => Promise<`0x${string}`>;
    onUninstall: (args: [`0x${string}`]) => Promise<`0x${string}`>;
    distributeMintPrice: (
      args: [Address, Address, bigint],
      options?: { value?: bigint },
    ) => Promise<`0x${string}`>;
    beforeMintERC20: (
      args: [Address, bigint, `0x${string}`],
    ) => Promise<`0x${string}`>;
    beforeMintERC721: (
      args: [Address, bigint, bigint, `0x${string}`],
    ) => Promise<`0x${string}`>;
  };
};

export function expectedInstallBytes(recipient: Address): `0x${string}` {
  return encodeAbiParameters([{ type: 'address' }], [recipient]);
}

export async function readModuleConfig(
  publicClient: PublicClient,
  moduleAddress: Address,
  requiredInterfaceId: `0x${string}`,
) {
  const config = await publicClient.readContract({
    address: moduleAddress,
    abi: getModuleConfigAbi,
    functionName: 'getModuleConfig',
  });

  assert.equal(config.registerInstallationCallback, true);
  assert.ok(
    config.requiredInterfaces.some(
      (iface) => iface.toLowerCase() === requiredInterfaceId.toLowerCase(),
    ),
  );
  assert.equal(config.supportedInterfaces.length, 0);
  assert.ok(config.callbackFunctions.length >= 1);
  assert.ok(config.fallbackFunctions.length >= 2);

  return config;
}

export async function assertInitialSaleConfig(
  module: DeployedModule,
): Promise<void> {
  assert.equal(await module.read.getSaleConfig(), zeroAddress);
}
