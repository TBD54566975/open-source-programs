# TBD Collaboration Repository

This repository is the welcoming point to TBD's open source efforts. It outlines 
the tbDEX Protocol and the components which comprise it. 

This repository is not a source forge, but a sync point for TBD projects. It's
used for documentation, issues, and discussions that span our individual repositories.

## Current Status

All projects in the TBD family are in early prototyping. New contributors should 
expect a pace of development consistent with nascent technology: larger commits, 
frequent refactoring, changing APIs, and incomplete feature-sets. We believe: _open source
is not a publishing medium_. These projects are open from the start to welcome your
interest, invite discussion, identify early issues, and advise on design. An early
adopter mindset will work well until these projects mature further.

The Discussion forums and Issue trackers are likely the best way to get involved now. Our
project leads may be able to guide your efforts and incorporate your feedback in ways that
will be most meaningful to you and the project's goals.

In particular, we want to ensure the New Contributor Experience is as smooth as possible.
You should be able to:

* Understand each project's goals and scope
* Install prerequisite dependencies
* Clone and build the project
* Run the tests
* Join the conversation in Discussions and Issues

## Systems

The tbDEX Protocol is the center of our work. It allows users to transact
with financial institutions - without a central authority. Users can 
exchange fiat and crypto with providers who plug into the system. 

[Decentralized Web Node](https://identity.foundation/decentralized-web-node/spec/) is 
the architecture which makes this possible. It provides
the complex transport and identity systems necessary for parties to transact with one
another. We are developing a TypeScript- and JavaScript-based reference 
implementation in the `dwn-sdk-js` repository.

Together, these systems open up a world of possibility for currency and information
exchange. And they return ownership of data where we believe it belongs:
with the user.

### tbDEX

The `tbDEX` Protocol was first described in a [whitepaper](https://tbdex.io/whitepaper.pdf)
in November 2021. From its abstract:

> tbDEX is a protocol for discovering liquidity and exchanging assets (such as bitcoin, fiat money, or real world goods) when the existence of social trust is an intractable element of managing transaction risk. The tbDEX protocol facilitates decentralized networks of exchange between assets by providing a framework for establishing social trust, utilizing decentralized identity (DID) and verifiable credentials (VCs) to establish the provenance of identity in the real world. The protocol has no opinion on anonymity as a feature or consequence of transactions. Instead, it allows willing counterparties to negotiate and establish the minimum information acceptable for the exchange. Moreover, it provides the infrastructure necessary to create a ubiquity of on-ramps and off-ramps directly between the fiat and crypto financial systems without the need for centralized intermediaries and trust brokers. This makes crypto assets and decentralized financial services more accessible to everyone.

The source for the `tbDEX` whitepaper is [here](https://github.com/TBD54566975/tbdex-whitepaper).

The [`tbdex-protocol` repository](https://github.com/TBD54566975/tbdex-protocol) is where
this work is housed. It describes the message formats/schemas used to transact. And it also
contains a preliminary mock implementation a PFI (Primary Financial Institution) may 
implement when it plugs into the system.

Looking forward, the work done here may be split into separate repositories. For now it's 
faster to couple the message formats, libraries, and mock implementation together until
the APIs harden.

## Contribution

The [contribution guide](./CONTRIBUTING.md) welcomes contributors with resources to get involved.

## Projects

| Project                                                           | Language   | Description                                                                                                                               |
|:------------------------------------------------------------------|:-----------|:------------------------------------------------------------------------------------------------------------------------------------------|
| [`ssi-sdk`](https://github.com/TBD54566975/ssi-sdk)               | Go         | Standards-based primitives for using Decentralized Identifiers and Verifiable Credentials.                                                |
| [`ssi-service`](https://github.com/TBD54566975/ssi-service)       | Go         | An in-a-box service that handles the full Verifiable Credentials lifecycle, including issuance, verification, revocation, and more.       |
| [`dwn-sdk-js`](https://github.com/TBD54566975/dwn-sdk-js)         | TypeScript | An implementation of the DIF's emerging decentralized personal datastore standard.                                                        |
| [`tbdex-protocol`](https://github.com/TBD54566975/tbdex-protocol) | Java       | A playground as we iterate our way to a robust protocol. Mostly composed of tbDEX message schemas/formats and a mock PFI implemementaion. |

## Project Resources

| Resource                                   | Description                                                                   |
|--------------------------------------------|-------------------------------------------------------------------------------|
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                  |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues    |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                            |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                   |
