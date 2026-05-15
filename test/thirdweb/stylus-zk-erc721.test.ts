import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

const CONTRACT = 'stylus-zk-erc721';

describe('thirdweb / stylus-zk-erc721', async function () {
  const { stylusViem } = await network.connect();
  const [wallet] = await stylusViem.getWalletClients();

  const contract = await stylusViem.deployContract(CONTRACT, [
    wallet.account.address,
  ]);

  it('deploys with owner constructor', async function () {
    assert.ok(contract.address);
  });
});
