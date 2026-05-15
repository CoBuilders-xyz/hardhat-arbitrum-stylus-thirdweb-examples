import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { keccak256, toBytes } from 'viem';
import { network } from 'hardhat';

const CONTRACT = 'stylus-airdrop-erc20';

describe('thirdweb / stylus-airdrop-erc20-template', async function () {
  const { stylusViem } = await network.connect();
  const [wallet] = await stylusViem.getWalletClients();

  const contract = await stylusViem.deployContract(CONTRACT, [
    wallet.account.address,
  ]);

  it('deploys with owner constructor arg', async function () {
    assert.ok(contract.address);
    assert.equal(
      (await contract.read.ownerAddr()).toLowerCase(),
      wallet.account.address.toLowerCase(),
    );
  });

  it('sets merkle root for a token', async function () {
    const token = '0x0000000000000000000000000000000000000001';
    const root = keccak256(toBytes('test-root'));
    await contract.write.setMerkleRoot([token, root, false]);
  });
});
