/**
 * Google Sheets Sync Configuration - TEMPLATE
 * 
 * Copy this file to sync_config.local.js and fill in your values.
 * The .local.js file is gitignored for security.
 * 
 * How to find these values:
 * 1. DOC_ID: Open your Google Sheet, look at the URL:
 *    https://docs.google.com/spreadsheets/d/{DOC_ID}/edit#gid=...
 * 
 * 2. GIDs: Each sheet tab has its own GID in the URL:
 *    ...edit#gid={GID}
 */

export const SYNC_CONFIG = {
    DOC_ID: 'YOUR_GOOGLE_SHEET_DOC_ID_HERE',

    GIDS: {
        heroes: '0',           // Usually first sheet is 0
        monsters: 'YOUR_GID',  // Replace with actual GID
        items: 'YOUR_GID'      // Replace with actual GID
    }
};
