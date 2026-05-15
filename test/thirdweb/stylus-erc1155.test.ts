import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

const CONTRACT = 'stylus-erc1155';

describe('thirdweb / stylus-erc1155-template', async function () {
  const { stylusViem } = await network.connect();
  const [wallet] = await stylusViem.getWalletClients();

  const contract = await stylusViem.deployContract(CONTRACT, [
    wallet.account.address,
  ]);

  it('deploys with owner constructor arg', async function () {
    assert.ok(contract.address);
  });

  it('mints a token id', async function () {
    await contract.write.mint([wallet.account.address, 1n, 10n]);
    assert.equal(await contract.read.totalSupply([1n]), 10n);
  });
});
