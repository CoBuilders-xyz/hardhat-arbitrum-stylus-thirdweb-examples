import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { network } from 'hardhat';
import {
  NATIVE_TOKEN_ADDRESS,
  SALE_RECIPIENT,
  type DeployedModule,
  assertInitialSaleConfig,
  expectedInstallBytes,
  readModuleConfig,
} from './helpers.js';

const ERC721_INTERFACE_ID = '0x80ac58cd';

describe('thirdweb / stylus-mintable-erc721', async function () {
  const { stylusViem } = await network.connect();
  const publicClient = await stylusViem.getPublicClient();
  const [wallet] = await stylusViem.getWalletClients();

  let module: DeployedModule;

  before(async function () {
    module = (await stylusViem.deployContract(
      'stylus-mintable-erc721',
    )) as DeployedModule;
    assert.ok(module.address);
  });

  it('starts with zero sale recipient', async function () {
    await assertInitialSaleConfig(module);
  });

  it('returns ERC-721 module metadata', async function () {
    const config = await readModuleConfig(
      publicClient,
      module.address,
      ERC721_INTERFACE_ID,
    );

    const beforeMintSelector = config.callbackFunctions[0]?.selector;
    assert.ok(beforeMintSelector);
    assert.equal(beforeMintSelector.length, 10);
  });

  it('exposes uninstall encoding and minter role checks', async function () {
    assert.equal(await module.read.encodeBytesOnUninstall(), '0x');
    assert.equal(
      await module.read.hasMinterRole([wallet.account.address]),
      false,
    );
  });

  it('manages sale config via setSaleConfig', async function () {
    await module.write.setSaleConfig([SALE_RECIPIENT]);
    assert.equal(
      (await module.read.getSaleConfig()).toLowerCase(),
      SALE_RECIPIENT.toLowerCase(),
    );
  });

  it('accepts zero-price native distributeMintPrice when sale recipient is set', async function () {
    await module.write.distributeMintPrice(
      [wallet.account.address, NATIVE_TOKEN_ADDRESS, 0n],
      { value: 0n },
    );
  });

  it('rejects distributeMintPrice with native value when price is zero', async function () {
    await assert.rejects(
      () =>
        module.write.distributeMintPrice(
          [wallet.account.address, NATIVE_TOKEN_ADDRESS, 0n],
          { value: 1n },
        ),
      /Incorrect native token|revert/i,
    );
  });

  it('encodes install bytes and applies them in onInstall', async function () {
    const otherRecipient =
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const;

    const installData = await module.read.encodeBytesOnInstall([
      otherRecipient,
    ]);
    assert.equal(installData, expectedInstallBytes(otherRecipient));

    await module.write.onInstall([installData]);
    assert.equal(
      (await module.read.getSaleConfig()).toLowerCase(),
      otherRecipient.toLowerCase(),
    );
  });

  it('allows onUninstall with empty calldata', async function () {
    await module.write.onUninstall(['0x']);
  });

  it('rejects beforeMintERC721 when caller lacks minter role', async function () {
    await assert.rejects(
      () =>
        module.write.beforeMintERC721([wallet.account.address, 0n, 1n, '0x']),
      /Not authorized|revert/i,
    );
  });
});
