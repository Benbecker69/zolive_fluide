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
