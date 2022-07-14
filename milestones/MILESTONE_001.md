# Milestone 1

| Item             | Value                  |
| ---------------- | ---------------------- |
| Codename         | `Bienvenidos a Miami`  |
| Timebox delivery | Tuesday, 5 April, 2022 |

## Summary

Everyone has to start somewhere. This is our first foray into the public, and we 
want to set precedents of contributor friendliness and usability right from the jump.

That said, there's foundation to lay before we can build incrementally. This
Milestone focuses on building enough throughout the entire system to move 
each piece forward.

The TBD development team will be attending the 
[Bitcoin 2022](https://b.tc/conference/) conference, where we're excited to 
share our vision and software with folks who join our passion for fair
economic systems. To us, that future looks: decentralized, trustless, permissionless, and non-custodial.

In November 2021 we released a 
[whitepaper](https://github.com/TBD54566975/tbdex-whitepaper) 
outlining our approach. In it we introduced the `tbDEX` protocol, 
decentralized identifiers (DIDs), and verifiable credentials (VCs)
as the building blocks of a new network. That network will be open for 
financial institutions and credential issuers to join without barriers. It 
creates new opportunity - for users to transact without intermediaries, and 
to retain ownership of their data and currency.

Milestone 1 is about contributor readiness. It will
prioritize, in order: minimal APIs, documentation, tests, and early implementation
code. In addition, we'll surface our info in the temp TBD site for visitors to:

* Get involved with contribution
* Express interest in joining Block and TBD
* Discover to our library of public Twitter spaces

## Themes

### Contributor Readiness

Open source is core to what we do here. We're building financial infrastructure,
and that requires collaboration with a wide set of users, providers, critics,
and partners. The most important objective of this Milestone is to clearly
communicate our vision and be positioned to accept contribution in all its forms:

* Questions
* Issues
* Discussions
* Feature Requests
* Code
* Documentation

## Team Goals
### Deliverables

Every project will have:

* Customized `README` (per repo and/or per module as appropriate)
* Customized `CODEOWNERS`
* Customized `CONTRIBUTING.md` (per repo and/or per module as appropriate)
* All other static files from the [project template](https://github.com/TBD54566975/tbd-project-template)
* Public visibility
* Testsuite which mocks requests from either the user or other components in the system

The team will collectively have:

* Welcome to new contributors in the `collaboration` repository `README`, introducing all the projects and how they come together to form a system
* Contributed orientation development messaging to the temp TBD Site

## Project Goals

Each project goal contributes to the team goal.

### VC Service
DRI: @decentralgabe  
Repos: [did-sdk](https://github.com/TBD54566975/did-sdk), [vc-service](https://github.com/TBD54566975/vc-service)

#### Goals

Support the following functional use case:

1. Everyone can have a DID-based identity
2. Sign and verify data with DID-based keys
3. Create and use JSON Schemas with Verifiable Credentials
4. Issue, hold, and verify VCs using DIDs and JSON Schemas
5. Apply for credential issuance via Manifest
6. Request and exchange credentials with Presentation Exchange

All this is able to be done via a command line and a simple REST/HTTP based service that uses in-memory or flat-file storage. There is no expectation of privacy or confidentiality of the information generated and exchanged, it is simply for demonstration purposes.

#### Primitives

Standards-based primitives to reach the goals.

- DIDs
    - Using `did:key`
    - Create and generate `did:key` values of a few different types (Ed25519, secp256k1, ECDSA curves)
    - **Bonus:** consider `did:pkh` to connect existing blockchain accounts
- Credentials
    - Create and issue credentials using `did:key`s
    - Schema support
        - LD contexts with the JsonWebSignature2020 suite
        - JSON Schemas with JWS signing
- Schemas
    - Able to build and use JSON Schemas for Verifiable Credential data
- Signing & Verification
    - Support for the JsonWebSignature2020 type for Linked Data credentials
    - Support for JWS packaging for all else
- Presentation Exchange
    - Able to define simple (e.g. a single credential, from a single issuer, of a known schema) presentation requests
    - Able to fulfill those requests with a valid presentation response
- Credential Manifest
    - Able to describe simple manifests for credential issuance
    - Able to accept credentials (self signed are fine) to be issued a credential

#### Non-Goals

- No authentication
- No service reliability guarantees (e.g. zero down time, multi instance, databases)
- No credential revocations
- No robust LD support
- No key rotation
- No assumption of wallet (plain text is fine)

### tbDEX Message Format (Protocol)
DRI: @hdou, @mistermoe  
Repo: [tbdex-protocol](https://github.com/TBD54566975/tbdex-protocol)

* Initially define necessary message schemas. These are: https://github.com/TBD54566975/tbdex-protocol/tree/main/lib#message-types
* Iron out State Machine / Diagram
* Produce a reference implementation specifically for the core state machine

### PFI or Credential Provider Mock Implementation
DRI: @hdou731
Repo: [tbdex-pfi-mockimpl](https://github.com/TBD54566975/tbdex-pfi-mockimpl)

* Move internal documentation [here](https://www.notion.so/tbd54566975/PFI-Implementation-e6fbf35f94814dde964872d95c52179e) to GitHub (looks like a mix of `tbdex-protocol` and `mock-impl`, yes?)
* Implement necessary message processors for a PFI
* Produce single HTTP endpoint which exposes a PFI and accepts tbDEX messages
* Produce a demo facilitating USD → USDC using [Circle’s API](https://developers.circle.com/docs/introducing-circle-apis) to mint USDC

### Identity Hubs
DRI: @mistermoe  
Development: @csuwildcat
Repo: [hub-sdk-js](https://github.com/TBD54566975/hub-sdk-js)

The goal for this period of Hub development is to deliver a working MVP of a Hub. This MVP will include support for the following interfaces, functionality, and features:

* DMZ support for inbox-style drop-off of messages. **Not yet included in spec**
* Full support for permissions / capabilities. [Spec reference](https://identity.foundation/identity-hub/spec/#permissions)
* Full support for threads. [Spec reference](https://identity.foundation/identity-hub/spec/#threads)
* Full support for collections. [Spec reference](https://identity.foundation/identity-hub/spec/#collections)
- Full web-hook support

### Temp Development Site

DRIs: @ALRubinger, @angiej, @miaking  
Repo: [developer-site](https://github.com/TBD54566975/developer-site)

* Stub Home Page with orientation about mission, vision
* Projects page, likely summarizing or linking to the `collaboration` repo
* Careers, with links to current openings and form for candidate intake
* Media, from @angiej