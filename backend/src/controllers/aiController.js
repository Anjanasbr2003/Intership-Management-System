const generateMatchingSummary = async (req, res) => {
  try {
    const { studentSkills, jobDescription, prompt } = req.body;

    // Simulated safe AI recommendation generator
    const sampleKeywords = ['React', 'Node.js', 'MySQL', 'Full Stack', 'Cloud'];
    const matched = sampleKeywords.filter(k =>
      (jobDescription || '').toLowerCase().includes(k.toLowerCase())
    );

    res.json({
      success: true,
      analysis: {
        compatibilityScore: Math.floor(75 + Math.random() * 20),
        alignmentHighlights: matched.length > 0 ? matched : ['Core Engineering Skills'],
        recommendation: 'Candidate qualifications strongly align with primary vacancy technical requirements.',
        quotaRemaining: req.aiQuotaRemaining,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateMatchingSummary };
