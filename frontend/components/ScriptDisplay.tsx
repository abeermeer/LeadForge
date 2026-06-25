import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, ExternalLink, FileCode, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScriptDisplayProps {
  sheetUrl?: string;
}

const SCRIPT = `// LeadForge — Cold Email Sender
// Paste into Extensions > Apps Script on your exported Sheet.
// Set SENDER_NAME, then run setupTrigger() once.

const SHEET_NAME = 'Leads';
const SENDER_NAME = 'Your Name';
const BATCH_SIZE = 8;
const COL = { NAME: 0, EMAIL: 1, BUSINESS: 2, CATEGORY: 3, PHONE: 4, SUBJECT: 5, BODY: 6, STATUS: 7, SENT_AT: 8 };
const FOOTER = '<br><br><hr><small>Reply "remove" to opt out. — ' + SENDER_NAME + '</small>';

function sendBatch() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) { Logger.log('Sheet not found.'); return; }
  const data = sheet.getDataRange().getValues();
  const remaining = MailApp.getRemainingDailyQuota();
  if (remaining <= 0) { Logger.log('Quota exhausted.'); return; }
  let sent = 0;
  for (let i = 1; i < data.length && sent < BATCH_SIZE && sent < remaining; i++) {
    const row = data[i];
    if (row[COL.STATUS] === 'Sent' || !row[COL.EMAIL]) continue;
    try {
      const html = row[COL.BODY].toString().replace(/\\n/g, '<br>') + FOOTER;
      GmailApp.sendEmail(row[COL.EMAIL], row[COL.SUBJECT], row[COL.BODY], { name: SENDER_NAME, htmlBody: html });
      sheet.getRange(i + 1, COL.STATUS + 1).setValue('Sent');
      sheet.getRange(i + 1, COL.SENT_AT + 1).setValue(new Date());
      sent++;
    } catch (e) {
      sheet.getRange(i + 1, COL.STATUS + 1).setValue('Error: ' + e.message);
    }
  }
  Logger.log('Sent ' + sent + ' emails. Quota left: ' + MailApp.getRemainingDailyQuota());
}

function setupTrigger() {
  ScriptApp.newTrigger('sendBatch').timeBased().everyMinutes(20).create();
  Logger.log('Trigger created — sending every 20 min.');
}

function removeAllTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('Triggers removed.');
}

function sendTest() {
  const email = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const row = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const html = row[COL.BODY].toString().replace(/\\n/g, '<br>') + FOOTER;
  GmailApp.sendEmail(email, '[TEST] ' + row[COL.SUBJECT], row[COL.BODY], { name: SENDER_NAME, htmlBody: html });
  Logger.log('Test sent to ' + email);
}`;

export default function ScriptDisplay({ sheetUrl }: ScriptDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SCRIPT);
      setCopied(true);
      toast.success('Script copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {sheetUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-5 border-jade/30 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-jade/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-jade" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-pearl">Sheet created successfully</p>
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-frost hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              Open in Google Sheets <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="p-5 border-b border-edge/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-frost/10 flex items-center justify-center">
              <FileCode className="w-4.5 h-4.5 text-frost" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-pearl">Apps Script</h2>
              <p className="text-xs text-muted">Copy and paste into your Sheet</p>
            </div>
          </div>
          <motion.button
            onClick={handleCopy}
            className="btn-primary text-sm"
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <><CheckCircle className="w-4 h-4" /> Copied</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy Script</>
            )}
          </motion.button>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 px-5 py-2 bg-[#050508] border-b border-edge/10">
            <Terminal className="w-3.5 h-3.5 text-muted" />
            <span className="text-[11px] text-muted font-mono">apps_script.gs</span>
          </div>
          <pre className="code-block max-h-[420px] overflow-y-auto rounded-none border-0">
            <code>{SCRIPT}</code>
          </pre>
        </div>
      </div>

      <div className="glass-panel-light p-5">
        <h3 className="text-sm font-semibold text-pearl mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-ember" />
          Setup Instructions
        </h3>
        <ol className="space-y-2 text-sm text-muted">
          {[
            'Open the Google Sheet link above',
            'Go to Extensions → Apps Script',
            'Delete default code, paste this entire script',
            'Change SENDER_NAME to your name',
            'Click Save (💾 icon), then Run → setupTrigger',
            'Emails send in batches of 8 every 20 minutes',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-ember/10 text-ember text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}
