# The Anthropic Trail

Interactive Oregon Trail-style candidate agent for the Developer Education Lead role.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and fill in the keys you want to test.

3. Add `bio.md` at the project root when the real candidate manifest is ready.

4. Run the app:

   ```bash
   npm run dev
   ```

## Supabase

Run `supabase/schema.sql` in Supabase SQL editor to create the `trail_sessions` table.

The app works without Supabase credentials, but session persistence is disabled until configured.
