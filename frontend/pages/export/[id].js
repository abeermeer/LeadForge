import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ScriptDisplay from '../../components/ScriptDisplay';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

export default function ExportPage() {
  const router = useRouter();
  const { id } = router.query;
  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [sheetUrl, setSheetUrl] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [campRes, leadsRes] = await Promise.all([
        fetch(`/api/search/${id}`),
        fetch(`/api/campaigns/${id}/leads`),
      ]);
      setCampaign(await campRes.json());
      setLeads(await leadsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/export`, { method: 'POST' });
      const data = await res.json();
      if (data.sheet_url) {
        setSheetUrl(data.sheet_url);
        toast.success('Sheet created successfully!');
      }
    } catch (e) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <header className="header"><h1>LeadForge</h1></header>
        <div className="container" style={{ textAlign: 'center', paddingTop: 100 }}>
          <div className="skeleton" style={{ height: 40, width: 300, margin: '0 auto 20px' }} />
          <div className="skeleton" style={{ height: 400 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn"
            style={{ background: 'var(--surface2)', padding: '6px 12px' }}
            onClick={() => router.push('/')}
          >
            ← Back
          </button>
          <h1>LeadForge</h1>
        </div>
        {campaign && (
          <span style={{ fontSize: 14, color: 'var(--text2)' }}>
            {campaign.query} in {campaign.location} — {leads.length} leads
          </span>
        )}
      </header>

      <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
        {!sheetUrl ? (
          <div className="glass fade-in" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Export to Google Sheets</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
              Create a Google Sheet with all {leads.length} leads, their generated emails, and status columns.
              Then paste the Apps Script to automate sending.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleExport}
              disabled={exporting}
              style={{ fontSize: 16, padding: '14px 40px' }}
            >
              {exporting ? 'Creating Sheet...' : '🚀 Create Sheet & Export'}
            </button>
          </div>
        ) : (
          <ScriptDisplay sheetUrl={sheetUrl} />
        )}
      </div>
    </div>
  );
}
