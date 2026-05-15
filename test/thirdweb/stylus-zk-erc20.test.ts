import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

const CONTRACT = 'stylus-zk-erc20';

describe('thirdweb / stylus-zk-erc20', async function () {
  const { stylusViem } = await network.connect();
  const [wallet] = await stylusViem.getWalletClients();

  const contract = await stylusViem.deployContract(CONTRACT, [
    wallet.account.address,
    'ZKToken',
    'ZKT',
    18,
  ]);

  it('deploys with token metadata constructor', async function () {
    assert.ok(contract.address);
  });

  it('reads token metadata', async function () {
    assert.equal(await contract.read.name(), 'ZKToken');
    assert.equal(await contract.read.symbol(), 'ZKT');
    assert.equal(await contract.read.decimals(), 18);
  });
});
