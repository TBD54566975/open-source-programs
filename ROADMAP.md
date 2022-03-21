# TBD Development Roadmap

Welcome to the TBD Development Roadmap. Here we describe the high-level focus of
our efforts, chunked into timeboxed deliverables as Milestones. This appraoch 
lets teams opererate with autonomy, while ensuring that everyone moves in the 
same direction.

Milestones are encoded as a set of goals, defined by the 
[SMART](https://en.wikipedia.org/wiki/SMART_criteria) model. Goals are:

* Specific
* Measurable
* Achievable
* Relevant
* Time-bound

Specificity is fluid. Because we are time-boxed, we make delivery estimates on 
a best-case scenario and adapt as the milestone progresses. Work may have delays
due to any number of factors, and we employ a blameless culture when goals 
must be rescoped. When we find our estimates are off, we simply communicate 
our position to the team via Discussions where we can collectively assess impact
and adapt as necessary.

Relevance may also be fluid, leaving room to adapt our work to the changing 
needs of the community. We reduce disruption here by releasing Milestones at 
frequent, predicable intervals (typically 6-8 weeks).

Milestones will have minimum requirements, and in these cases we prioritize
work around themes. Missing a theme indicates a loss of focus and can hold up
others, so we take care to communicate our objectives here and stay true to them
during development.

Let's go.

## Current: Milestone 1

| Item             | Value                  |
| ---------------- | ---------------------- |
| Codename         | `Bienvenidos a Miami`  |
| Timebox delivery | Tuesday, 5 April, 2022 |

### Summary

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
code. In addition, we'll deliver an initial Developer site for visitors to:

* Get involved with contribution
* Express interest in joining Block and TBD
* Discover to our library of public Twitter spaces

### Themes

#### Contributor Readiness

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

### Team Goals
#### Deliverables

Every project will have:

* Customized `README`
* Customized `CODEOWNERS`
* Customized `CONTRIBUTING.md`
* All other static files from the [project template](https://github.com/TBD54566975/tbd-project-template)
* Public visibility
* Testsuite which mocks requests from either the user or other components in the system

The team will collectively have:

* Welcome to new contributors in the `collaboration` repository `README`, introducing all the projects and how they come together to form a system
* Development Site

### Project Goals

Each project goal contributes to the team goal.

#### VC Service
DRI: @decentralgabe  
Repos: [did-sdk](https://github.com/TBD54566975/did-sdk), [vc-service](https://github.com/TBD54566975/vc-service)

##### Goals

Support the following functional use case:

1. Everyone can have a DID-based identity
2. Sign and verify data with DID-based keys
3. Create and use JSON Schemas with Verifiable Credentials
4. Issue, hold, and verify VCs using DIDs and JSON Schemas
5. Apply for credential issuance via Manifest
6. Request and exchange credentials with Presentation Exchange

All this is able to be done via a command line and a simple REST/HTTP based service that uses in-memory or flat-file storage. There is no expectation of privacy or confidentiality of the information generated and exchanged, it is simply for demonstration purposes.

##### Primitives

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

##### Non-Goals

- No authentication
- No service reliability guarantees (e.g. zero down time, multi instance, databases)
- No credential revocations
- No robust LD support
- No key rotation
- No assumption of wallet (plain text is fine)

#### tbDEX Message Format (Protocol)
DRI: @hdou, @mistermoe  
Repo: [tbdex-protocol](https://github.com/TBD54566975/tbdex-protocol)

* Produce all necessary message schemas
* Iron out State Machine / Diagram
* Produce a reference implementation specifically for the core state machine
* Produce an end-to-end demo facilitating USD → USDC using [Circle’s API](https://developers.circle.com/docs/introducing-circle-apis) to mint USDC
* Stretch goal: Produce an initial draft of the tbdEX spec (likely to be descoped)

#### PFI or Credential Provider Mock Implementation
DRI: @hdou731
Repo: [tbdex-pfi-mockimpl](https://github.com/TBD54566975/tbdex-pfi-mockimpl)

* Move internal documentation [here](https://www.notion.so/tbd54566975/PFI-Implementation-e6fbf35f94814dde964872d95c52179e) to GitHub (looks like a mix of `tbdex-protocol` and `mock-impl`, yes?)

Most of the PFI message processors will live within the tbDEX protocol. We will process asks, offers, idv requests, and payments with different handlers. 

Message schemas will be decided upon (with changes expected in the future). 

Probably not within this scope of time, but possibly a persona implementation as a VC issuer.

---
NOTE
Please encode as SMART goals - let @ALRubinger know if you'd like to set some together.

---

#### Identity Hubs
DRI: @mistermoe  
Development: @csuwildcat
Repo: [hub-sdk-js](https://github.com/TBD54566975/hub-sdk-js)

The goal for this period of Hub development is to deliver a working MVP of a Hub. This MVP will include support for the following interfaces, functionality, and features:

* DMZ support for inbox-style drop-off of messages. **Not yet included in spec**
* Full support for permissions / capabilities. [Spec reference](https://identity.foundation/identity-hub/spec/#permissions)
* Full support for threads. [Spec reference](https://identity.foundation/identity-hub/spec/#threads)
* Full support for collections. [Spec reference](https://identity.foundation/identity-hub/spec/#collections)
- Full web-hook support

#### Development Site

DRI: @ALRubinger  
Repos: [developer-site](https://github.com/TBD54566975/developer-site), [developer-site-docusaurus](https://github.com/TBD54566975/developer-site-docusaurus)

* Home Page with orientation about mission, vision
* Projects page, likely summarizing or linking to the `collaboration` repo
* Careers, with links to current openings and form for candidate intake
* Media, from @angiej
