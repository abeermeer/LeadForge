import { useState } from 'react';
import SearchForm from '../components/SearchForm';
import StatusBadge from '../components/StatusBadge';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [status, setStatus] = useState(null);
  const [polling, setPolling] = useState(false);

  const handleStart = (data) => {
    setActiveCampaign(data);
    setPolling(true);
    // Poll for status
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/search/${data.campaign_id}`);
        const s = await res.json();
        setStatus(s);
        if (s.status === 'completed' || s.status === 'failed') {
          clearInterval(interval);
          setPolling(false);
        }
      } catch (e) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);
  };

  return (
    <div>
      <header className="header">
        <h1>LeadForge</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {status && status.total_leads > 0 && (
            <>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>
                {status.total_leads} leads found
              </span>
              <button
                className="btn btn-primary"
                onClick={() => router.push(`/campaigns/${status.id}`)}
              >
                View Leads
              </button>
              <button
                className="btn"
                style={{ background: 'var(--surface2)' }}
                onClick={() => router.push(`/export/${status.id}`)}
              >
                Export
              </button>
            </>
          )}
        </div>
      </header>

      <div className="container">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <SearchForm onStart={handleStart} />

          {polling && status && (
            <div className="glass fade-in" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 500 }}>
                  Searching for "{status.query}" in {status.location}
                </span>
                <StatusBadge status={status.status} />
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: status.total_leads > 0 ? '100%' : '30%' }}
                />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>
                {status.total_leads || 0} leads found so far...
              </p>
            </div>
          )}

          {status && status.status === 'completed' && (
            <div className="glass fade-in" style={{ marginTop: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>Search Complete!</h2>
              <p style={{ color: 'var(--text2)', marginBottom: 16 }}>
                Found {status.total_leads} businesses without websites.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push(`/campaigns/${status.id}`)}
              >
                ✉️ Generate Emails
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
