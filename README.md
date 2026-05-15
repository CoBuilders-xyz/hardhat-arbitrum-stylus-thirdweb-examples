# hardhat-arbitrum-stylus-tests

Integration testbed for [@cobuilders/hardhat-arbitrum-stylus](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus) on **Hardhat 3**. We vendor real-world Stylus projects (grouped by provider under `contracts/`) and exercise compile, deploy, and on-chain behavior through `stylusViem`.

## Prerequisites

- Node.js 22+
- [Rust](https://rustup.rs/) with `wasm32-unknown-unknown` (matching each contract's `rust-toolchain.toml`, currently **1.88.0**)
- [`cargo-stylus`](https://github.com/OffchainLabs/cargo-stylus) on your PATH
- Docker (only for the ephemeral Arbitrum node during tests — compile/deploy use the **host** toolchain)

## Layout

```
contracts/thirdweb/     # Vendored thirdweb-example Stylus repos
test/thirdweb/          # node:test suites (one deploy per suite, shared instance)
test/thirdweb/helpers.ts
```

## Workflow

Each thirdweb suite:

1. Spins up a temporary Arbitrum nitro node (`network.connect()`).
2. **Deploys once** in `before()` via `stylusViem.deployContract` (host toolchain, no deploy container).
3. Runs read/write tests against that deployment.

Compile and manual deploy also default to `--host` in `hardhat.config.ts` (`stylus.compile.useHostToolchain` / `stylus.deploy.useHostToolchain`).

## Scripts

| Script                   | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `npm run compile`        | Compile all Stylus contracts (host)            |
| `npm run compile:erc20`  | Compile `stylus-mintable-erc20` only           |
| `npm run compile:erc721` | Compile `stylus-mintable-erc721` only          |
| `npm run deploy:erc20`   | Deploy ERC-20 module to ephemeral node (host)  |
| `npm run deploy:erc721`  | Deploy ERC-721 module to ephemeral node (host) |
| `npm run test`           | Run all tests                                  |
| `npm run test:thirdweb`  | Run all thirdweb integration suites            |
| `npm run test:erc20`     | ERC-20 module suite only                       |
| `npm run test:erc721`    | ERC-721 module suite only                      |

## Examples

```shell
# First time (or after pulling new contracts)
npm run compile:erc20
npm run test:erc20

# Manual deploy smoke check
npm run deploy:erc721
```

## Vendored contracts

See [contracts/thirdweb/README.md](./contracts/thirdweb/README.md) for the list of thirdweb-example sources and upstream links.

## Notes

- `getModuleConfig()` returns nested structs; the exported artifact ABI is incomplete for viem, so tests decode it via an explicit tuple ABI in `test/thirdweb/helpers.ts`.
- Test runtime is dominated by a single Stylus deploy per file (~1–2 min with host toolchain vs ~10 min when redeploying per test with Docker).
