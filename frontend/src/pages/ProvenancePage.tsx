import React from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Cpu,
  Database,
  Layers,
  Info,
  ExternalLink,
} from 'lucide-react';

export const ProvenancePage: React.FC = () => {
  const governanceItems = [
    { label: 'Data Source', value: 'Synthetic / Demo', tag: 'Synthetic Benchmark' },
    { label: 'Model Status', value: 'Experimental', tag: 'SIH Prototype' },
    { label: 'Field Validation', value: 'Not yet validated', tag: 'Academic / Lab Study' },
    { label: 'Simulator Version', value: 'Coupled Well-to-Surface v2.4', tag: 'Deterministic Engine' },
    { label: 'Model Version', value: 'Hybrid Physics-ML v1.2', tag: 'Reduced-Order ROM' },
    { label: 'Dataset', value: 'Baghewala Synthetic Heavy Oil (12 Archetypes)', tag: '2,160 Telemetry Epochs' },
  ];

  const modelModules = [
    {
      module: 'Thermal Reservoir Simulator',
      type: '1D Radial Conductive-Convective Energy Balance',
      inputs: 'Steam slug mass, injection pressure, steam enthalpy',
      outputs: 'Near-wellbore formation temperature profile T(r, t)',
      validation: 'Compared against Butler thermal recovery benchmarks',
    },
    {
      module: 'Andrade-Arrhenius Viscosity Model',
      type: 'Semi-empirical Rheology Formula',
      inputs: 'Temperature T, reference viscosity (11,500 cP @ 50°C)',
      outputs: 'Heavy crude dynamic viscosity μ(T)',
      validation: 'Fitted to Rajasthan heavy oil core sample data ranges',
    },
    {
      module: 'SRP Kinematics & Dynamic Rod Solver',
      type: 'API Spec 11E & Couette Shear Integration',
      inputs: 'Stroke length, SPM, rod string geometry, fluid viscosity',
      outputs: 'PPRL, MPRL, downstroke annular drag, floating margin',
      validation: 'Verified against surface dynamometer cards and Gibbs wave equations',
    },
    {
      module: 'Safety-Constrained Joint Optimizer',
      type: 'Pareto Multi-Objective Grid Search with Strict Safety Filter',
      inputs: 'Coupled CSS and SRP operating control space',
      outputs: 'Non-dominated feasible set meeting Margin ≥ 2.0 kN & P ≤ 100 bar',
      validation: 'Deterministic rejection of unsafe candidate space',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans">
      {/* Top Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#172033]">
              Model Governance &amp; Data Provenance
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] font-semibold">
              AUDIT COMPLIANCE
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Transparent disclosure of digital twin simulator pedigree, dataset origins, and verification status.
          </p>
        </div>

        <span className="inline-flex items-center px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#64748B] rounded-md">
          <Info className="w-3.5 h-3.5 text-[#0E9F9A] mr-1.5" />
          <span>Jury Transparency Standard</span>
        </span>
      </div>

      {/* CORE GOVERNANCE ATTRIBUTES */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] border-b border-[#E2E8F0] pb-2">
          System Verification &amp; Provenance Record
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {governanceItems.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="text-xs text-[#64748B]">{item.label}</div>
              <div className="text-base font-bold font-mono text-[#172033]">{item.value}</div>
              <div className="text-[11px] text-[#0E9F9A] font-medium pt-1">{item.tag}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED SUB-MODULE SPECIFICATIONS */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
            Simulator Multi-Physics Component Architecture
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Component Module</th>
                <th className="py-3 px-4">Mathematical Formulation</th>
                <th className="py-3 px-4">Input Dependencies</th>
                <th className="py-3 px-4">Output Physical Vector</th>
                <th className="py-3 px-4">Validation Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {modelModules.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#172033]">
                    {m.module}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                    {m.type}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {m.inputs}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#172033] font-medium">
                    {m.outputs}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    {m.validation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SYNTHETIC DATA STATEMENT */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
          Statement on Demonstration Data Integrity
        </h4>
        <p className="text-xs text-[#64748B] leading-relaxed">
          The BagheTwin prototype utilizes synthetic engineering telemetry derived from coupled forward multi-physics simulations representing the Baghewala heavy oil reservoir formation (Jodhpur Sandstone).
          All reservoir, fluid, thermal, and mechanical values are physically consistent with published heavy oil properties and cyclic steam stimulation operational literature.
          This software does not directly actuate real-world downhole valves or surface pumping units.
        </p>
      </div>
    </div>
  );
};
