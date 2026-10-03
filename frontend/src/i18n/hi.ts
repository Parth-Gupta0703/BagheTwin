// Hindi translations for BagheTwin
// Using natural, field-worker-friendly Hindi (not overly formal/Sanskritised)

import type { TranslationKeys } from './en';

export const hi: TranslationKeys = {
  // App name (kept in English for brand)
  appName: 'BagheTwin',
  appSubtitle: 'कुआँ-से-सतह डिजिटल ट्विन',
  appTagline: 'भारी तेल डिजिटल ट्विन',
  appValueProp: 'कुओं की निगरानी → असामान्यता पहचानें → कारण समझें → सुझाव दें → नतीजा जाँचें',

  // Navigation
  nav: {
    home: 'कमांड सेंटर',
    wells: 'कुएँ',
    recommendations: 'सुझाव',
    simulate: 'सिमुलेशन',
    history: 'ऑडिट ट्रेल',
    more: 'और देखें',
    digitalTwin: 'डिजिटल ट्विन',
    cssOptimizer: 'CSS ऑप्टिमाइज़र',
    srpOptimizer: 'SRP ऑप्टिमाइज़र',
    riskReliability: 'जोखिम और विश्वसनीयता',
    forecasts: 'पूर्वानुमान',
    scenarioLab: 'परिदृश्य लैब',
    liveOperations: 'लाइव परिचालन',
    provenance: 'मॉडल और डेटा',
    beforeAfter: 'पहले बनाम बाद',
  },

  // Narrative pipeline stages
  pipeline: {
    detect: 'पहचानें',
    explain: 'समझें',
    recommend: 'सुझाव',
    simulate: 'जाँचें',
    optimize: 'सुधारें',
    detectDesc: 'ध्यान देने वाले कुओं की पहचान करें',
    explainDesc: 'मूल कारण समझें',
    recommendDesc: 'सुरक्षित कार्रवाई तैयार करें',
    simulateDesc: 'लागू करने से पहले जाँचें',
    optimizeDesc: 'सुरक्षित स्थिति में लाएँ',
  },

  // Mode
  mode: {
    operator: 'ऑपरेटर',
    engineer: 'इंजीनियर',
  },

  // Status
  status: {
    normal: 'सामान्य',
    attention: 'ध्यान दें',
    critical: 'गंभीर',
    healthy: 'ठीक है',
    warning: 'चेतावनी',
  },

  // Home page
  home: {
    welcome: 'स्वागत है',
    goodMorning: 'नमस्ते',
    currentStatus: 'कुओं की मौजूदा स्थिति यहाँ देखें।',
    wellsMonitored: 'निगरानी में कुएँ',
    criticalCount: 'गंभीर',
    attentionCount: 'ध्यान चाहिए',
    normalCount: 'सामान्य',
    viewCriticalWell: 'गंभीर कुआँ देखें',
    priorityWell: 'प्राथमिक कुआँ — तुरंत ध्यान चाहिए',
    recentActivity: 'हाल की गतिविधि',
    wellStatus: 'बेड़े की स्थिति',
    viewAll: 'सब देखें',
    startGuidedDemo: 'गाइडेड डेमो शुरू करें',
    quickDemo: 'गाइडेड वॉकथ्रू',
    fleetSummary: 'बेड़े की स्वास्थ्य स्थिति',
    openDigitalTwin: 'डिजिटल ट्विन देखें',
    viewInSimulation: 'सिमुलेशन में देखें',
  },

  // Three-step explanation
  explain: {
    whatHappened: 'क्या हुआ?',
    why: 'क्यों?',
    whatToDo: 'क्या करना चाहिए?',
    showEngineering: 'तकनीकी जानकारी देखें',
    hideEngineering: 'तकनीकी जानकारी छुपाएँ',
    technicalDetails: 'तकनीकी विवरण',
    whyDoesThisMatter: 'यह क्यों ज़रूरी है?',
    whatIsThis: 'यह क्या है?',
  },

  // Well-specific operator-friendly explanations
  wellExplain: {
    rodFloatingRisk: 'रॉड चलने में समस्या',
    rodFloatingDesc: 'रॉड की हरकत अस्थिर हो रही है।',
    rodFloatingWhy: 'तापमान गिरने से गाढ़ापन और रॉड पर रगड़ बढ़ रही है।',
    rodFloatingAction: 'सिमुलेशन में सुझाई गई कार्रवाई की समीक्षा करें।',
    highViscosity: 'द्रव बहुत गाढ़ा',
    highViscosityDesc: 'तेल बहुत गाढ़ा हो गया है और बहना मुश्किल है।',
    thermalDecline: 'गर्मी कम हो रही है',
    thermalDeclineDesc: 'ज़मीन के अंदर का तापमान गिर रहा है, तेल और गाढ़ा हो रहा है।',
    highRodLoading: 'उपकरण पर ज़्यादा दबाव',
    highRodLoadingDesc: 'पंप की रॉड पर बहुत ज़्यादा मेकैनिकल दबाव है।',
    highSOR: 'भाप ज़्यादा लग रही है',
    highSORDesc: 'तेल की तुलना में ज़रूरत से ज़्यादा भाप इस्तेमाल हो रही है।',
    pumpIssue: 'पंप ठीक से काम नहीं कर रहा',
    pumpIssueDesc: 'पंप अपनी पूरी क्षमता से नहीं चल रहा।',
    thermalOpportunity: 'दोबारा भाप की ज़रूरत',
    thermalOpportunityDesc: 'इस कुएँ में नया भाप चक्र फ़ायदेमंद होगा।',
  },

  // Causal chain
  causal: {
    currentCondition: 'वर्तमान स्थिति',
    expectedIntervention: 'अपेक्षित हस्तक्षेप प्रभाव',
    steam: 'भाप',
    heat: 'गर्मी',
    lowerViscosity: 'कम गाढ़ापन',
    betterFlow: 'बेहतर बहाव',
    lowerRodDrag: 'कम रॉड रगड़',
    lowerFloatingRisk: 'कम फ्लोटिंग जोखिम',
    betterProduction: 'बेहतर उत्पादन',
    tempDown: 'तापमान ↓',
    viscUp: 'गाढ़ापन ↑',
    dragUp: 'रॉड रगड़ ↑',
    marginDown: 'सुरक्षा मार्जिन ↓',
    riskUp: 'मशीन जोखिम ↑',
    steamInject: 'भाप / तापीय',
    tempUp: 'तापमान ↑',
    viscDown: 'गाढ़ापन ↓',
    dragDown: 'रॉड रगड़ ↓',
    marginUp: 'सुरक्षा मार्जिन ↑',
    improved: 'बेहतर स्थिति',
  },

  // Recommendations
  rec: {
    title: 'सुझाव',
    subtitle: 'आपके कुओं के लिए सुझाई गई कार्रवाई',
    recommendedAction: 'सुझाई गई कार्रवाई',
    expectedEffect: 'अपेक्षित प्रभाव',
    review: 'समीक्षा करें',
    approve: 'स्वीकार करें',
    reject: 'अस्वीकार करें',
    acknowledge: 'पुष्टि करें',
    simulationIndicates: 'सिमुलेशन बताता है',
    potentialImprovement: 'संभावित सुधार',
    lowerMechRisk: 'मशीन को नुकसान का जोखिम कम',
    stableRodMovement: 'रॉड की स्थिर चाल',
    improvedEfficiency: 'बेहतर काम करने की संभावना',
    noRecommendations: 'इस समय कोई सक्रिय सुझाव नहीं है।',
    allWellsNormal: 'सभी कुएँ मौजूदा सुरक्षा सीमा में हैं।',
    whyThisRec: 'यह सुझाव क्यों?',
    primaryDriver: 'मुख्य कारण',
    safetyConstraint: 'सक्रिय सुरक्षा सीमा',
    optimizationObj: 'अनुकूलन लक्ष्य',
    safetyCheck: 'सुरक्षा जाँच',
    expectedImpact: 'अपेक्षित प्रभाव',
    reviewInSim: 'सिमुलेशन में समीक्षा करें',
    reviewNote: 'सुझाव लागू करने से पहले उनकी समीक्षा की जाती है। यह सिस्टम केवल निर्णय सहायता प्रदान करता है।',
  },

  // Wells page
  wells: {
    title: 'कुओं का बेड़ा',
    subtitle: 'सभी निगरानी में कुओं की स्थिति',
    search: 'कुआँ खोजें...',
    filterAll: 'सभी',
    filterCritical: 'गंभीर',
    filterAttention: 'ध्यान दें',
    filterNormal: 'सामान्य',
    viewDetails: 'विवरण देखें',
    temperature: 'तापमान',
    viscosity: 'गाढ़ापन',
    production: 'उत्पादन',
    rodDrag: 'रॉड रगड़',
    floatingMargin: 'फ्लोटिंग मार्जिन',
    risk: 'जोखिम',
    riskScore: 'जोखिम स्तर',
    srpSpeed: 'SRP गति',
  },

  // Simulation
  sim: {
    title: 'सिमुलेशन',
    subtitle: 'बदलाव लागू करने से पहले जाँचें',
    current: 'मौजूदा',
    recommended: 'सुझाई गई',
    runSimulation: 'सिमुलेशन चलाएँ',
    reviewSimulation: 'सिमुलेशन में देखें',
    comparing: 'तुलना',
    currentVsRecommended: 'मौजूदा बनाम सुझाई गई',
    whyThisChange: 'यह बदलाव क्यों?',
  },

  // Digital Twin
  twin: {
    title: 'डिजिटल ट्विन',
    subtitle: 'कुएँ का लाइव मॉडल',
    liveState: 'लाइव स्थिति',
    wellProfile: 'कुएँ का प्रोफ़ाइल',
    causeEffect: 'कारण → प्रभाव श्रृंखला',
    currentChain: 'वर्तमान स्थिति',
    interventionChain: 'अपेक्षित हस्तक्षेप प्रभाव',
  },

  // History / Audit
  history: {
    title: 'ऑडिट ट्रेल',
    subtitle: 'परिचालन की घटनाएँ',
    noEvents: 'अभी कोई घटना दर्ज नहीं है।',
    exportJSON: 'JSON निर्यात करें',
    refresh: 'ताज़ा करें',
  },

  // Tooltips for technical terms
  tooltips: {
    spm: 'स्ट्रोक प्रति मिनट — पंप रॉड कितनी तेज़ ऊपर-नीचे चलती है।',
    vfd: 'Variable Frequency Drive — मोटर की गति को इलेक्ट्रॉनिक तरीके से नियंत्रित करता है।',
    sor: 'भाप-तेल अनुपात — एक बैरल तेल के लिए कितनी भाप चाहिए। कम बेहतर है।',
    pprl: 'अधिकतम रॉड भार — रॉड पर ऊपर की ओर सबसे ज़्यादा खिंचाव।',
    mprl: 'न्यूनतम रॉड भार — नीचे जाते समय सबसे कम भार।',
    floatingMargin: 'रॉड को बेक़ाबू ऊपर जाने से रोकने का सुरक्षा मार्जिन। 2.0 kN से नीचे ख़तरनाक है।',
    viscosity: 'द्रव कितना गाढ़ा है। ज़्यादा गाढ़ा = पंप करना मुश्किल।',
    pumpFillage: 'हर स्ट्रोक में पंप कितना भरता है। ज़्यादा = बेहतर कुशलता।',
    ood: 'सीमा से बाहर — इनपुट वैल्यू उस रेंज से बाहर हैं जिस पर मॉडल ट्रेन हुआ था।',
    surrogate: 'जटिल फ़िज़िक्स गणना का तेज़ गणितीय अनुमान लगाने वाला मॉडल।',
    css: 'Cyclic Steam Stimulation — तेल गरम करके पतला करने के लिए भाप डालना।',
    srp: 'Sucker Rod Pump — तेल ऊपर लाने वाला मैकेनिकल पंप।',
    api: 'American Petroleum Institute — तेल के घनत्व का मानक माप।',
    temperature: 'कुएँ के पास ज़मीन का तापमान। ज़्यादा तापमान = पतला तेल।',
    pressure: 'ज़मीन या कुएँ में दबाव। बहाव की दर को प्रभावित करता है।',
    dragForce: 'रॉड की चाल को रोकने वाला घर्षण बल, मुख्यतः गाढ़े तेल से।',
    rodStress: 'रॉड का भार सुरक्षित सीमा के कितना क़रीब है।',
  },

  // Operator-friendly terminology mapping
  operatorTerms: {
    floatingMargin: 'रॉड सुरक्षा मार्जिन',
    rodFloatingRisk: 'रॉड चलने में समस्या',
    viscosity: 'द्रव का गाढ़ापन',
    dragForce: 'बहाव रोकने वाला बल',
    pprl: 'अधिकतम रॉड खिंचाव',
    mprl: 'न्यूनतम रॉड भार',
    sor: 'भाप कुशलता',
    pumpFillage: 'पंप भराव स्तर',
    overallRiskScore: 'कुल जोखिम स्तर',
  },

  // Common actions
  actions: {
    viewProblem: 'समस्या देखें',
    viewRecommendation: 'सुझाव देखें',
    viewDetails: 'विवरण देखें',
    back: 'पीछे',
    next: 'आगे',
    close: 'बंद करें',
    skip: 'छोड़ें',
    start: 'शुरू करें',
    reset: 'रीसेट',
    tryAgain: 'फिर कोशिश करें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सेव करें',
    export: 'निर्यात करें',
  },

  // Guided demo — 7-step jury workflow
  demo: {
    title: 'गाइडेड डेमो',
    quickTitle: 'जूरी वॉकथ्रू',
    step1: 'बेड़े की निगरानी',
    step2: 'प्राथमिक कुआँ पहचानें',
    step3: 'मूल कारण समझें',
    step4: 'सुझाव तैयार करें',
    step5: 'हस्तक्षेप की जाँच करें',
    step6: 'सिमुलेशन चलाएँ',
    step7: 'सुरक्षित स्थिति की पुष्टि',
    demoSynthetic: 'डेमो • सिंथेटिक डेटा',
    startDemo: 'गाइडेड डेमो शुरू करें',
    step1q: 'बेड़े में क्या हो रहा है?',
    step2q: 'किस कुएँ को ध्यान चाहिए?',
    step3q: 'ऐसा क्यों हो रहा है?',
    step4q: 'हमें क्या करना चाहिए?',
    step5q: 'क्या हस्तक्षेप सुरक्षित है?',
    step6q: 'लागू करने पर क्या होगा?',
    step7q: 'क्या कुआँ सुरक्षित स्थिति में आ गया?',
  },

  // Onboarding
  onboarding: {
    screen1Title: 'अपने कुओं की निगरानी करें',
    screen1Desc: 'सभी तेल कुओं की लाइव स्थिति एक जगह देखें।',
    screen2Title: 'समस्याएँ समझें',
    screen2Desc: 'क्या हो रहा है और क्यों — साफ़ भाषा में जानें।',
    screen3Title: 'सुरक्षित कदम उठाएँ',
    screen3Desc: 'सुरक्षा-जाँचे गए डेटा-आधारित सुझावों का पालन करें।',
  },

  // Error states
  errors: {
    loadFailed: 'कुएँ का डेटा लोड नहीं हो सका।',
    tryAgain: 'कृपया फिर कोशिश करें।',
    connectionError: 'कनेक्शन में समस्या। ऑफ़लाइन डेटा से काम चल रहा है।',
    unknownError: 'कुछ गड़बड़ हो गई।',
  },

  // Empty states
  empty: {
    noCritical: 'अभी कोई गंभीर कुआँ नहीं।',
    allNormal: 'सभी कुएँ मौजूदा सुरक्षा सीमा में हैं।',
    noData: 'कोई डेटा उपलब्ध नहीं।',
    noAlerts: 'कोई सक्रिय अलर्ट नहीं।',
  },

  // Provenance
  provenance: {
    dataSource: 'डेटा स्रोत',
    synthetic: 'सिंथेटिक / सिम्युलेटेड',
    fieldValidation: 'फ़ील्ड मान्यता',
    notYetValidated: 'अभी मान्य नहीं किया गया',
    control: 'नियंत्रण',
    decisionSupportOnly: 'केवल निर्णय सहायता',
  },

  // Units (kept in English — standard engineering units)
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
    rajasthanField: 'राजस्थान भारी तेल क्षेत्र',
    syntheticDemo: 'सिंथेटिक डेमो डेटा',
    monitoredRealtime: 'रियल-टाइम निगरानी',
    normalEnvelope: 'सामान्य परिचालन सीमा',
    thermalWatch: 'तापमान या मशीन पर नज़र',
    actionRequired: 'कार्रवाई ज़रूरी',
  },
} as const;
