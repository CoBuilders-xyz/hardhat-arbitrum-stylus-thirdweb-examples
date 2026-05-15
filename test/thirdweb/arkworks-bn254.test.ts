import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

const CONTRACT = 'arkworks-bn254';

describe('thirdweb / arkworks-bn254', async function () {
  const { stylusViem } = await network.connect();

  const contract = await stylusViem.deployContract(CONTRACT);

  it('deploys the precompile helper contract', async function () {
    assert.ok(contract.address);
  });

  it('rejects pairing input with invalid length', async function () {
    await assert.rejects(
      () => contract.read.pairing(['0x00']),
      /revert|Invalid/i,
    );
  });
});
