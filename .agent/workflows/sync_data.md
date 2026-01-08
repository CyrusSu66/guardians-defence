---
description: Sync game data from Google Sheets and commit changes automatically
---

// turbo-all

1. Run the data sync script to fetch latest CSVs:
   `node tools/data_sync/import_sheet_to_js.mjs sync`

2. Stage all changes (new data files):
   `git add .`

3. Commit the changes to the current branch:
   `git commit -m "chore(data): auto-sync from google sheets"`
