import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { assertModuleInterface } from './helpers.js';

const ERC1155_INTERFACE_ID = '0xd9b67a26';
const CONTRACT = 'stylus-transferable-erc1155';

describe('thirdweb / stylus-transferable-erc1155', async function () {
  const { stylusViem } = await network.connect();
  const [wallet] = await stylusViem.getWalletClients();
  const other = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const;

  const contract = await stylusViem.deployContract(CONTRACT);

  it('deploys the Stylus module', async function () {
    assert.ok(contract.address);
  });

  it('returns ERC-1155 transferable module metadata', async function () {
    await assertModuleInterface(contract, ERC1155_INTERFACE_ID, {
      registerInstallationCallback: false,
    });
  });

  it('enables transfers and allows beforeTransferERC1155', async function () {
    await contract.write.setTransferable([true]);
    await contract.write.beforeTransferERC1155([
      wallet.account.address,
      other,
      0n,
      1n,
    ]);
  });
});
