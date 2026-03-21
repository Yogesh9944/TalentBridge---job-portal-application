const pdfParse = require('pdf-parse');

// Comprehensive skill keywords database
const SKILL_KEYWORDS = [
  // Frontend
  'react', 'reactjs', 'react.js', 'vue', 'vuejs', 'angular', 'javascript', 'typescript',
  'html', 'css', 'sass', 'scss', 'tailwind', 'bootstrap', 'jquery', 'redux', 'nextjs',
  'next.js', 'gatsby', 'webpack', 'vite', 'babel', 'jest', 'react native',
  
  // Backend
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'fastapi', 'django', 'flask',
  'spring', 'java', 'python', 'php', 'ruby', 'rails', 'go', 'golang', 'rust', 'c++', 'c#',
  '.net', 'dotnet', 'laravel', 'symfony', 'asp.net',
  
  // Databases
  'mongodb', 'mysql', 'postgresql', 'postgres', 'sqlite', 'redis', 'elasticsearch',
  'cassandra', 'dynamodb', 'firebase', 'supabase', 'sql', 'nosql', 'graphql',
  
  // Cloud & DevOps
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'k8s', 'jenkins', 'github actions',
  'ci/cd', 'terraform', 'ansible', 'nginx', 'linux', 'bash', 'shell',
  
  // Mobile
  'android', 'ios', 'swift', 'kotlin', 'flutter', 'dart', 'xamarin',
  
  // Data & AI
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy',
  'scikit-learn', 'keras', 'nlp', 'computer vision', 'data science', 'tableau',
  'power bi', 'spark', 'hadoop', 'airflow',
  
  // Tools & Others
  'git', 'github', 'gitlab', 'jira', 'figma', 'postman', 'swagger', 'rest api',
  'microservices', 'agile', 'scrum', 'websocket', 'socket.io', 'graphql',
  'blockchain', 'solidity', 'web3',
];

/**
 * Extract text from PDF buffer
 */
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parse error:', error.message);
    return '';
  }
};

/**
 * Extract skills from text
 */
const extractSkills = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const foundSkills = new Set();

  SKILL_KEYWORDS.forEach(skill => {
    // Check for whole word match
    const regex = new RegExp(`\\b${skill.replace(/[.+]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  return [...foundSkills];
};

/**
 * Extract education info from text
 */
const extractEducation = (text) => {
  const educationKeywords = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'bsc', 'msc',
    'b.e', 'm.e', 'mba', 'b.com', 'bca', 'mca', 'diploma', 'degree'];
  
  const lines = text.toLowerCase().split('\n');
  const educationLines = lines.filter(line =>
    educationKeywords.some(kw => line.includes(kw))
  );
  
  return educationLines.slice(0, 3).map(line => line.trim()).filter(Boolean);
};

/**
 * Extract experience years from text
 */
const extractExperienceYears = (text) => {
  const patterns = [
    /(\d+)\+?\s*years?\s*of\s*experience/i,
    /experience\s*:?\s*(\d+)\+?\s*years?/i,
    /(\d+)\s*yr[s]?\s*exp/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1]);
  }
  return null;
};

/**
 * Calculate match score between job skills and resume skills
 */
const calculateMatchScore = (jobSkills, resumeSkills) => {
  if (!jobSkills || jobSkills.length === 0) return { score: 0, matched: [], missing: [] };

  const normalizeSkill = (s) => s.toLowerCase().replace(/[.\s]/g, '');
  
  const normalizedJobSkills = jobSkills.map(s => ({
    original: s,
    normalized: normalizeSkill(s),
  }));
  
  const normalizedResumeSkills = resumeSkills.map(s => normalizeSkill(s));
  
  const matched = [];
  const missing = [];
  
  normalizedJobSkills.forEach(({ original, normalized }) => {
    const found = normalizedResumeSkills.some(rs =>
      rs.includes(normalized) || normalized.includes(rs)
    );
    if (found) {
      matched.push(original);
    } else {
      missing.push(original);
    }
  });
  
  const score = Math.round((matched.length / jobSkills.length) * 100);
  
  return { score, matched, missing };
};

/**
 * Generate strengths based on resume analysis
 */
const generateStrengths = (extractedSkills, matchedSkills, experienceYears) => {
  const strengths = [];
  
  if (matchedSkills.length > 0) {
    strengths.push(`Strong match in: ${matchedSkills.slice(0, 3).join(', ')}`);
  }
  if (experienceYears && experienceYears > 0) {
    strengths.push(`${experienceYears}+ years of professional experience`);
  }
  if (extractedSkills.length > 8) {
    strengths.push('Diverse technical skill set');
  }
  if (extractedSkills.some(s => ['AWS', 'Docker', 'Kubernetes'].includes(s))) {
    strengths.push('Cloud & DevOps expertise');
  }
  if (extractedSkills.some(s => ['Machine Learning', 'Tensorflow', 'Pytorch'].includes(s))) {
    strengths.push('AI/ML capabilities');
  }
  
  return strengths.length > 0 ? strengths : ['Resume uploaded successfully'];
};

/**
 * Full resume analysis pipeline
 */
const analyzeResume = async (buffer, jobSkills = []) => {
  const text = await extractTextFromPDF(buffer);
  const extractedSkills = extractSkills(text);
  const experienceYears = extractExperienceYears(text);
  const education = extractEducation(text);
  
  const { score, matched, missing } = calculateMatchScore(jobSkills, extractedSkills);
  const strengths = generateStrengths(extractedSkills, matched, experienceYears);
  
  return {
    matchScore: score,
    matchedSkills: matched,
    missingSkills: missing,
    extractedSkills,
    extractedText: text.substring(0, 2000), // store first 2000 chars
    strengths,
    experienceYears,
    education,
    analyzed: true,
  };
};

module.exports = { analyzeResume, extractSkills, calculateMatchScore, extractTextFromPDF };
