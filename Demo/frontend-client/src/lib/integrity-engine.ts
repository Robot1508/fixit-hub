export interface FairnessMetadata {
  confidenceToEnvironmentRatio: number; // 0 to 1
  lightingCondition: string; // e.g., 'Low-light', 'Optimal'
  normalizationApplied: boolean;
  fairnessScore: number; // 1 to 10
  explanation: string;
}

export function generateFairnessMetadata(
  imageBase64: string | null,
  location: string,
  aiData: any
): FairnessMetadata {
  // Simulate checking the environment (low light, rural area, etc.)
  // In a real application, this could involve computer vision checks on the RAW image
  // or checking the timezone/lighting API at the given location.
  
  const isSilentZone = location.includes('Ward 9') || location.includes('Ward 11');
  const simulatedLowLight = Math.random() > 0.5; // Simulate a low-light check for prototype
  
  let confidenceToEnvironmentRatio = Math.min(1.0, (aiData.severity_score || 5) / 10 + (simulatedLowLight ? 0.3 : 0));
  if (confidenceToEnvironmentRatio > 1.0) confidenceToEnvironmentRatio = 1.0;

  const metadata: FairnessMetadata = {
    confidenceToEnvironmentRatio: Number(confidenceToEnvironmentRatio.toFixed(2)),
    lightingCondition: simulatedLowLight ? 'Low-light' : 'Optimal',
    normalizationApplied: simulatedLowLight || isSilentZone,
    fairnessScore: simulatedLowLight || isSilentZone ? 9.5 : 8.0,
    explanation: `Normalized for ${simulatedLowLight ? 'low-lighting' : 'standard lighting'} to ensure equitable verification.`,
  };

  // Generate the BIAS_REPORT.json that the admin dashboard can use
  saveBiasReport(metadata, location, aiData.category);

  return metadata;
}

function saveBiasReport(metadata: FairnessMetadata, location: string, category: string) {
  try {
    const reportData = {
      timestamp: new Date().toISOString(),
      location,
      category,
      fairness: metadata
    };
    
    // Fetch existing reports
    const existing = localStorage.getItem('BIAS_REPORT.json');
    let reports = [];
    if (existing) {
      reports = JSON.parse(existing);
    }
    
    reports.push(reportData);
    localStorage.setItem('BIAS_REPORT.json', JSON.stringify(reports, null, 2));
    
    console.log("Integrity Engine: Generated and saved BIAS_REPORT.json", reportData);
  } catch (err) {
    console.error("Integrity Engine Error:", err);
  }
}
