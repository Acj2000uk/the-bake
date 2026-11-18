# MCN Bake Bible 2.0

## Repository baseline

Main at 25c3ade contains the deployment import instructions. The dev and bible-import head commits contain compiled deployment assets. Dev includes React, Firebase and PDF-related bundles. Its stylesheet references Cormorant Garamond, Inter and Pinyon Script. Use the deployed design as a visual reference. Start editable React and TypeScript source on this branch.

## Delivery stages

1. Inventory and reconcile. Capture reference screens and cream palette. Locate the existing recipe export, the set of 32 amendments and the current MCN Hospitality allergen booklet. Record stable source IDs and ingredient, yield, method and allergen differences. Report unmatched entries, duplicates and conflicts. Require a reconciliation entry for each amendment and kitchen sign-off before publication.
2. Review Firebase with read-only access. Map collections, document shapes, authentication, roles, rules and existing consumers. Develop against fixtures and local emulators. Test staff, editor, approver and anonymous permissions. Agree a backup and recovery path before proposing any migration.
3. Build the kitchen interface with React, TypeScript and Vite. Keep components, styles, recipe logic and storage adapters in editable source. Start with the library, category filter, search, device favourites and recipe detail. Compare against the existing design on a phone and a kitchen tablet. Check touch targets and legibility with long ingredient lists.
4. Implement one calculation module for screen, print and production. Store base yield, yield unit, ingredient quantities and units. Preserve non-numeric instructions. Flag whole items and ambiguous quantities for review. Test half, double and fractional batches. Keep oven settings and timings as authored. Generate A4 PDFs with yield, ingredient table, method, allergens, revision and page numbers. Check long recipes for clipping.
5. Implement versioned recipes and approval in the emulator. Keep immutable approved versions and a separate draft. Record reviewer, timestamp and source evidence. Model contains, precautionary warnings and unresolved checks separately. Route unresolved declarations to review. Test concurrent edits and enforce approval permissions at the data boundary.
6. Build daily production sheets by date and venue, with target yields, batch quantities, completion and sign-off. Pin each line to its approved revision so later edits preserve the historical sheet. Verify sheet quantities against printed recipes.
7. Add a server-side assistant restricted to approved revisions accessible to the signed-in user. Link answers to recipe and revision. Use the shared calculator for quantities. Return an explicit gap when a recipe or allergen fact lacks approval. Test draft exclusion, withdrawn recipes and unsupported substitutions.
8. Review in an isolated environment. Keep both existing sites and their deployment settings intact. Production release requires Alex's approval of the tested revision and rollback plan.

## First working slice

Use one representative fixture to demonstrate search, tablet recipe view, scaling and a printable A4 sheet. Compare quantities against a hand-calculated batch and verify that print and screen agree before importing the full collection.
