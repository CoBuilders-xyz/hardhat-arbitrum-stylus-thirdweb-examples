import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import hardhatArbitrumStylusPlugin from '@cobuilders/hardhat-arbitrum-stylus';
import { configVariable, defineConfig } from 'hardhat/config';

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, hardhatArbitrumStylusPlugin],
  paths: {
    tests: {
      nodejs: 'test',
    },
  },
  solidity: {
    profiles: {
      default: {
        version: '0.8.28',
      },
      production: {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  // @cobuilders/hardhat-arbitrum-stylus — host toolchain for thirdweb examples
  stylus: {
    node: {
      image: 'offchainlabs/nitro-node',
      tag: 'v3.7.1-926f1ab',
      httpPort: 8547,
      wsPort: 8548,
      chainId: 412346,
    },
    compile: {
      useHostToolchain: true,
    },
    deploy: {
      useHostToolchain: true,
    },
  },
  networks: {
    arbitrumLocal: {
      url: 'http://localhost:8547',
      type: 'http',
      accounts: [
        '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659',
      ],
    },
    hardhatMainnet: {
      type: 'edr-simulated',
      chainType: 'l1',
    },
    hardhatOp: {
      type: 'edr-simulated',
      chainType: 'op',
    },
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('SEPOLIA_PRIVATE_KEY')],
    },
  },
});
