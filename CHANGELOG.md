# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/).

## [Unreleased]

### Added

- Repository governance: contribution guide, issue forms, pull request template, security policy, code owners.
- Documentation CI: Markdown lint, internal link check, pull request title check, scheduled external link check.
- Validated mockup stored in the repository: four standalone pages, screenshots, design tokens and contrast table.
- Scoping audit: context and scope, 55 measurable quality requirements, technology study, risk register, plan of the final audit, dated bibliography.
- Ten architecture decision records.
- Project plan, target architecture and backlog of 29 issues over four sprints.
- Method guides: running a project, handling a technical subject, checklists.
- Sprint 0 review and retrospective.
- Application skeleton: Next.js 16, strict TypeScript, ESLint with enforced layer boundaries, Prettier, Vitest.
- Application pipeline: formatting, lint, type check, dead code detection, tests, build, dependency audit and static security analysis on every pull request.
- Local runtime with Docker Compose: production image run by an unprivileged user, PostgreSQL 18, configuration validated at start-up, health endpoint.
- Design system: theme tokens, self-hosted fonts and the base components of the style guide, shown on a living style guide page.
- End-to-end and accessibility tests run against the production build on every pull request.
- French and English versions of the site: language prefix in the URL, redirect to the visitor's language, language switcher, localized not-found page, skip link.
- Catalogue schema (categories, products, formats) with SQL migrations, database constraints on prices and stock, and a deterministic demonstration seed.
- Integration tests against a real PostgreSQL database, locally and in the pipeline.
- Shop listing: products read from the database, filter by category and sort carried by the URL, prices formatted for the language, usable without JavaScript.
- Product page: formats and quantity with the price, price per litre and total kept in sync, unavailable formats, tasting profile, related products, localized 404 for unknown products.
- Home page: hero, category tiles and favourite products read from the database, the mill story and the taste guide.
- Sprint 1 review and retrospective.
- Cart: add from a product page, change quantities, remove lines; stored on the server and tied to an opaque, protected cookie; header link with its count.
- Customer accounts: sign up, sign in and sign out with e-mail and password, Argon2id hashing, sessions stored in the database and revoked on sign-out.
- Sign-in throttling per account with counters in the database, and a structured security log that never contains a password, an e-mail address or a token.
- Account page: name and delivery address, with the customer always taken from the session; return to the requested page after sign-in.
- Cart kept at sign-in and sign-up: the guest cart joins the account, quantities are added up to the available stock, and the device forgets the cart at sign-out.
- Account deletion from the account page, confirmed with the password: the page states what is deleted and what is kept, and the account, its sessions, its delivery address and its cart are removed.
- Sprint 2 review and retrospective.
