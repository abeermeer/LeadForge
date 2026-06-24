import { useState } from 'react';
import StatusBadge from './StatusBadge';
import toast from 'react-hot-toast';

export default function ResultsTable({ leads, campaignId }) {
  const [editingId, setEditingId] = useState(null);
  const [edits, setEdits] = useState({});
  const [localLeads, setLocalLeads] = useState(leads);

  const handleEdit = (lead) => {
    setEditingId(lead.id);
    setEdits({ email_subject: lead.email_subject, email_body: lead.email_body });
  };

  const handleSave = async (leadId) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edits),
      });
      if (res.ok) {
        setLocalLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, ...edits } : l))
        );
        setEditingId(null);
        toast.success('Email updated');
      }
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const handleGenerateEmails = async () => {
    toast.success('Generating emails...');
    // Trigger email gen
    setTimeout(() => window.location.reload(), 2000);
  };

  return (
    <div className="glass fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18 }}>Leads ({localLeads?.length || 0})</h2>
        <button className="btn btn-primary" onClick={handleGenerateEmails}>
          ✉️ Generate Emails
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Phone</th>
              <th>Email Status</th>
              <th>Subject</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {localLeads?.map((lead) => (
              <tr key={lead.id}>
                <td style={{ fontWeight: 500 }}>{lead.name}</td>
                <td style={{ fontSize: 13, color: 'var(--text2)' }}>{lead.category || '-'}</td>
                <td>
                  {lead.rating ? (
                    <span style={{ color: 'var(--yellow)' }}>★ {lead.rating}</span>
                  ) : '-'}
                </td>
                <td style={{ fontSize: 13 }}>{lead.phone || '-'}</td>
                <td><StatusBadge status={lead.email_status} /></td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {editingId === lead.id ? (
                    <input
                      className="input"
                      value={edits.email_subject || ''}
                      onChange={(e) => setEdits((p) => ({ ...p, email_subject: e.target.value }))}
                      style={{ width: 200 }}
                    />
                  ) : (
                    lead.email_subject || '-'
                  )}
                </td>
                <td>
                  {editingId === lead.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleSave(lead.id)}>
                        Save
                      </button>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: 12, background: 'var(--surface2)' }} onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="btn" style={{ padding: '6px 12px', fontSize: 12, background: 'var(--surface2)' }} onClick={() => handleEdit(lead)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {(!localLeads || localLeads.length === 0) && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text2)', padding: 40 }}>
                  No leads found yet. Start a new search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
