import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

const CONTRACT = 'stylus-erc20';

describe('thirdweb / stylus-erc20-template', async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();

  const contract = await stylusViem.deployContract(CONTRACT, [
    wallet.account.address,
  ]);

  it('deploys with owner constructor arg', async function () {
    assert.ok(contract.address);
  });

  it('mints via mintTo', async function () {
    await contract.write.mintTo([wallet.account.address, 1_000n]);
  });

  it('burns from caller balance', async function () {
    await contract.write.burn([100n]);
  });
});
