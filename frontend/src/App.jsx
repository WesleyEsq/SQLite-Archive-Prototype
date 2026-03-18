import React, { useState } from 'react';
import './styles/main.css'; // Main stylesheet for the app

// --- Components ---
import EntryList from './components/EntryList';
import CompendiumView from './components/CompendiumView';
import LibraryGrid from './components/LibraryGrid';
import SeriesDetail from './components/SeriesDetail';
import SettingsModal from './components/modals/SettingsModal';

// --- Controllers ---
import EntryListController from './controllers/EntryListController';
import LibraryGridController from './controllers/LibraryGridController';
import SeriesDetailController from './controllers/SeriesDetailController';
import VaultController from './controllers/VaultController'; 

// --- Icons ---
import { 
    List, 
    Grid, 
    Info, 
    PlusCircle, 
    Settings, 
    BookOpen,
    Library,
    Database
} from 'lucide-react';

function App() {
    const [activeLibraryId, setActiveLibraryId] = useState(1); 
    
    // Your app uses 'view' to track the current page!
    const [view, setView] = useState('about'); 
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    const handleAddNew = () => {
        setView('list'); 
        setIsAddingNew(true); 
    };

    const handleSelectSeries = (entry) => {
        setSelectedSeries(entry);
        setView('series_detail');
    };

    // Helper to determine active state
    const isActive = (v) => view === v && !isAddingNew;

    return (
        <div id="App">
            {/* --- LEFT SIDEBAR --- */}
            <nav className="app-sidebar">
                <div className="sidebar-logo">
                    <BookOpen size={28} />
                    <span>Compendium</span>
                </div>

                <div className="sidebar-nav">
                    <button 
                        className={`nav-item ${isActive('about') ? 'active' : ''}`} 
                        onClick={() => { setView('about'); setIsAddingNew(false); }}
                    >
                        <Info size={20} /> About
                    </button>

                    <button 
                        className={`nav-item ${isActive('library') || view === 'series_detail' ? 'active' : ''}`} 
                        onClick={() => { setView('library'); setIsAddingNew(false); }}
                    >
                        <Grid size={20} /> Library
                    </button>
                    
                    <button 
                        className={`nav-item ${isActive('list') ? 'active' : ''}`} 
                        onClick={() => { setView('list'); setIsAddingNew(false); }}
                    >
                        <List size={20} /> List View
                    </button>

                    {/* FIXED: Changed activeTab to view and setActiveTab to setView */}
                    <button 
                        className={`nav-item ${view === 'vault' ? 'active' : ''}`}
                        onClick={() => { setView('vault'); setIsAddingNew(false); }}
                    >
                        <Database size={20} /> File storage
                    </button>

                    <button className="nav-item add-btn" onClick={handleAddNew}>
                        <PlusCircle size={20} /> Add Entry
                    </button>
                </div>

                {/* Settings at the bottom */}
                <button 
                    className="nav-item" 
                    onClick={() => setShowSettings(true)}
                    style={{ marginTop: 'auto' }}
                >
                    <Settings size={20} /> Configuration
                </button>
            </nav>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="content-wrapper">
                
                {view === 'about' && <CompendiumView libraryId={activeLibraryId} />}
                
                {view === 'list' && (
                    <EntryListController 
                        libraryId={activeLibraryId}
                        isAddingNew={isAddingNew}
                        onAddComplete={() => setIsAddingNew(false)}
                        onAddNew={() => setIsAddingNew(true)} 
                    />
                )}

                {/* FIXED: Changed activeTab to view */}
                {view === 'vault' && (
                    <VaultController />
                )}
                
                {view === 'library' && (
                    <LibraryGridController 
                        libraryId={activeLibraryId} 
                        onSelectSeries={handleSelectSeries} 
                    />
                )}
                
                {view === 'series_detail' && selectedSeries && (
                    <SeriesDetailController 
                        entry={selectedSeries} 
                        onBack={() => setView('library')} 
                    />
                )}
            </main>

            {/* --- MODALS --- */}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        </div>
    );
}

export default App;