import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import {
  NATIVE_TOKEN_ADDRESS,
  SALE_RECIPIENT,
  assertInitialSaleConfig,
  assertModuleInterface,
  expectedInstallBytes,
} from './helpers.js';

const ERC20_INTERFACE_ID = '0x36372b07';
const CONTRACT = 'stylus-mintable-erc20';

describe('thirdweb / stylus-mintable-erc20', async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();
  const [wallet] = await stylusViem.getWalletClients();

  const contract = await stylusViem.deployContract(CONTRACT);

  it('deploys the Stylus module', async function () {
    assert.ok(contract.address);
  });

  it('starts with zero sale recipient', async function () {
    await assertInitialSaleConfig(contract);
  });

  it('returns ERC-20 module metadata from artifact ABI', async function () {
    await assertModuleInterface(publicClient, contract, ERC20_INTERFACE_ID);
  });

  it('exposes uninstall encoding and minter role checks', async function () {
    assert.equal(await contract.read.encodeBytesOnUninstall(), '0x');
    assert.equal(
      await contract.read.hasMinterRole([wallet.account.address]),
      false,
    );
    assert.equal(await contract.read.hasMinterRole([SALE_RECIPIENT]), false);
  });

  it('manages sale config via setSaleConfig', async function () {
    await contract.write.setSaleConfig([SALE_RECIPIENT]);
    assert.equal(
      (await contract.read.getSaleConfig()).toLowerCase(),
      SALE_RECIPIENT.toLowerCase(),
    );
  });

  it('accepts zero-price native distributeMintPrice when sale recipient is set', async function () {
    await contract.write.distributeMintPrice(
      [wallet.account.address, NATIVE_TOKEN_ADDRESS, 0n],
      { value: 0n },
    );
  });

  it('rejects distributeMintPrice with native value when price is zero', async function () {
    await assert.rejects(
      () =>
        contract.write.distributeMintPrice(
          [wallet.account.address, NATIVE_TOKEN_ADDRESS, 0n],
          { value: 1n },
        ),
      /Incorrect native token|revert/i,
    );
  });

  it('encodes install bytes and applies them in onInstall', async function () {
    const otherRecipient =
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const;

    const installData = await contract.read.encodeBytesOnInstall([
      otherRecipient,
    ]);
    assert.equal(installData, expectedInstallBytes(otherRecipient));

    await contract.write.onInstall([installData]);
    assert.equal(
      (await contract.read.getSaleConfig()).toLowerCase(),
      otherRecipient.toLowerCase(),
    );
  });

  it('allows onUninstall with empty calldata', async function () {
    await contract.write.onUninstall(['0x']);
  });

  it('rejects beforeMintERC20 when caller lacks minter role', async function () {
    await assert.rejects(
      () => contract.write.beforeMintERC20([wallet.account.address, 1n, '0x']),
      /Not authorized|revert/i,
    );
  });
});
