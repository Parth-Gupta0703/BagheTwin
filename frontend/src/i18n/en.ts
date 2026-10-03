// English translations for BagheTwin
// All user-facing strings are centralized here

export const en = {
  // App name
  appName: 'BagheTwin',
  appSubtitle: 'Well-to-Surface Digital Twin',
  appTagline: 'Heavy Oil Digital Twin',
  appValueProp: 'Monitor wells → Detect anomalies → Explain causes → Recommend interventions → Simulate outcomes',

  // Navigation — includes narrative pipeline labels
  nav: {
    home: 'Command Center',
    wells: 'Well Fleet',
    recommendations: 'Recommendations',
    simulate: 'Simulate',
    history: 'Audit Trail',
    more: 'More',
    digitalTwin: 'Digital Twin',
    cssOptimizer: 'CSS Optimizer',
    srpOptimizer: 'SRP Optimizer',
    riskReliability: 'Risk & Reliability',
    forecasts: 'Forecasts',
    scenarioLab: 'Scenario Lab',
    liveOperations: 'Live Operations',
    provenance: 'Model & Data',
    beforeAfter: 'Before vs After',
  },

  // Narrative pipeline stages — used across all pages
  pipeline: {
    detect: 'Detect',
    explain: 'Explain',
    recommend: 'Recommend',
    simulate: 'Simulate',
    optimize: 'Optimize',
    detectDesc: 'Identify wells requiring attention',
    explainDesc: 'Understand the root cause',
    recommendDesc: 'Generate safe intervention',
    simulateDesc: 'Validate before execution',
    optimizeDesc: 'Achieve safer operating state',
  },

  // Mode
  mode: {
    operator: 'Operator',
    engineer: 'Engineer',
  },

  // Status
  status: {
    normal: 'Normal',
    attention: 'Attention',
    critical: 'Critical',
    healthy: 'Healthy',
    warning: 'Warning',
  },

  // Home page
  home: {
    welcome: 'Welcome',
    goodMorning: 'Good morning',
    currentStatus: 'Here is the current well status.',
    wellsMonitored: 'Wells Monitored',
    criticalCount: 'Critical',
    attentionCount: 'Need Attention',
    normalCount: 'Normal',
    viewCriticalWell: 'View Critical Well',
    priorityWell: 'Priority Well — Immediate Attention Required',
    recentActivity: 'Recent Activity',
    wellStatus: 'Fleet Status',
    viewAll: 'View All',
    startGuidedDemo: 'Start Guided Demo',
    quickDemo: 'Guided Walkthrough',
    fleetSummary: 'Fleet Health Summary',
    openDigitalTwin: 'Open Digital Twin',
    viewInSimulation: 'Review in Simulation',
  },

  // Three-step explanation
  explain: {
    whatHappened: 'What Happened?',
    why: 'Why?',
    whatToDo: 'What Should I Do?',
    showEngineering: 'Show Engineering Details',
    hideEngineering: 'Hide Engineering Details',
    technicalDetails: 'Technical Details',
    whyDoesThisMatter: 'Why does this matter?',
    whatIsThis: 'What is this?',
  },

  // Well-specific operator-friendly explanations
  wellExplain: {
    rodFloatingRisk: 'Rod movement problem',
    rodFloatingDesc: 'Rod movement is becoming unstable.',
    rodFloatingWhy: 'Temperature decline is increasing viscosity and rod drag.',
    rodFloatingAction: 'Review the recommended intervention in Simulation.',
    highViscosity: 'Fluid too thick',
    highViscosityDesc: 'The oil has become very thick and resistant to flow.',
    thermalDecline: 'Heat is reducing',
    thermalDeclineDesc: 'The reservoir temperature is dropping, making the oil thicker.',
    highRodLoading: 'High equipment stress',
    highRodLoadingDesc: 'The pump rod is under high mechanical stress.',
    highSOR: 'Too much steam used',
    highSORDesc: 'The well is using more steam than expected for the oil produced.',
    pumpIssue: 'Pump not efficient',
    pumpIssueDesc: 'The pump is not working at full capacity.',
    thermalOpportunity: 'Ready for re-steam',
    thermalOpportunityDesc: 'This well could benefit from a new steam injection cycle.',
  },

  // Causal chain
  causal: {
    currentCondition: 'Current Condition',
    expectedIntervention: 'Expected Intervention Effect',
    steam: 'Steam',
    heat: 'Heat',
    lowerViscosity: 'Lower Viscosity',
    betterFlow: 'Better Flow',
    lowerRodDrag: 'Lower Rod Drag',
    lowerFloatingRisk: 'Lower Floating Risk',
    betterProduction: 'Better Production',
    // Current condition chain
    tempDown: 'Temperature ↓',
    viscUp: 'Viscosity ↑',
    dragUp: 'Rod Drag ↑',
    marginDown: 'Floating Margin ↓',
    riskUp: 'Mechanical Risk ↑',
    // Intervention chain
    steamInject: 'Steam / Thermal',
    tempUp: 'Temperature ↑',
    viscDown: 'Viscosity ↓',
    dragDown: 'Rod Drag ↓',
    marginUp: 'Floating Margin ↑',
    improved: 'Improved Envelope',
  },

  // Recommendations
  rec: {
    title: 'Recommendations',
    subtitle: 'Suggested actions for your wells',
    recommendedAction: 'Recommended Action',
    expectedEffect: 'Expected Effect',
    review: 'Review',
    approve: 'Approve',
    reject: 'Reject',
    acknowledge: 'Acknowledge',
    simulationIndicates: 'Simulation indicates',
    potentialImprovement: 'Potential improvement',
    lowerMechRisk: 'Lower mechanical risk',
    stableRodMovement: 'Stable rod movement',
    improvedEfficiency: 'Potentially improved operating efficiency',
    noRecommendations: 'No active recommendations at this time.',
    allWellsNormal: 'All monitored wells are within current safety limits.',
    whyThisRec: 'Why This Recommendation?',
    primaryDriver: 'Primary Driver',
    safetyConstraint: 'Active Safety Constraint',
    optimizationObj: 'Optimization Objective',
    safetyCheck: 'Safety Check',
    expectedImpact: 'Expected Impact',
    reviewInSim: 'Review in Simulation',
    reviewNote: 'Recommendations are reviewed before field execution. This system provides decision support only.',
  },

  // Wells page
  wells: {
    title: 'Well Fleet',
    subtitle: 'Status of all monitored wells',
    search: 'Search wells...',
    filterAll: 'All',
    filterCritical: 'Critical',
    filterAttention: 'Attention',
    filterNormal: 'Normal',
    viewDetails: 'View Details',
    temperature: 'Temperature',
    viscosity: 'Viscosity',
    production: 'Production',
    rodDrag: 'Rod Drag',
    floatingMargin: 'Floating Margin',
    risk: 'Risk',
    riskScore: 'Risk Score',
    srpSpeed: 'SRP Speed',
  },

  // Simulation
  sim: {
    title: 'Simulate',
    subtitle: 'Test changes before applying them',
    current: 'Current',
    recommended: 'Recommended',
    runSimulation: 'Run Simulation',
    reviewSimulation: 'Review in Simulation',
    comparing: 'Comparing',
    currentVsRecommended: 'Current vs Recommended',
    whyThisChange: 'Why this change?',
  },

  // Digital Twin
  twin: {
    title: 'Digital Twin',
    subtitle: 'Real-time well model',
    liveState: 'Live State',
    wellProfile: 'Well Profile',
    causeEffect: 'Cause → Effect Chain',
    currentChain: 'Current Condition',
    interventionChain: 'Expected Intervention Effect',
  },

  // History / Audit
  history: {
    title: 'Audit Trail',
    subtitle: 'Operational event log',
    noEvents: 'No events recorded yet.',
    exportJSON: 'Export JSON',
    refresh: 'Refresh',
  },

  // Tooltips for technical terms
  tooltips: {
    spm: 'Strokes Per Minute — how fast the pump rod moves up and down.',
    vfd: 'Variable Frequency Drive — controls the motor speed electronically.',
    sor: 'Steam-Oil Ratio — how much steam is needed per barrel of oil. Lower is better.',
    pprl: 'Peak Polished Rod Load — the maximum upward pull on the rod string.',
    mprl: 'Minimum Polished Rod Load — the lowest load during the downstroke.',
    floatingMargin: 'The safety margin preventing the rod from floating upward uncontrollably. Below 2.0 kN is dangerous.',
    viscosity: 'How thick/resistant the fluid is. Higher means harder to pump.',
    pumpFillage: 'How full the pump barrel gets each stroke. Higher means better pump efficiency.',
    ood: 'Out-of-Domain — the input values are outside the range the model was trained on.',
    surrogate: 'A fast mathematical model trained to approximate complex physics calculations.',
    css: 'Cyclic Steam Stimulation — injecting steam to heat the oil and reduce its thickness.',
    srp: 'Sucker Rod Pump — mechanical pump system that lifts oil to the surface.',
    api: 'American Petroleum Institute — a standard measurement of oil density.',
    temperature: 'The reservoir temperature near the wellbore. Higher temperature means thinner oil.',
    pressure: 'The force per area in the reservoir or wellbore. Affects flow rates.',
    dragForce: 'The friction force resisting the rod movement, mainly from thick oil.',
    rodStress: 'How close the rod load is to the maximum safe limit.',
  },

  // Operator-friendly terminology mapping
  operatorTerms: {
    floatingMargin: 'Rod safety margin',
    rodFloatingRisk: 'Rod movement problem',
    viscosity: 'Fluid thickness',
    dragForce: 'Flow resistance force',
    pprl: 'Maximum rod pull',
    mprl: 'Minimum rod load',
    sor: 'Steam efficiency',
    pumpFillage: 'Pump fill level',
    overallRiskScore: 'Overall risk level',
  },

  // Common actions
  actions: {
    viewProblem: 'View Problem',
    viewRecommendation: 'See Recommendation',
    viewDetails: 'View Details',
    back: 'Back',
    next: 'Next',
    close: 'Close',
    skip: 'Skip',
    start: 'Start',
    reset: 'Reset',
    tryAgain: 'Try again',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    export: 'Export',
  },

  // Guided demo — 7-step jury workflow
  demo: {
    title: 'Guided Demo',
    quickTitle: 'Jury Walkthrough',
    step1: 'Monitor Fleet',
    step2: 'Identify Priority Well',
    step3: 'Explain Root Cause',
    step4: 'Generate Recommendation',
    step5: 'Validate Intervention',
    step6: 'Run Simulation',
    step7: 'Confirm Safer State',
    demoSynthetic: 'DEMO • SYNTHETIC DATA',
    startDemo: 'Start Guided Demo',
    step1q: 'What is happening across the fleet?',
    step2q: 'Which well needs attention?',
    step3q: 'Why is it happening?',
    step4q: 'What should we do?',
    step5q: 'Is the intervention safe?',
    step6q: 'What happens if we apply it?',
    step7q: 'Did the well move into a safer state?',
  },

  // Onboarding
  onboarding: {
    screen1Title: 'Monitor your wells',
    screen1Desc: 'See the real-time status of all your oil wells in one place.',
    screen2Title: 'Understand problems',
    screen2Desc: 'Get clear explanations of what is happening and why.',
    screen3Title: 'Take safer actions',
    screen3Desc: 'Follow data-driven recommendations checked for safety.',
  },

  // Error states
  errors: {
    loadFailed: 'Unable to load well data.',
    tryAgain: 'Please try again.',
    connectionError: 'Connection error. Working with offline data.',
    unknownError: 'Something went wrong.',
  },

  // Empty states
  empty: {
    noCritical: 'No critical wells right now.',
    allNormal: 'All monitored wells are within the current safety limits.',
    noData: 'No data available.',
    noAlerts: 'No active alerts.',
  },

  // Provenance
  provenance: {
    dataSource: 'Data Source',
    synthetic: 'Synthetic / Simulated',
    fieldValidation: 'Field Validation',
    notYetValidated: 'Not yet validated',
    control: 'Control',
    decisionSupportOnly: 'Decision Support Only',
  },

  // Units (kept in English)
  units: {
    celsius: '°C',
    cp: 'cP',
    kn: 'kN',
    bopd: 'BOPD',
    bar: 'bar',
    meters: 'm',
    inches: 'in',
    kwh: 'kWh',
    spm: 'SPM',
    hz: 'Hz',
    tonnes: 't',
    pct: '%',
  },

  // Fleet overview labels
  fleet: {
    rajasthanField: 'Rajasthan Heavy Oil Field',
    syntheticDemo: 'Synthetic Demo Data',
    monitoredRealtime: 'Monitored in real-time',
    normalEnvelope: 'Normal operating range',
    thermalWatch: 'Thermal or mechanical watch',
    actionRequired: 'Action required',
  },
};

type DeepRecordString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepRecordString<T[K]>;
};

export type TranslationKeys = DeepRecordString<typeof en>;
