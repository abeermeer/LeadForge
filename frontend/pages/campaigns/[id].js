import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ResultsTable from '../../components/ResultsTable';
import StatusBadge from '../../components/StatusBadge';

export default function CampaignPage() {
  const router = useRouter();
  const { id } = router.query;
  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [campRes, leadsRes] = await Promise.all([
        fetch(`/api/search/${id}`),
        fetch(`/api/campaigns/${id}/leads`),
      ]);
      const campData = await campRes.json();
      const leadsData = await leadsRes.json();
      setCampaign(campData);
      setLeads(leadsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        <header className="header"><h1>LeadForge</h1></header>
        <div className="container" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 100 }}>
          <div className="skeleton" style={{ height: 40, width: 300, margin: '0 auto 20px' }} />
          <div className="skeleton" style={{ height: 200 }} />
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
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {campaign && (
            <>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>
                {campaign.query} in {campaign.location}
              </span>
              <StatusBadge status={campaign.status} />
              <button
                className="btn btn-primary"
                onClick={() => router.push(`/export/${id}`)}
              >
                📤 Export to Sheets
              </button>
            </>
          )}
        </div>
      </header>

      <div className="container">
        <ResultsTable leads={leads} campaignId={id} />
      </div>
    </div>
  );
}
