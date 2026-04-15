/**
 * NEON BLONDE — Song Request Sheet Handler
 * ─────────────────────────────────────────
 * ✅ SHEET ALREADY CREATED: docs.google.com/spreadsheets/d/118du_vJO1CrfENE6M3LoQWS-HLITf-Yi53eUbzGCNg4
 * ✅ SCRIPT ALREADY CREATED: script.google.com/home/projects/1ES6kjEglUz8u8Yp4thzeIaiDt_mzTZRyn42OnoEMGRkhAI9sVyoeHYL8/edit
 *    Code is already loaded in the editor — just needs to be deployed.
 *
 * ONE-TIME DEPLOY STEPS (3 clicks):
 * 1. Open the script link above (signed in as neonblondevc@gmail.com)
 * 2. Click "Deploy" → "New deployment"
 *    - Type: Web App
 *    - Execute as: Me (neonblondevc@gmail.com)
 *    - Who has access: Anyone
 * 3. Click Deploy → copy the Web App URL
 * 4. Open index.html → replace YOUR_APPS_SCRIPT_WEB_APP_URL_HERE with that URL
 */

// ── ALREADY SET — DO NOT CHANGE ──────────────────────────
const SHEET_ID = '118du_vJO1CrfENE6M3LoQWS-HLITf-Yi53eUbzGCNg4';
const SHEET_TAB = 'Sheet1';
// ─────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SHEET_ID);

    // ── FUND contribution ──────────────────────────────────
    if (data.type === 'fund') {
      var fundSheet = ss.getSheetByName('Funding') || ss.insertSheet('Funding');
      if (fundSheet.getLastRow() === 0) {
        fundSheet.appendRow(['Timestamp', 'Song', 'Artist', 'Amount', 'Name', 'Contact', 'Status']);
        fundSheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      }
      fundSheet.appendRow([
        data.timestamp || new Date().toLocaleString(),
        data.song      || '',
        data.artist    || '',
        '$' + (data.amount || '?'),
        data.name      || 'Anonymous',
        data.contact   || '',
        'Pending — awaiting booking'
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ── Song request (default) ─────────────────────────────
    var sheet = ss.getSheetByName(SHEET_TAB) || ss.getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Song', 'Artist', 'Name', 'Email', 'Phone', 'Message', 'Status']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.song      || '',
      data.artist    || '',
      data.name      || 'Anonymous',
      data.email     || '',
      data.phone     || '',
      data.message   || '',
      'Pending review'
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET handler — returns the Fund A Song list, or a health check
// Add a "Songs" tab to the sheet with columns: Song | Artist | Raised | Goal
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;

  if (action === 'songs') {
    try {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('Songs');
      if (!sheet) {
        return ContentService
          .createTextOutput(JSON.stringify({ songs: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var rows = sheet.getDataRange().getValues();
      var songs = [];
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0]) {
          songs.push({
            song:   String(rows[i][0] || ''),
            artist: String(rows[i][1] || ''),
            raised: Number(rows[i][2]) || 0,
            goal:   Number(rows[i][3]) || 100
          });
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({ songs: songs }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService
        .createTextOutput(JSON.stringify({ songs: [], error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput('Neon Blonde endpoint is live!')
    .setMimeType(ContentService.MimeType.TEXT);
}
