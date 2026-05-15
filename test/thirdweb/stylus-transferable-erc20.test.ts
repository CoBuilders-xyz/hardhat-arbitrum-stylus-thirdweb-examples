import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { assertModuleInterface } from './helpers.js';

const ERC20_INTERFACE_ID = '0x36372b07';
const CONTRACT = 'stylus-transferable-erc20';

describe('thirdweb / stylus-transferable-erc20', async function () {
  const { stylusViem } = await network.connect();
  const [wallet] = await stylusViem.getWalletClients();
  const other = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const;

  const contract = await stylusViem.deployContract(CONTRACT);

  it('deploys the Stylus module', async function () {
    assert.ok(contract.address);
  });

  it('returns ERC-20 transferable module metadata', async function () {
    await assertModuleInterface(contract, ERC20_INTERFACE_ID, {
      registerInstallationCallback: false,
    });
  });

  it('starts with transfers disabled', async function () {
    assert.equal(await contract.read.isTransferEnabled(), false);
    assert.equal(
      await contract.read.isTransferEnabledFor([wallet.account.address]),
      false,
    );
  });

  it('enables global transfers via setTransferable', async function () {
    await contract.write.setTransferable([true]);
    assert.equal(await contract.read.isTransferEnabled(), true);
  });

  it('allows beforeTransferERC20 when transfers are enabled', async function () {
    await contract.write.beforeTransferERC20([
      wallet.account.address,
      other,
      1n,
    ]);
  });

  it('rejects beforeTransferERC20 when transfers are disabled', async function () {
    await contract.write.setTransferable([false]);
    await assert.rejects(
      () =>
        contract.write.beforeTransferERC20([wallet.account.address, other, 1n]),
      /revert/i,
    );
  });
});
