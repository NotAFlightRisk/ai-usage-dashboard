# Security policy

Thanks for helping keep this project and the people using it safe 💛

---

## Supported versions

Our version history is liniar, and we use semantic versioning. Only the latest release gets patched, so check you're on it before reporting anything.

---

## Threat model

There's no login. It serves whatever it can read - session ids, working directory names, model
names, the paths it reads from - to anyone who can reach the port. That's fine on the setup it
ships with (`HOST=127.0.0.1`), and not fine on a LAN interface or anything public.

Source files are only ever read, never written. The one credential it can touch is the Claude Code
OAuth token, and only while the plan windows setting is on: it goes to Anthropic and nowhere else,
and is never stored or logged.

---

## Reporting a vulnerability

> [!IMPORTANT]
> Please don't report anything publicly (issues, PRs, discussions) without giving us at least 30 days to respond and handle it.

Acceptible channels:

1. **GitHub** (preferred) - open an [advisory](https://github.com/NotAFlightRisk/ai-usage-dashboard/security/advisories/new) from the Security tab
2. **Email** - [security@peng.ly](mailto:security@peng.ly) (PGP: [`A8431F9F332FB0CD`](https://github.com/NotAFlightRisk.gpg))

Include the type of issue, the affected version and file paths, steps to reproduce, a PoC if you've got one, and what an attacker could actually achieve with it.

Keep it short, and don't over-state the impact - it's not helpful. Using AI is fine, just say that you have.

### What happens next

I'll try to acknowledge and triage within 48 hours. If it's valid, I'll get a fix out within 2 weeks and publish the advisory, and I'll keep you updated throughout.

---

## Disclosure

Coordinated, so give us a fair chance to ship a fix before going public. Happy to credit you in the advisory and release notes, or leave you out of it - your call.

---

## Safe harbour

Report in good faith, stick to this policy, and steer clear of privacy violations, data destruction and service disruption, and I won't pursue or support legal action against you.
