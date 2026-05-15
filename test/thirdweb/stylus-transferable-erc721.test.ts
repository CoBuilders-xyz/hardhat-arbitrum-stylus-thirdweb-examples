import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { assertModuleInterface } from './helpers.js';

const ERC721_INTERFACE_ID = '0x80ac58cd';
const CONTRACT = 'stylus-transferable-erc721';

describe('thirdweb / stylus-transferable-erc721', async function () {
  const { stylusViem } = await network.create();
  const publicClient = await stylusViem.getPublicClient();
  const [wallet] = await stylusViem.getWalletClients();
  const other = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const;

  const contract = await stylusViem.deployContract(CONTRACT);

  it('deploys the Stylus module', async function () {
    assert.ok(contract.address);
  });

  it('returns ERC-721 transferable module metadata', async function () {
    await assertModuleInterface(publicClient, contract, ERC721_INTERFACE_ID, {
      registerInstallationCallback: false,
    });
  });

  it('starts with transfers disabled', async function () {
    assert.equal(await contract.read.isTransferEnabled(), false);
  });

  it('enables transfers and allows beforeTransferERC721', async function () {
    await contract.write.setTransferable([true]);
    await contract.write.beforeTransferERC721([
      wallet.account.address,
      other,
      0n,
    ]);
  });
});
