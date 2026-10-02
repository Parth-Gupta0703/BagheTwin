import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface JuryDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onSelectWell: (wellCode: string) => void;
  onResetDemo?: () => void;
}

export const JuryDemoModal: React.FC<JuryDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectWell,
  onResetDemo,
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: '01 Field Overview',
      phase: 'STAGE 01 / 08',
      tab: 'command-center',
      well: 'BGW-007',
      description: 'Fleet surveillance across 12 synthetic well archetypes in Rajasthan Basin.',
      speakerScript:
        '"Honorable Jury, welcome to BagheTwin. Notice our global governance header: the system operates strictly in Simulation Mode on synthetic demonstration data. We monitor a 12-well heavy crude fleet in the Baghewala Jodhpur Sandstone formation."',
      focusHighlight: '12 SYNTHETIC WELLS • 100% LABELLED DEMO • NO DIRECT PHYSICAL ACTUATION',
      actionLabel: 'Select Well BGW-007',
    },
    {
      step: 2,
      title: '02 Select BGW-007',
      phase: 'STAGE 02 / 08',
      tab: 'well-explorer',
      well: 'BGW-007',
      description: 'Isolate primary demonstration well BGW-007 exhibiting acute mechanical distress.',
      speakerScript:
        '"We select our focal demonstration well: BGW-007. BGW-007 is in a late thermal cooling phase, flagged as CRITICAL. Notice its high pumping speed against cold, highly viscous crude."',
      focusHighlight: 'FOCAL TARGET: BGW-007 (CRITICAL ARCHETYPE: HIGH FLOATING RISK)',
      actionLabel: 'Inspect Digital Twin',
    },
    {
      step: 3,
      title: '03 Digital Twin Causal Flow',
      phase: 'STAGE 03 / 08',
      tab: 'digital-twin',
      well: 'BGW-007',
      description: 'Coupled causal flow from steam thermodynamics to downhole mechanical risk.',
      speakerScript:
        '"In our Digital Twin workspace, our 8-stage causal chain reveals the multi-physics coupling: Heat has decayed to 49.0°C. Crude viscosity has surged to 12,089 cP, causing 44.6 kN downstroke drag opposing rod string descent."',
      focusHighlight: 'CAUSAL CHAIN: STEAM → TEMP (49°C) → VISCOSITY (12,089 cP) → DRAG (44.6 kN) → MARGIN (<2 kN)',
      actionLabel: 'Inspect SRP Kinematics',
    },
    {
      step: 4,
      title: '04 SRP Kinematic Diagnosis',
      phase: 'STAGE 04 / 08',
      tab: 'srp-optimizer',
      well: 'BGW-007',
      description: 'Dynacard diagnostic shows downstroke drag depressing minimum load to 1.35 kN.',
      speakerScript:
        '"The surface dynamometer card confirms carrier-bar separation risk: downstroke viscous shear prevents the sucker rod string from falling at pump stroke speed."',
      focusHighlight: 'SAFETY BREACH: FLOATING MARGIN IS 1.35 kN (BELOW 2.0 kN SAFETY FLOOR)',
      actionLabel: 'Evaluate CSS Thermal Slug',
    },
    {
      step: 5,
      title: '05 CSS Thermal Sizing',
      phase: 'STAGE 05 / 08',
      tab: 'css-optimizer',
      well: 'BGW-007',
      description: 'Thermal stimulation sizing under caprock fracture pressure constraints.',
      speakerScript:
        '"In the CSS Optimizer, sizing Cycle 5 to 2,200 tonnes @ 85 bar collapses crude viscosity from 12,089 cP to 185 cP without violating the 100 bar geomechanical boundary."',
      focusHighlight: 'THERMAL RECOVERY: CRUDE VISCOSITY DROPS TO 185 cP • PRESSURE SAFE (< 100 BAR)',
      actionLabel: 'Joint Multi-Physics Optimization',
    },
    {
      step: 6,
      title: '06 Joint Pareto Optimization',
      phase: 'STAGE 06 / 08',
      tab: 'before-after',
      well: 'BGW-007',
      description: 'Multi-objective search simultaneously tunes CSS steam slug and SRP kinematics.',
      speakerScript:
        '"The Joint Optimizer evaluates Pareto candidates: 22 candidates are automatically rejected due to safety violations, leaving the optimal recommendation: slow SPM to 4.8, stroke 144", and size Cycle 5 steam."',
      focusHighlight: 'PARETO OPTIMAL: +24.2 BOPD • MARGIN RESTORED TO 5.15 kN • HARD SAFETY ENFORCED',
      actionLabel: 'Verify Risk & Reliability',
    },
    {
      step: 7,
      title: '07 Risk Matrix & Anomaly Test',
      phase: 'STAGE 07 / 08',
      tab: 'risk-reliability',
      well: 'BGW-007',
      description: 'Continuous monitoring of structural, thermal, and mechanical safety thresholds.',
      speakerScript:
        '"Our Risk & Reliability matrix tracks all safety boundaries. Red is strictly reserved for critical violations, giving control room operators clear signal without alarm fatigue."',
      focusHighlight: 'SEMANTIC SAFETY: RED FOR HARD LIMITS ONLY • LIVE TELEMETRY ANOMALY TESTING',
      actionLabel: 'Audit Trail & Provenance',
    },
    {
      step: 8,
      title: '08 Audit Trail & Governance',
      phase: 'STAGE 08 / 08',
      tab: 'provenance',
      well: 'BGW-007',
      description: 'Complete data provenance, model equations, and human-in-the-loop audit logging.',
      speakerScript:
        '"Every recommendation and operator action is cryptographically logged in our immutable Audit Trail. All physics models and synthetic benchmark data sources are fully documented for jury verification."',
      focusHighlight: 'FULL TRANSPARENCY: AUDIT LOGGED • GOVERNANCE DOCUMENTED • VERIFIED DETERMINISTIC',
      actionLabel: 'Return to Command Center',
    },
  ];

  const currentStep = steps[step - 1];

  const handleNext = () => {
    if (step < steps.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      onNavigateTab(steps[nextStep - 1].tab);
      onSelectWell(steps[nextStep - 1].well);
    } else {
      onNavigateTab('command-center');
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      onNavigateTab(steps[prevStep - 1].tab);
      onSelectWell(steps[prevStep - 1].well);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#172033]/60 backdrop-blur-xs flex flex-col p-4 md:p-8 font-sans select-none overflow-hidden">
      {/* Top Bar of Modal */}
      <div className="bg-white border border-[#E2E8F0] rounded-t-xl px-6 py-4 flex items-center justify-between shrink-0 shadow-sm max-w-5xl w-full mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#0E9F9A]/10 text-[#0E9F9A] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#172033]">
              BagheTwin Guided Jury Demonstration
            </h1>
            <p className="text-xs text-[#64748B]">
              Step-by-step walkthrough of heavy oil digital twin capabilities
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-semibold text-[#D97706] bg-[#D97706]/10 border border-[#D97706]/20 px-2.5 py-1 rounded">
            DEMO • SYNTHETIC DATA
          </span>
          {onResetDemo && (
            <button
              onClick={() => {
                onResetDemo();
                setStep(1);
              }}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1] text-xs font-medium rounded cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#172033] rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="py-2.5 px-6 bg-[#F8FAFC] border-x border-[#E2E8F0] flex items-center justify-between overflow-x-auto gap-2 shrink-0 max-w-5xl w-full mx-auto">
        {steps.map((s) => (
          <button
            key={s.step}
            onClick={() => {
              setStep(s.step);
              onNavigateTab(s.tab);
              onSelectWell(s.well);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer whitespace-nowrap ${
              s.step === step
                ? 'bg-[#0E9F9A] text-white font-semibold shadow-sm'
                : s.step < step
                ? 'bg-white border border-[#CBD5E1] text-[#16A34A] font-medium'
                : 'bg-white border border-[#E2E8F0] text-[#64748B]'
            }`}
          >
            <span>{s.step}.</span>
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Main Focus Card */}
      <div className="flex-1 bg-white border border-[#E2E8F0] rounded-b-xl p-6 md:p-8 flex flex-col justify-between max-w-5xl w-full mx-auto shadow-lg overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <span className="text-[11px] font-bold text-[#0E9F9A] uppercase tracking-wider">
                {currentStep.phase}
              </span>
              <h2 className="text-xl font-bold text-[#172033] mt-0.5">
                {currentStep.title}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#64748B] uppercase block">TARGET VIEW</span>
              <span className="text-xs font-mono font-bold text-[#0E9F9A] uppercase">
                {currentStep.tab}
              </span>
            </div>
          </div>

          {/* Focal Highlight Badge */}
          <div className="p-3 bg-[#F0FDFA] border border-[#0E9F9A]/30 text-xs font-mono font-bold text-[#0E9F9A] text-center rounded-md">
            {currentStep.focusHighlight}
          </div>

          {/* Description */}
          <p className="text-sm text-[#172033] leading-relaxed">
            {currentStep.description}
          </p>

          {/* Teleprompter / Speaker Script */}
          <div className="p-4 bg-[#F8FAFC] border-l-4 border-[#0E9F9A] rounded-r-md space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E9F9A] block">
              SPEAKER PRESENTATION SCRIPT (WHAT TO SAY TO JURY):
            </span>
            <p className="text-sm text-[#172033] italic leading-relaxed font-serif">
              {currentStep.speakerScript}
            </p>
          </div>
        </div>

        {/* Modal Controls Footer */}
        <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between gap-4 text-xs font-medium">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-md border ${
              step === 1
                ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                : 'border-[#CBD5E1] bg-white text-[#172033] hover:bg-[#F8FAFC] cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="text-[#64748B]">
            Step {step} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#0E9F9A] hover:bg-[#0C8984] text-white font-semibold rounded-md shadow-sm cursor-pointer active:scale-95"
          >
            <span>{currentStep.actionLabel}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
