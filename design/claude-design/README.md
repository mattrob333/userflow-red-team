# Claude Design exports

These three files are the exact supplied design sources, not converted React applications:

- `UserFlow Red Team.dc.html`: application shell, 16 screen entries, state views, and simulated interactions.
- `AgentRunGraph.dc.html`: graph rendering, nodes/edges, zoom/focus, ticker, and metrics.
- `ScreenshotPreview.dc.html`: procedural placeholder illustrations, NOT captured browser evidence.

`manifest.json` records original SHA-256 hashes, sizes, and unresolved dependencies. `npm run inspect:design` regenerates an inventory to stdout without changing the original files.

## Missing files

Every export references `./support.js`. The main export also imports `./data.js`. Neither file was in the supplied set. The latter is expected to provide 28 referenced names, including personas, findings, timelines, layouts, and run projection. Exact values and behavior cannot be recovered from the imports alone.

A standard static file server does not supply `DCLogic`, `x-dc`, `sc-if`, `sc-for`, interpolation, or `dc-import`. Do not promise that double-clicking the HTML or serving it with Python makes a working prototype.

## Porting path

Recover a complete original export, or treat these files as visual specifications and implement ordinary React/TypeScript components. Keep any newly authored demo fixtures elsewhere and label them synthetic. Details: `../../docs/DESIGN_INTEGRATION.md`.

The included Google Fonts links remain original text references. No font files have been copied into the repository.
