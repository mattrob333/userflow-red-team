# Live Agent Pipeline Design Reference

These files preserve the React component supplied as the visual reference for the UserFlow Red Team live execution experience.

## Files

- `ai-agent-pipeline.png` - supplied visual reference screenshot
- `ai-agent-pipeline.tsx` - supplied reference component
- `demo.tsx` - supplied demo wrapper

## What to reuse

Reuse the visual language:

- black/charcoal surface
- thin borders
- electric-blue active node
- dashed graph edges
- moving signal dots
- compact status indicators
- live event ticker
- small metrics footer

## What not to copy literally

The supplied component is a static demo with hardcoded SVG geometry and demo labels such as Vector DB, Pinecone, Claude, Email Draft, CRM Update, and Report Gen.

The production UserFlow component should instead render the real run model described in:

- `docs/CLAUDE_DESIGN_FRONTEND_SPEC.md`
- `docs/LIVE_AGENT_RUN_GRAPH.md`

Production labels should reflect:

- project input
- reconnaissance
- orchestrator
- persona agents
- browser/source/log/database tools actually used
- findings
- synthesis
- report
- improvement plan and retest when applicable

## Frontend assumptions

The supplied reference expects:

- React
- TypeScript
- Tailwind CSS
- Framer Motion

The original integration brief expected a shadcn-style project and `/components/ui` for production placement.
