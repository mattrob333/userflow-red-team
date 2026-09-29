# Create the GitHub repository and publish

Intended owner/name: `mattrob333/userflow-red-team`.

Remote creation and upload were not completed during this consolidation. The connected GitHub actions could inspect the owner's account but did not expose a repository-create operation. No authenticated GitHub CLI was available in the working container. A repository lookup returned 404; that does not establish that every similarly named private repo is nonexistent or accessible.

## Recommended local path

Install Git, Node 22+, and GitHub CLI using their official installers. Sign into the intended GitHub account from your own terminal:

```bash
gh auth login
```

Then, from this package's root:

```bash
node scripts/publish-github.mjs --owner mattrob333 --name userflow-red-team --private
```

The publisher checks required executables/authenticated owner, runs repository checks, refuses a nonempty pre-existing remote configuration or an existing destination, initializes Git only when this package is not already inside another Git worktree, and uses GitHub CLI to create a private repository and push the current main branch. If Git identity is missing it stops and explains how to configure it. It never invents an author, force pushes, uploads secrets, or makes a private repo public.

If using the source ZIP, a fresh Git repository can be initialized by the script. To preserve previous commits, clone the supplied Git bundle first and run the publisher from that checkout:

```bash
git clone /path/to/userflow-red-team-v2.2.bundle userflow-red-team
cd userflow-red-team
# A bundle clone sets origin to the bundle file; remove only that local bundle remote.
git remote -v
git remote remove origin
node scripts/publish-github.mjs --owner mattrob333 --name userflow-red-team --private
```

Review the remote output before removing it. Never remove an existing live remote merely to satisfy this example.

## Equivalent manual commands for a source ZIP

After extracting into a new standalone directory:

```bash
npm test
npm run check
git init -b main
git add .
git status --short
git commit -m "Consolidate UserFlow design and Claude backend build foundation"
gh repo create mattrob333/userflow-red-team --private --source=. --remote=origin --push
gh repo view mattrob333/userflow-red-team --json nameWithOwner,url,isPrivate,defaultBranchRef
```

Configure your own Git name/email locally first if needed. `--private` is a conservative default, not authorization to change a previously public repo's visibility. The owner can choose public explicitly after a licensing/privacy review.

## If the destination already exists

Do not rerun creation, delete it, or force push. Fetch its actual files/history/permissions, compare to this prepared tree, and integrate on a new branch/PR. An empty repo may accept an initial push; a repo with existing work must be preserved. Share the actual repo URL with the agent for the next read/check/write cycle.

A failed push after successful creation can leave a private empty/partially populated repo; inspect it before retrying. Local files and commits remain preserved. Only report publication complete after verifying the remote owner, visibility, default branch, commit, and file tree.

Official command reference: [gh repo create](https://cli.github.com/manual/gh_repo_create).
