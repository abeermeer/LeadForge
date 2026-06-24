// LeadForge — Cold Email Sender
// Paste this into Extensions > Apps Script on your exported Sheet.
// Change SHEET_NAME and SENDER_NAME below, then run setupTrigger() once.

const SHEET_NAME = 'Leads';
const SENDER_NAME = 'Your Name';
const BATCH_SIZE = 8;
const COL = { NAME: 0, EMAIL: 1, BUSINESS: 2, CATEGORY: 3, PHONE: 4, SUBJECT: 5, BODY: 6, STATUS: 7, SENT_AT: 8 };
const FOOTER = '<br><br><hr><small>You are receiving this because your business listing has no website on file. Reply "remove" to opt out. ' + SENDER_NAME + '</small>';

function sendBatch() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log('Sheet "' + SHEET_NAME + '" not found.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const remaining = MailApp.getRemainingDailyQuota();

  if (remaining <= 0) {
    Logger.log('Daily email quota exhausted.');
    return;
  }

  let sentThisRun = 0;

  for (let i = 1; i < data.length; i++) {
    if (sentThisRun >= BATCH_SIZE || sentThisRun >= remaining) break;

    const row = data[i];
    const status = row[COL.STATUS];
    const email = row[COL.EMAIL];

    if (status === 'Sent' || status === 'Skipped' || !email) continue;
    if (email.toString().trim() === '') continue;

    try {
      const bodyHtml = row[COL.BODY].toString().replace(/\n/g, '<br>') + FOOTER;
      GmailApp.sendEmail(email, row[COL.SUBJECT].toString(), row[COL.BODY].toString(), {
        name: SENDER_NAME,
        htmlBody: bodyHtml
      });

      sheet.getRange(i + 1, COL.STATUS + 1).setValue('Sent');
      sheet.getRange(i + 1, COL.SENT_AT + 1).setValue(new Date());
      sentThisRun++;
    } catch (e) {
      sheet.getRange(i + 1, COL.STATUS + 1).setValue('Error: ' + e.message);
    }
  }

  Logger.log('Sent ' + sentThisRun + ' emails. Quota left: ' + MailApp.getRemainingDailyQuota());
}

function setupTrigger() {
  ScriptApp.newTrigger('sendBatch')
    .timeBased()
    .everyMinutes(20)
    .create();
  Logger.log('Trigger created. sendBatch will run every 20 minutes.');
}

function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('All triggers removed.');
}

function sendTest() {
  // Sends test email to yourself to preview
  const email = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const row = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const bodyHtml = row[COL.BODY].toString().replace(/\n/g, '<br>') + FOOTER;
  GmailApp.sendEmail(email, '[TEST] ' + row[COL.SUBJECT].toString(), row[COL.BODY].toString(), {
    name: SENDER_NAME,
    htmlBody: bodyHtml
  });
  Logger.log('Test email sent to ' + email);
}
