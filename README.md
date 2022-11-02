# Borrow and Repay on the Aave-V2 DeFi protocol

<sub>Disclaimer: This project is being built as a part of the Blockchain, Solidity and Hardhat course by FreeCodeCamp for learning purposes</sub>

## Overview

This repo contains scripts to that allows users to programatically Borrow and Repay assets (Hardcoded for DAI token) on the Aave-V2 DeFi protocol.

## Tech used and Learnings:

1. The `hardhat` development enviroment.
2. Used `hardhat-deploy` plugin which made recurrsive contract deployment much easier.
3. Forken the Ethereum Mainnet (via Alchemy's RPC endpoint) to the local Hardhat network and used respective mainnet contract address.
4. Used the `AggregatorV3Interface` to access ChainLink oracle to fetch real-time price feeds.
5. Connected to the Aave/protocol-V2 lending pool to deposit assets as collateral, and used then Borrow assets based on the borrwing power specified by the protocol.
