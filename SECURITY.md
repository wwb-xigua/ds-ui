# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| `0.1.x` | ✅ |
| `< 0.1` | ❌ |

The project is pre-1.0, so fixes land on the latest minor line only.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Instead, report privately through GitHub's
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
on this repository. If that is unavailable, open a regular issue containing only a short note
that a private report is needed, without technical details.

Please include:

- Affected version
- Reproduction steps or a proof of concept
- Impact assessment

## What to expect

- Acknowledgement within a few days
- An assessment and planned fix timeline after triage
- Credit in the advisory unless you prefer to stay anonymous

## Scope

This project is a UI component library. It renders in the browser and does not run on a server,
so the attack surface is limited to what ends up in the DOM. Reports about XSS through component
props, prototype pollution through prop merging, and unsafe dynamic code execution are all in scope.

Dependencies bundled into the published package are also in scope — please report rather than
disclose publicly.
