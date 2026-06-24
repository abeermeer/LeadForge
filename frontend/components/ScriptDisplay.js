import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SCRIPT_CONTENT = `// LeadForge — Cold Email Sender
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
      const bodyHtml = row[COL.BODY].toString().replace(/\\n/g, '<br>') + FOOTER;
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
  const email = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const row = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const bodyHtml = row[COL.BODY].toString().replace(/\\n/g, '<br>') + FOOTER;
  GmailApp.sendEmail(email, '[TEST] ' + row[COL.SUBJECT].toString(), row[COL.BODY].toString(), {
    name: SENDER_NAME,
    htmlBody: bodyHtml
  });
  Logger.log('Test email sent to ' + email);
}`;

export default function ScriptDisplay({ sheetUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SCRIPT_CONTENT);
      setCopied(true);
      toast.success('Script copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="glass fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>Step 3: Deploy Apps Script</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>
          Copy this script, paste it into Extensions &gt; Apps Script on your Sheet.
        </p>
      </div>

      {sheetUrl && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid var(--accent)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 14,
        }}>
          ✅ Sheet created:{' '}
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent2)', textDecoration: 'underline' }}>
            Open in Google Sheets
          </a>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✅ Copied!' : '📋 Copy Script'}
        </button>
        <div className="code-block">
          {SCRIPT_CONTENT}
        </div>
      </div>

      <div style={{
        marginTop: 20,
        padding: 16,
        background: 'var(--surface2)',
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.6,
        color: 'var(--text2)',
      }}>
        <strong style={{ color: 'var(--text)' }}>📋 Setup Instructions:</strong>
        <ol style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>Open the Sheet link above</li>
          <li>Go to <strong>Extensions → Apps Script</strong></li>
          <li>Delete any default code, paste this entire script</li>
          <li>Change <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>SENDER_NAME</code> to your name</li>
          <li>Click <strong>Save</strong> (💾 icon)</li>
          <li>Run <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>setupTrigger()</code> once to start automation</li>
          <li>Emails will send automatically in batches of 8 every 20 minutes</li>
        </ol>
      </div>
    </div>
  );
}
