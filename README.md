# hardhat-arbitrum-stylus-tests

## Prerequisites

- Node.js 22+
- Rust + `wasm32-unknown-unknown` (see each contract `rust-toolchain.toml`)
- `cargo-stylus` on PATH
- Docker (ephemeral nitro node during tests)

## Scripts

| Script                                 | Description                           |
| -------------------------------------- | ------------------------------------- |
| `npm run compile`                      | Compile all Stylus contracts (host)   |
| `npm run compile:erc20`                | Compile `stylus-mintable-erc20`       |
| `npm run compile:erc721`               | Compile `stylus-mintable-erc721`      |
| `npm run compile:erc1155`              | Compile `stylus-mintable-erc1155`     |
| `npm run compile:transferable-erc20`   | Compile `stylus-transferable-erc20`   |
| `npm run compile:transferable-erc721`  | Compile `stylus-transferable-erc721`  |
| `npm run compile:transferable-erc1155` | Compile `stylus-transferable-erc1155` |
| `npm run compile:stylus-erc20`         | Compile `stylus-erc20` template       |
| `npm run compile:stylus-erc721`        | Compile `stylus-erc721` template      |
| `npm run compile:stylus-erc1155`       | Compile `stylus-erc1155` template     |
| `npm run compile:airdrop-erc20`        | Compile `stylus-airdrop-erc20`        |
| `npm run compile:arkworks-bn254`       | Compile `arkworks-bn254`              |
| `npm run compile:zk-erc20`             | Compile `stylus-zk-erc20`             |
| `npm run compile:zk-erc721`            | Compile `stylus-zk-erc721`            |
| `npm run deploy:erc20`                 | Deploy `stylus-mintable-erc20`        |
| `npm run deploy:erc721`                | Deploy `stylus-mintable-erc721`       |
| `npm run deploy:erc1155`               | Deploy `stylus-mintable-erc1155`      |
| `npm run deploy:transferable-erc20`    | Deploy `stylus-transferable-erc20`    |
| `npm run deploy:transferable-erc721`   | Deploy `stylus-transferable-erc721`   |
| `npm run deploy:transferable-erc1155`  | Deploy `stylus-transferable-erc1155`  |
| `npm run deploy:stylus-erc20`          | Deploy `stylus-erc20`                 |
| `npm run deploy:stylus-erc721`         | Deploy `stylus-erc721`                |
| `npm run deploy:stylus-erc1155`        | Deploy `stylus-erc1155`               |
| `npm run deploy:airdrop-erc20`         | Deploy `stylus-airdrop-erc20`         |
| `npm run deploy:arkworks-bn254`        | Deploy `arkworks-bn254`               |
| `npm run deploy:zk-erc20`              | Deploy `stylus-zk-erc20`              |
| `npm run deploy:zk-erc721`             | Deploy `stylus-zk-erc721`             |
| `npm run test`                         | Run all Hardhat tests                 |
| `npm run test:thirdweb`                | Run all thirdweb suites (sequential)  |
| `npm run test:erc20`                   | Test `stylus-mintable-erc20`          |
| `npm run test:erc721`                  | Test `stylus-mintable-erc721`         |
| `npm run test:erc1155`                 | Test `stylus-mintable-erc1155`        |
| `npm run test:transferable-erc20`      | Test `stylus-transferable-erc20`      |
| `npm run test:transferable-erc721`     | Test `stylus-transferable-erc721`     |
| `npm run test:transferable-erc1155`    | Test `stylus-transferable-erc1155`    |
| `npm run test:stylus-erc20`            | Test `stylus-erc20` template          |
| `npm run test:stylus-erc721`           | Test `stylus-erc721` template         |
| `npm run test:stylus-erc1155`          | Test `stylus-erc1155` template        |
| `npm run test:airdrop-erc20`           | Test `stylus-airdrop-erc20`           |
| `npm run test:arkworks-bn254`          | Test `arkworks-bn254`                 |
| `npm run test:zk-erc20`                | Test `stylus-zk-erc20`                |
| `npm run test:zk-erc721`               | Test `stylus-zk-erc721`               |

## Example

```shell
npm run compile:erc20
npm run test:erc20
```
