import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { JuryDemoModal } from './components/JuryDemoModal';
import { CommandCenter } from './pages/CommandCenter';
import { WellExplorer } from './pages/WellExplorer';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { CSSOptimizerPage } from './pages/CSSOptimizerPage';
import { SRPOptimizerPage } from './pages/SRPOptimizerPage';
import { ScenarioLabPage } from './pages/ScenarioLabPage';
import { RiskReliabilityPage } from './pages/RiskReliabilityPage';
import { ForecastsPage } from './pages/ForecastsPage';
import { BeforeAfterPage } from './pages/BeforeAfterPage';
import { LiveOperationsPage } from './pages/LiveOperationsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { ProvenancePage } from './pages/ProvenancePage';

import { api } from './services/api';
import { WellSummary, DigitalTwinState, DynacardData } from './types';

const TAB_TITLES: Record<string, string> = {
  'command-center': 'Command Center',
  'well-explorer': 'Well Explorer',
  'digital-twin': 'Digital Twin',
  'css-optimizer': 'CSS Optimizer',
  'srp-optimizer': 'SRP Optimizer',
  'scenario-lab': 'Scenario Lab',
  'risk-reliability': 'Risk & Reliability',
  'forecasts': 'Forecasts & Trajectories',
  'before-after': 'Before vs After Optimization',
  'live-ops': 'Live Operations & Telemetry',
  'audit-trail': 'Audit Trail',
  'provenance': 'Model & Data Provenance',
};

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('command-center');
  const [selectedWellCode, setSelectedWellCode] = useState<string>('BGW-007');
  const [wells, setWells] = useState<WellSummary[]>([]);
  const [twinState, setTwinState] = useState<DigitalTwinState | null>(null);
  const [dynacard, setDynacard] = useState<DynacardData | null>(null);
  const [isJuryDemoOpen, setIsJuryDemoOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFleet = async () => {
    try {
      const data = await api.getWells();
      setWells(data);
    } catch (e) {
      console.error('Failed to load fleet', e);
    }
  };

  const fetchWellState = async (code: string) => {
    try {
      const [state, card] = await Promise.all([
        api.getWellState(code),
        api.getDynacard(code),
      ]);
      setTwinState(state);
      setDynacard(card);
    } catch (e) {
      console.error('Failed to load well state', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await api.resetDemo();
      await fetchFleet();
      await fetchWellState(selectedWellCode);
    } catch (e) {
      console.error('Demo reset error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  useEffect(() => {
    fetchWellState(selectedWellCode);
  }, [selectedWellCode]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F5F7FA] text-[#172033] overflow-hidden select-none font-sans">
      {/* 1. Global Top Command Bar */}
      <Header
        wells={wells}
        selectedWellCode={selectedWellCode}
        setSelectedWellCode={setSelectedWellCode}
        onLaunchJuryDemo={() => setIsJuryDemoOpen(true)}
        onResetDemo={handleResetDemo}
        currentTabTitle={TAB_TITLES[currentTab] || 'Command Center'}
      />

      {/* 2. Main Workstation Area: Sidebar + Active Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigator */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        {/* Center / Right Active Operational Viewport */}
        <main className="flex-1 bg-[#F5F7FA] p-4 lg:p-6 overflow-y-auto overflow-x-hidden">
          {loading || !twinState || !dynacard ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 text-sm text-[#64748B]">
              <div className="w-8 h-8 border-2 border-[#0E9F9A] border-t-transparent rounded-full animate-spin" />
              <div className="font-mono text-xs">
                Synchronizing BagheTwin Multi-Physics Model Vector...
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'command-center' && (
                <CommandCenter
                  wells={wells}
                  selectedWellCode={selectedWellCode}
                  onSelectWell={setSelectedWellCode}
                  onNavigateTab={setCurrentTab}
                  onLaunchJuryDemo={() => setIsJuryDemoOpen(true)}
                  twinState={twinState}
                />
              )}
              {currentTab === 'well-explorer' && (
                <WellExplorer
                  wells={wells}
                  selectedWellCode={selectedWellCode}
                  onSelectWell={setSelectedWellCode}
                  onNavigateTab={setCurrentTab}
                />
              )}
              {currentTab === 'digital-twin' && (
                <DigitalTwinPage
                  twinState={twinState}
                  dynacard={dynacard}
                  onNavigateTab={setCurrentTab}
                />
              )}
              {currentTab === 'css-optimizer' && (
                <CSSOptimizerPage twinState={twinState} />
              )}
              {currentTab === 'srp-optimizer' && (
                <SRPOptimizerPage twinState={twinState} dynacard={dynacard} />
              )}
              {currentTab === 'scenario-lab' && (
                <ScenarioLabPage twinState={twinState} />
              )}
              {currentTab === 'risk-reliability' && (
                <RiskReliabilityPage
                  twinState={twinState}
                  onNavigateTab={setCurrentTab}
                />
              )}
              {currentTab === 'forecasts' && (
                <ForecastsPage twinState={twinState} />
              )}
              {currentTab === 'before-after' && (
                <BeforeAfterPage
                  twinState={twinState}
                  onRefreshTwinState={() => fetchWellState(selectedWellCode)}
                  onNavigateTab={setCurrentTab}
                />
              )}
              {(currentTab === 'live-ops' || currentTab === 'anomaly-detection') && (
                <LiveOperationsPage
                  twinState={twinState}
                  onRefreshTwinState={() => fetchWellState(selectedWellCode)}
                />
              )}
              {currentTab === 'audit-trail' && <AuditTrailPage />}
              {currentTab === 'provenance' && <ProvenancePage />}
            </>
          )}
        </main>
      </div>

      {/* 3. Dedicated 5-Minute Jury Demo Modal */}
      <JuryDemoModal
        isOpen={isJuryDemoOpen}
        onClose={() => setIsJuryDemoOpen(false)}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
        }}
        onSelectWell={setSelectedWellCode}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
}

export default App;
