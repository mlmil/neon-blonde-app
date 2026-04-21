/**
 * NEON BLONDE — Song Request Sheet Handler
 * ─────────────────────────────────────────
 * Sheet: docs.google.com/spreadsheets/d/118du_vJO1CrfENE6M3LoQWS-HLITf-Yi53eUbzGCNg4
 * Script: script.google.com/home/projects/1ES6kjEglUz8u8Yp4thzeIaiDt_mzTZRyn42OnoEMGRkhAI9sVyoeHYL8/edit
 */

const SHEET_ID  = '118du_vJO1CrfENE6M3LoQWS-HLITf-Yi53eUbzGCNg4';
const SHEET_TAB = 'Sheet1';

// ── Helper: send confirmation email (silent fail) ──────────────────────────
function sendConfirmation(to, subject, body) {
  try {
    if (to && to.indexOf('@') > -1) {
      MailApp.sendEmail({ to: to, subject: subject, body: body });
    }
  } catch(e) { /* don't let email failure break the submission */ }
}

// ── POST handler ───────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss   = SpreadsheetApp.openById(SHEET_ID);

    // ── FUND contribution ────────────────────────────────────────────────
    if (data.type === 'fund') {
      var fundSheet = ss.getSheetByName('Funding') || ss.insertSheet('Funding');
      if (fundSheet.getLastRow() === 0) {
        fundSheet.appendRow(['Timestamp','Song','Artist','Amount','Name','Contact','Status']);
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

      // Confirmation email
      sendConfirmation(
        data.contact,
        'Neon Blonde got your contribution \uD83C\uDFB8',
        'Hey ' + (data.name || 'there') + ',\n\n' +
        'Your $' + data.amount + ' contribution toward "' + data.song + '"' +
        (data.artist ? ' by ' + data.artist : '') + ' is locked in.\n\n' +
        'When this song makes the setlist, we\'ll reach out to let you know.\n' +
        'If it never gets played, you get a full refund — no questions asked.\n\n' +
        'Thanks for the support.\n\n' +
        '— Neon Blonde\n' +
        'neonblonde.band · @neonblondeband'
      );

      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ── Song request (default) ───────────────────────────────────────────
    var sheet = ss.getSheetByName(SHEET_TAB) || ss.getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp','Song','Artist','Name','Email','Phone','Message','Status']);
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

    // Confirmation email
    sendConfirmation(
      data.email,
      'Neon Blonde got your request \uD83C\uDFB8',
      'Hey ' + (data.name || 'there') + ',\n\n' +
      'We got your request for "' + data.song + '"' +
      (data.artist ? ' by ' + data.artist : '') + '.\n\n' +
      'If the band accepts it, we\'ll send you a Venmo request for $100.\n' +
      'You pay, we play.\n\n' +
      '— Neon Blonde\n' +
      'neonblonde.band · @neonblondeband'
    );

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── GET handler — leaderboard ──────────────────────────────────────────────
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'songs') {
    try {
      var ss    = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName('Songs');
      if (!sheet) {
        return ContentService
          .createTextOutput(JSON.stringify({ songs: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var rows  = sheet.getDataRange().getValues();
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
