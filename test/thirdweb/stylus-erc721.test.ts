import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

const CONTRACT = 'stylus-erc721';

describe('thirdweb / stylus-erc721-template', async function () {
  const { stylusViem } = await network.create();
  const [wallet] = await stylusViem.getWalletClients();

  const contract = await stylusViem.deployContract(CONTRACT, [
    wallet.account.address,
  ]);

  it('deploys with owner constructor arg', async function () {
    assert.ok(contract.address);
  });

  it('mints an NFT', async function () {
    await contract.write.mint([wallet.account.address]);
  });

  it('tracks total supply', async function () {
    assert.equal(await contract.read.totalSupply(), 1n);
  });
});
