# MCN Bake Bible 2.0 development

Use Node 24 LTS. Extract the private MCN Bake Bible data pack in the project root. It supplies data/archive.json, data/amendments.json and data/allergens.json. These files contain internal kitchen records. Git ignores them.

Run npm ci, npm test, npm run build and npm run preview. Open the loopback URL printed in the terminal. For editing with hot reload, run npm run dev. The Node middleware runs the kitchen API in both modes. A static dist upload alone does not run this application.

Each launch prints temporary staff and admin passwords unless BAKE_STAFF_PASSWORD and BAKE_ADMIN_PASSWORD are set. Approvals, drafts and production records persist in .local/kitchen.sqlite. Favourites stay on the device. Use a private persistent host, individual identities, HTTPS and backups before a shared operational rollout.

The optional assistant reads OPENAI_API_KEY and BAKE_AI_MODEL from the server environment. Asking a question sends the question and selected approved recipe passages to the configured OpenAI model. Returned answers contain only matching passages from the saved revision. No external call runs during import or approval.

## Source reconciliation

The November archive has 44 records. Each of the 32 amendment pages replaces its matching archive page in the working view. The November 18 staff booklet v0.5 covers 37 product declarations across 35 current recipes, including three variants of one cheesecake formula. Nine source records remain in the archive collection. Opening a recipe exposes the original for comparison. The entire 17-page booklet is available to signed-in staff. Imported recipes begin in review. A manager must check each draft before approving it for sheets and assistant queries.

Scaling defaults to multiples of the original batch unless a verified item yield is entered. Simple ingredient quantities scale automatically. Complex source expressions carry a manual-check label. Method timings, temperatures and embedded quantities retain the original instructions. Approved revisions remain pinned to existing production sheets.

## Firebase and release

This isolated application does not connect to either existing Firebase or Netlify environment. Before any Firebase migration, obtain the deployed rules, index configuration and read-only schema inventory from the project owner. Verify role boundaries and representative legacy records in an emulator. Production release requires explicit owner approval.
