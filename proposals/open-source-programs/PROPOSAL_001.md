# Proposal 001 - Documentation Infrastructure Phase 2

## Desired outcome
Documentation Section of developer.tbd.website evolves to:
* Quickly get developers:
    * To their area of interest
    * Building tangible applications that provide value to them
* Promote use case -driven development
* Introduce new Documentation Content Types intentionally not addressed in Phase 1.
    * Described below
* Include clear, documented pathways for core developers and contributors to submit further documentation types and use cases.
* Have all structure neccesary for a Deep Dive with Core engineers on content for Getting Started, starting 6 March.

Principles:
* Centered around use cases and value to developers
* Scoped to the Documentation Section of the Developer Site

Non-goals:
* Concept education and supporting media exists elsewhere on developers.tbd.website. Link as appropriate to build a cohesive experience across the Developer Site.
* Fulfill the entire [Getting Started Experience](https://github.com/TBD54566975/collaboration/issues/48). This is a critical component of that Experience.
* High-fidelity UX and Design. This should tee up the necessary wireframes to have that work done in a Phase 3.

Scheduling:
* Timeboxed
* Phase 2 Start: Wednesday, 15 February
* Phase 2 End: Friday, 3 March
* Delivered ahead of [Getting Started Experience](https://github.com/TBD54566975/collaboration/issues/48) Kickoff, giving that conversation structure.

## Gap Analysis

### We currently have:
* Phase 1 Documentation Section
    * Everything we need to advance Docs Section structure and content authoring
* API Docs section
* Tutorials section
* Getting Started stub
* Labs as repositories from OSE

### We need:

* Revised Information Architecture - how we're organizing our info
    * Tangibly: a Site Map for the Documentation Section of developer.tbd.website
* Revised "Docs Home": Proposed as "Getting Started" below
    *  Map of the Web5 Platform and its components
    *  List of Featured Guides, the use cases we're promoting
* [Project Documentation](https://github.com/TBD54566975/collaboration/issues/38) Section
* Sample Applications Section and Store/Repo
    * Separate from OSE Labs work; where prototypes move for longer-term maintenance and higher-fidelity design and documentation
* Playground Applications Section and Store/Repo
    *  Separate from OSE Labs work; where prototypes move for longer-term maintenance and higher-fidelity design and documentation
* Web development tasks to implement new designs

## Documentation Content Types
These are the content types which comprise our documentation.

These types are distinct from how the information is organized in the Site Map.

* **Getting Started Home**
    * Docs Home; the entry point to quickly understanding Web5's value and moving developers to tangibly get started through one of the Guides or other Documentation Types
* **Guides**
    * Hub for a Use Case
    * Links to other Documentation Content Types which together describe the Use Case or supplement with additional relevant information
    * _ALR: The term "Guide" confuses me because it seems close to "Tutorial". Is a "Tutorial" not a step-by-step Guide? Are there terms we might consider that are more intuitive? Or is there a fun way we can refer to these action-driven sections, like "Missions" or "Quests"?_
* **Tutorials**
    * A step-by-step set of instructions for fulfilling a use case.
    * Clearly outlines "if a developer invests X time, by the end they'll have a working Y"
    * _Define common structure for these_
* **Sample Applications**
    * A standalone piece of code that can be built and run. Shows a use case, feature, or a combination of these together to accomplish a task.
    * Has both:
        * Code as a repository or folder in a repository (to be built and run)
        * A URL to where we've deployed this for folks to play
            * _^ Is that true?_
    * Examples:
        * Yeeter
        * Notes app
    * Maintenance requirements
        * CI enforcing these can:
            * Build
            * Be deployed
            * Pass tests proving they work as intended
    * _Define common structure for these_
        * Link to repo to pull and run on your own?
        * Instructions for running the sample application?
        * Cross-linking to the concept(s) the sample application employs as Tutorials?
* **API Docs**
    * Language- or framework-native listing of the API and its use. Typically covers method/function names, inupts, outputs, and exceptional cases.
    * Listed [here](https://developer.tbd.website/docs/api/) by component.
    * _The Big Question to solve w/ OSE_
        * Web5 is the Platform. Developers code to its application model and get data messaging, storage, privacy, credentials, etc for free. So: _What is the Web5 API?_
    * Component Examples:
        * HTTP APIs, inlined into Developer Site:
            * [SSI Service](https://developer.tbd.website/docs/apis/ssi-service)
        * Go API
            * [SSI SDK](https://pkg.go.dev/github.com/TBD54566975/ssi-sdk)
        * JS/TypeScript API
            * [DWN JavaScript SDK](https://tbd54566975.github.io/dwn-sdk-js/)
* **Playgrounds**
    * Web applications which let the user see code and change it, watching how the outputs respond to those changes
    * _Define common structure for these_
        * Link to live hosted playground?
        * Link to repo to pull and run on your own?
        * Instructions to build?
        * CI
            * [Example from how @dcrousso set up GitHub Actions](https://github.com/TBD54566975/web5-components/blob/main/.github/workflows/Pages.yml)
        * Test the deployment
    * Examples
        * [Verifiable Credentials](https://tbd54566975.github.io/web5-components/demo/VerifiableCredential/)

## Proposed Information Architecture
An outline view of how information should be organized. Informs the wireframes, navigation, and content sections.

* **Getting Started Home**
    * _Purpose_: The Web5 Platform, its purpose and value, and the components in it. User chooses their "Getting Started" Experience: ie. Web5 messaging and data storage, Credential issuance, Creating their identity on the decentralized web (DID)
* **Guides**
    * The "hub" for each use case
        * Examples of Guides:
            * Creating Your Identity on the Decentralized Web
            * Sending and Receiving Decentralized Messages
            * Issuing a Credential
        * Contains:
            * Tutorials
            * Sample Applications
            * Playground (if appropriate)
            * Projects used (links to Projects pages)
            * ...others from "Documentation Content Types"
* Projects
    * Open format in MDX or Markdown for Project Leads to surface project information on the Developer Site.
    * One per top-level project, for example:
        * SSI
        * DWN
        * Wallet
        * tbDEX
        * Web5
    * Shows the components which make up a Project
        * Example for SSI:
            * ssi-service
            * ssi-sdk
        * Example for Web5:
            * Web5 API
* Documentation Content Types
    * Additionally let the developer explore by Documentation Type as a list, rather than only by use case **Guides**?
        * **Tutorials**
        * **Sample Applications**
        * **Playgrounds**

## Proposed Work items to break off into Issues
* Information Architecture - how is information organized and presented?
* UX and Wireframe
    * From Bobbilee's base work in Figma. Incorporates decisions made in the "Information Architecture" task
    * Evolve Figma doc to incoporate decisions we make here. Practically-speaking, how is that done?
    * Potential handoff point to high-fidelity design phase
* Site Development
    * Inventory of new components that need to be created
    * Moving from pure Markdown publishing to MDX
    * Guide to content authors documenting the above - MDX structure, components available, and how to use the components.
* Tutorial structure
    * An author's guide for writing tutorials
    * Is there a common format all tutorials take?
    * Includes:
        * Best practices?
        * Template?
* Sample Applications structure
    * An author's guide for writing sample applications
    * Is there a common format all sample applications take?
* Content authoring
* Phase 3 Backlog:
    * Design tasks from UX wireframes
    * Web development to implement Designs

## Implementation Considerations
* Embed into every Project section a link to contribute - and make sure it's offshoring into appropriate homes
* Link out to FAQs and Glossary on the Dev Site where appropriate (and/or tooltip)
* Embed feedback forms where appropriate
* Pop outs to choose software version where tutorials are, or where code is embedded
* Embed media into guides where appropriate, perhaps cross-linking into where they're "housed" in Media section. Perhaps the "embed" is exandable as an option and doesn't take up lots of real estate unless user opts into.

## External Examples
* [Use Case Approach from Mattr](https://learn.mattr.global/docs/)