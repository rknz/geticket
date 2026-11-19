# Backup, Version Control, and Release Plan

## Repository backup

1. Initialize Git before Phase 1 and create an initial documentation commit.
2. Commit only reviewed, working increments; one approved phase may contain several small commits.
3. Keep at least one private remote backup chosen by the owner, or an encrypted offline copy.
4. Never commit credentials, tokens, cookies, Railway passwords, OTPs, payment data, built packages, or user journey records.
5. Before any risky migration or release, create a tagged commit and an encrypted archive of the repository excluding secrets and dependencies.

## Release archive contents

Each browser release should contain:

- Browser-specific installable package or clearly labelled unpacked-extension directory
- Version number and changelog
- SHA-256 checksum where distribution method supports it
- Browser-specific installation guide
- Permissions list and network-destination list
- Known limitations, including monitoring/lifecycle constraints

## Installation usability goal

Chrome, Edge and Kiwi must each have separate, tested instructions. No installation instruction may claim that an unsupported Kiwi API or background monitoring capability works.
