# currency-config

Publishes the npm package `@heathmont/money-config` — a single `config.json` describing every
currency (fiat + crypto) and its display/input units. [index.js](index.js) just re-exports it.

Consumers: [@heathmont/money](https://www.npmjs.com/package/@heathmont/money) (Node),
[money-elixir](https://github.com/coingaming/money-elixir) (Elixir).

## Adding a new crypto currency

Edit [config.json](config.json) by hand. Do **not** run the generator for this — see below.

Add the entry among the other crypto currencies at the **top** of the file (`BTC`, `ETH`, `LTC`,
`TON`, `GRAM`, `BNB`, …), not at the end. The file is not alphabetical: hand-maintained crypto
entries come first, generator-produced fiat entries follow.

Minimal single-unit entry — copy this shape (this is how `GRAM` was added in `ebf3b26`):

```json
  "GRAM": {
    "code": "GRAM",
    "precision": 8,
    "units": {
      "GRAM": {
        "code": "GRAM",
        "symbol": "GRAM",
        "name": "GRAM",
        "displayPrecision": 8,
        "inputPrecision": 8,
        "shift": 0
      }
    }
  },
```

Conventions:

- **`precision: 8`** for crypto. (Generated fiat entries use `5`.)
- **The top-level key, `code`, and the base unit key are all the same ticker.**
- **`shift`** is how many decimal places the sub-unit is offset from the base unit — base unit is
  always `shift: 0`, and larger `shift` means a smaller unit.
- **Sub-units are optional.** `GRAM` ships one unit; `BTC`/`ETH`/`BNB` add milli/micro/smallest
  units. Follow the `ETH` block if the currency needs them: `m<TICKER>` (`shift: 3`,
  display 4 / input 5), `u<TICKER>` (`shift: 6`, display 2 / input 2), and a named smallest unit
  (`shift: 8`, display 0 / input 0).
- **Indentation is 2 spaces** in `config.json`. `package.json` and `package-lock.json` use **tabs** —
  don't let an editor reformat them.

A currency being replaced (e.g. TON → GRAM) is **kept, not deleted** — old balances still reference
it. Add the new one alongside.

## Releasing

There is no CI. Publishing is manual, from a maintainer's machine.

```bash
git checkout -b <your-branch>        # never release from master directly
# edit config.json
npm version patch                    # bumps both json files, commits, and tags vX.Y.Z
git push --follow-tags -u origin <your-branch>
# open PR to master, get it merged
git checkout master && git pull
npm publish
```

Notes on each step:

- **`npm version patch`** does three things: bumps `package.json` **and** `package-lock.json`,
  creates a commit, and creates an annotated git tag `vX.Y.Z`. History is all patch bumps
  (`2.3.24` → `2.3.25` → `2.3.26`).
- **`--follow-tags` is required.** A plain `git push` sends the commit but leaves the tag local, so
  the release ends up untagged on GitHub.
- **Publish from `master` after the merge**, so what's on npm matches what's on `master`.
- Currency change and version bump belong in the same PR.

### Always tag the release

Every release gets a `vX.Y.Z` tag matching the published npm version — tags exist for `v2.2.0`
through `v2.3.25`. They're the only way to see which commit produced a given published version,
since nothing else records it.

`npm version` creates the tag for you. **If you bump the version by editing `package.json` by hand,
no tag is created and it's easy to miss.** That's how `2.3.26` shipped untagged. To fix a release
after the fact:

```bash
git tag -a v2.3.26 <commit-that-bumped-the-version> -m "v2.3.26"
git push origin v2.3.26
```

Check for gaps with `git tag | sort -V | tail` against `npm view @heathmont/money-config versions`.

### `npm publish` fails with 403 — read this first

> `403 Forbidden - PUT https://registry.npmjs.org/@heathmont%2fmoney-config`
> `You may not perform that action with these credentials.`

**This is almost never a permissions problem, and a new token will not fix it.** npm has restricted
long-lived tokens that bypass 2FA for direct publishing
([details](https://gh.io/npm-gat-bypass2fa-deprecation)). A token in `~/.npmrc` reads fine
(`npm whoami`, `npm view`, private-package installs all work) but every write is refused.

Fix — authenticate interactively so 2FA is satisfied:

```bash
cp -p ~/.npmrc ~/.npmrc.bak   # npm login overwrites this file
npm login                     # opens a browser
npm publish                   # prompts for an OTP if required
```

Don't copy the old token back over `~/.npmrc` afterward — that reintroduces the 403. The login
session both installs private `@heathmont` packages and publishes.

Confirm it landed: `npm view @heathmont/money-config version`

The durable fix is GitHub Actions trusted publishing via OIDC, which would remove the manual step
entirely. Not set up yet.

## `src/generator.js` — fiat only, rarely needed

```bash
node src/generator.js > config.json
```

Reads `world-currencies` (a devDependency), appends any **fiat** currency not already present, and
prints the whole config to stdout. It skips currencies that already exist, so it won't clobber
hand-written crypto entries — but it also won't produce a correct crypto entry, since it assumes
the fiat major/minor unit model (`precision: 5`, a `cent` sub-unit).

**Add crypto by hand. Only use the generator to pick up new fiat currencies.**

It throws on any currency whose minor unit needs a non-ASCII code. Since it writes to stdout,
redirecting into `config.json` on a failure truncates the file — check `git diff` before committing.

## Gotchas

- `npm publish` warns `Removed invalid "scripts"`. Cosmetic; npm corrects the published
  `package.json` automatically. `npm pkg fix` silences it.
- Node version is pinned in [.tool-versions](.tool-versions) (`nodejs 18.18.0`) for asdf.
- There are no tests and no lint step. `node -e "require('./index.js')"` is the sanity check that
  `config.json` is still valid JSON.
