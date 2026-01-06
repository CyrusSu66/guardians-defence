---
description: Sync game data from Google Sheets and commit changes automatically
---

// turbo-all

1. Run the data sync script to fetch latest CSVs:
   `node tools/csv_manager.mjs sync`

2. Stage all changes (new data files):
   `git add .`

3. Commit the changes to the current branch:
   `git commit -m "chore(data): auto-sync from google sheets"`
