import React, { useState, useEffect } from 'react';
import { backend } from '../../services/controller';
import { Database, Zap, Download, ShieldCheck } from 'lucide-react';

export default function DataSettings() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadStats = () => {
        backend.db.getStats().then(setStats).catch(console.error);
    };

    useEffect(() => { loadStats(); }, []);

    const handleBackup = () => {
        backend.db.exportBackup().then(msg => {
            if (msg !== "Cancelled") alert(msg);
        });
    };

    const handleOptimize = async () => {
        setLoading(true);
        try {
            await backend.db.optimize();
            alert("Optimization complete! Space reclaimed.");
            loadStats();
        } finally {
            setLoading(false);
        }
    };

    if (!stats) return <p>Loading stats...</p>;

    return (
        <div className="setting-section">
            <div className="db-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                <div className="stat-card">
                    <label>Total Disk Size</label>
                    <div className="stat-value">{stats.fileSize}</div>
                </div>
                <div className="stat-card">
                    <label>Media Payload (BLOBs)</label>
                    <div className="stat-value">{stats.totalObjectSize}</div>
                </div>
            </div>

            <div className="db-actions-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="action-rect-btn" onClick={handleBackup}>
                    <Download size={18} /> Export Full Database Backup
                </button>
                
                <button className="action-rect-btn" style={{ background: '#457b9d' }} onClick={handleOptimize} disabled={loading}>
                    <Zap size={18} /> {loading ? "Optimizing..." : "Optimize & Clean (VACUUM)"}
                </button>
                
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
                    * <strong>Optimize</strong> reclaims space from deleted files and defragments the database. Highly recommended after deleting large media collections.
                </p>
            </div>
        </div>
    );
}