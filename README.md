# hardhat-arbitrum-stylus-thirdweb-examples

Integration tests for [thirdweb-example](https://github.com/thirdweb-example) Stylus contracts, powered by [`@cobuilders/hardhat-arbitrum-stylus`](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus).

Vendored sources live under `contracts/thirdweb/` (unchanged upstream). Tests deploy on a local Arbitrum Nitro node via `stylusViem` and exercise real contract calls.

## Prerequisites

- Node.js 22+
- Rust + `wasm32-unknown-unknown` (see each contract `rust-toolchain.toml`)
- `cargo-stylus` on PATH
- Docker (ephemeral nitro node during compile/test)

## CI

GitHub Actions runs `npm run test:all` on every push and pull request to `main` (Node 22, Rust 1.88/1.87, `cargo-stylus`, Docker for the nitro node).

## Quick start

```shell
npm install
npm run compile:erc20
npm run test:erc20
```

Run every suite (sequential — one nitro node at a time):

```shell
npm run test:all
```

## Examples

| Contract                      | Upstream-style path                              |
| ----------------------------- | ------------------------------------------------ |
| `stylus-mintable-erc20`       | Mintable ERC-20 module                           |
| `stylus-mintable-erc721`      | Mintable ERC-721 module                          |
| `stylus-mintable-erc1155`     | Mintable ERC-1155 module                         |
| `stylus-transferable-erc20`   | Transferable ERC-20                              |
| `stylus-transferable-erc721`  | Transferable ERC-721                             |
| `stylus-transferable-erc1155` | Transferable ERC-1155                            |
| `stylus-erc20`                | ERC-20 template                                  |
| `stylus-erc721`               | ERC-721 template                                 |
| `stylus-erc1155`              | ERC-1155 template                                |
| `stylus-airdrop-erc20`        | ERC-20 airdrop (`stylus-airdrop-erc20-template`) |
| `arkworks-bn254`              | BN254 precompile helper                          |
| `stylus-zk-erc20`             | ZK mint ERC-20                                   |
| `stylus-zk-erc721`            | ZK mint ERC-721                                  |

`stylus-airdrop-erc1155-template` is vendored under `contracts/thirdweb/` but has no Hardhat test yet (activation issues on nitro).

## Scripts

| Script                                 | Description                                  |
| -------------------------------------- | -------------------------------------------- |
| `npm run compile`                      | Compile all thirdweb Stylus contracts (host) |
| `npm run compile:erc20`                | Compile `stylus-mintable-erc20`              |
| `npm run compile:erc721`               | Compile `stylus-mintable-erc721`             |
| `npm run compile:erc1155`              | Compile `stylus-mintable-erc1155`            |
| `npm run compile:transferable-erc20`   | Compile `stylus-transferable-erc20`          |
| `npm run compile:transferable-erc721`  | Compile `stylus-transferable-erc721`         |
| `npm run compile:transferable-erc1155` | Compile `stylus-transferable-erc1155`        |
| `npm run compile:stylus-erc20`         | Compile `stylus-erc20`                       |
| `npm run compile:stylus-erc721`        | Compile `stylus-erc721`                      |
| `npm run compile:stylus-erc1155`       | Compile `stylus-erc1155`                     |
| `npm run compile:airdrop-erc20`        | Compile `stylus-airdrop-erc20`               |
| `npm run compile:arkworks-bn254`       | Compile `arkworks-bn254`                     |
| `npm run compile:zk-erc20`             | Compile `stylus-zk-erc20`                    |
| `npm run compile:zk-erc721`            | Compile `stylus-zk-erc721`                   |
| `npm run deploy:erc20`                 | Deploy `stylus-mintable-erc20`               |
| `npm run test` / `npm run test:all`    | All thirdweb suites (sequential)             |
| `npm run test:erc20`                   | Test `stylus-mintable-erc20`                 |
| `npm run test:erc721`                  | Test `stylus-mintable-erc721`                |
| `npm run test:erc1155`                 | Test `stylus-mintable-erc1155`               |
| `npm run test:transferable-erc20`      | Test `stylus-transferable-erc20`             |
| `npm run test:transferable-erc721`     | Test `stylus-transferable-erc721`            |
| `npm run test:transferable-erc1155`    | Test `stylus-transferable-erc1155`           |
| `npm run test:stylus-erc20`            | Test `stylus-erc20`                          |
| `npm run test:stylus-erc721`           | Test `stylus-erc721`                         |
| `npm run test:stylus-erc1155`          | Test `stylus-erc1155`                        |
| `npm run test:airdrop-erc20`           | Test `stylus-airdrop-erc20`                  |
| `npm run test:arkworks-bn254`          | Test `arkworks-bn254`                        |
| `npm run test:zk-erc20`                | Test `stylus-zk-erc20`                       |
| `npm run test:zk-erc721`               | Test `stylus-zk-erc721`                      |

See `package.json` for the full deploy script list.

## Layout

```
contracts/thirdweb/   # vendored thirdweb-example repos
test/thirdweb/        # Hardhat integration tests
hardhat.config.ts     # @cobuilders/hardhat-arbitrum-stylus + host toolchain
```
