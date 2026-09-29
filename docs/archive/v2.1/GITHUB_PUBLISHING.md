# Publishing This Package to GitHub

The repository is already initialized locally with a `main` branch and an initial commit.

Suggested repository name:

```text
userflow-red-team
```

## Fastest option with GitHub CLI

If `gh` is installed and authenticated:

```bash
cd userflow-red-team
gh repo create userflow-red-team --public --source . --remote origin --push
```

For a private repository instead:

```bash
gh repo create userflow-red-team --private --source . --remote origin --push
```

## GitHub website option

1. Create a new empty repository named `userflow-red-team`.
2. Do not initialize it with a README, license, or `.gitignore`, because those files already exist locally.
3. From the local project folder, run:

```bash
git remote add origin https://github.com/<YOUR-USERNAME>/userflow-red-team.git
git push -u origin main
```

## If the empty repository was initialized accidentally

Clone the GitHub repository, copy these project files into it, commit, and push. Avoid force-pushing over unrelated history unless you understand the consequences.

## Before making the repository public

- Confirm no `.env` file is present.
- Confirm no API keys, test passwords, bearer links, or production screenshots are present.
- Choose a software license if you want to grant others explicit reuse/modification rights.

This package intentionally does not choose a license on the owner's behalf.