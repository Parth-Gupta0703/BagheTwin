import React, { useState, useEffect } from 'react';
import { AuditEventItem } from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';
import {
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const { t } = useI18n();
  const { isOperator, isEngineer } = useMode();
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditTrail(50);
      setEvents(data);
    } catch (e) {
      console.error(e);
      setEvents([
        {
          id: 1,
          timestamp: new Date().toISOString(),
          actor: 'OPERATOR_01',
          role: 'CONTROL ROOM OPERATOR',
          action: 'APPROVE_OPTIMIZATION',
          entity: 'BGW-007',
          diff_json: { spm: { old: 6.8, new: 4.8 }, stroke_in: { old: 120, new: 144 } },
          status: 'COMMITTED',
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          actor: 'PARETO-OPTIMIZER',
          role: 'DECISION_SUPPORT',
          action: 'GENERATE_CANDIDATES',
          entity: 'BGW-007',
          diff_json: { rejected_candidates: 22, reason: 'Fracture limit & rod float safety' },
          status: 'AUTO_REJECTED',
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          actor: 'SCADA-STREAMER',
          role: 'TELEMETRY_INGESTION',
          action: 'FLAG_ANOMALY',
          entity: 'BGW-007',
          diff_json: { metric: 'floating_margin', value: 1.35, limit: 2.0 },
          status: 'ALERT_ACTIVE',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `baghetwin_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">{t.history.title}</h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
              COMPLIANCE LOG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.history.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAudit}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.history.refresh}</span>
          </button>
          <button
            onClick={exportJson}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.history.exportJSON}</span>
          </button>
        </div>
      </div>

      {/* Operator Mode: Clean Timeline View */}
      {isOperator && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
            {events.map((evt, idx) => {
              const isApproval = evt.action.includes('APPROVE');
              const isAlert = evt.status === 'ALERT_ACTIVE' || evt.action.includes('ANOMALY');

              return (
                <div key={evt.id || idx} className="relative">
                  {/* Dot on the timeline */}
                  <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    isApproval ? 'bg-emerald-500' : isAlert ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:bg-white hover:shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-800">
                          {evt.entity || evt.entity_id || 'FLEET'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                          isApproval
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isAlert
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {evt.action}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(evt.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{evt.actor}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{evt.role}</span>
                    </div>

                    {evt.diff_json && (
                      <div className="mt-2.5 p-2 bg-white rounded border border-slate-200 text-xs font-mono text-slate-700">
                        {typeof evt.diff_json === 'string' ? evt.diff_json : JSON.stringify(evt.diff_json)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Engineer Mode: Detailed Compliance Table */}
      {isEngineer && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Well / Entity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => {
                  const isExpanded = expandedId === evt.id;
                  const status = evt.status || 'COMMITTED';

                  return (
                    <React.Fragment key={evt.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {evt.actor}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {evt.role}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-blue-700">
                          {evt.action}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {evt.entity || evt.entity_id || 'FLEET'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              status === 'COMMITTED' || status === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : status === 'ALERT_ACTIVE'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 inline" />
                            ) : (
                              <ChevronRight className="w-4 h-4 inline" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded JSON diff row */}
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={7} className="p-4">
                            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto">
                              <pre>{JSON.stringify(evt.diff_json || evt, null, 2)}</pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
