import React, { useState } from 'react';
import TagSettings from '../settings/TagSettings';
import DataSettings from '../settings/DataSettings';
// Import icons for the sidebar
import { Tag, Database, Settings as GearIcon, Info } from 'lucide-react';

export default function SettingsModal({ onClose }) {
    const [activeTab, setActiveTab] = useState('tags');

    const renderContent = () => {
        switch (activeTab) {
            case 'tags': return <TagSettings />;
            case 'general': return <div className="setting-section"><p>General options coming soon...</p></div>;
            case 'data': return <DataSettings />;
        }
    };

    const getTitle = () => {
        switch (activeTab) {
            case 'tags': return "Manage Tags & Categories";
            case 'general': return "General Preferences";
            case 'data': return "Data Management";
            default: return "Settings";
        }
    };

    return (
        <div className="modal-overlay">
            <div className="settings-modal-wrapper">
                
                {/* --- LEFT SIDEBAR --- */}
                <div className="settings-sidebar">
                    <div className="settings-sidebar-header">
                        Configuration
                    </div>
                    
                    <nav>
                        <div 
                            className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            <GearIcon size={18} /> General
                        </div>
                        
                        <div 
                            className={`settings-nav-item ${activeTab === 'tags' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tags')}
                        >
                            <Tag size={18} /> Tags
                        </div>

                        <div 
                            className={`settings-nav-item ${activeTab === 'data' ? 'active' : ''}`}
                            onClick={() => setActiveTab('data')}
                        >
                            <Database size={18} /> Database
                        </div>

                        <div className="settings-nav-item" style={{ marginTop: 'auto' }}>
                            <Info size={18} /> About
                        </div>
                    </nav>
                </div>

                {/* --- RIGHT CONTENT --- */}
                <div className="settings-content">
                    <div className="settings-header-bar">
                        <span className="settings-title">{getTitle()}</span>
                        <button className="settings-close-btn" onClick={onClose}>×</button>
                    </div>

                    <div className="settings-page-scroll">
                        {renderContent()}
                    </div>
                </div>

            </div>
        </div>
    );
}