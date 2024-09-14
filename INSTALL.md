**Problem**: Need a quick way to eval 70+ projects for a final year computer science project on an objective scale.

The secret sauce:

0. Install bun.js
1. `bun install`
2. Scrape UNSW project data
      1. You'll need automated browsing `bun node_modules/puppeteer/install.mjs`
      2. Copy-paste your cookies from unsw-my.sharepoint.com into the `.env` file to bypass the UNSW login wall
      3. `bun scraper.ts` and all the pdf files will start downloading
3. Run GPT evaluation of projects
      1. Add your OpenAI API key to the `.env` file
      2. Run `bun main.ts`. The results are saved in the `README.md` and `evalations.csv` and files
      3. Proompt engineer the eval criterion to suit your group's needs and ambitions in `prompt.ts`
