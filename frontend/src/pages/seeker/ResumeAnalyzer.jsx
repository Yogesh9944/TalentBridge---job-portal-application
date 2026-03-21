import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './ResumeAnalyzer.css';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [jobSkills, setJobSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload a resume first'); return; }
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      if (jobSkills) fd.append('jobSkills', jobSkills);
      const { data } = await api.post('/applications/analyze', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.analysis);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const ScoreGauge = ({ score }) => {
    const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    const label = score >= 75 ? 'Excellent Match' : score >= 50 ? 'Good Match' : score > 0 ? 'Needs Improvement' : 'Upload & Analyze';
    const r = 80;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
      <div className="gauge-wrapper">
        <div className="gauge-circle">
          <svg width="200" height="200">
            <circle cx="100" cy="100" r={r} fill="none" stroke="#1a1a1a" strokeWidth="12"/>
            <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="12"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px', transition: 'stroke-dasharray 1s ease' }}/>
          </svg>
          <div className="gauge-text">
            <div className="gauge-score" style={{ color }}>{score}%</div>
            <div className="gauge-label">Match Score</div>
          </div>
        </div>
        <div className="gauge-status" style={{ color }}>{label}</div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header__eyebrow">AI Powered</div>
        <h1 className="page-header__title">Resume Analyzer</h1>
        <p className="page-header__subtitle">Upload your resume to get an instant AI skill match score</p>
      </div>
      <div className="page-body">
        <div className="analyzer-grid">
          {/* Left: Input */}
          <div className="analyzer-input">
            <div className="dash-card">
              <h3 className="section-title" style={{ marginBottom: 20 }}>Upload Resume</h3>

              {/* Drop zone */}
              <label
                className={`dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} />
                {file ? (
                  <div className="dropzone__file">
                    <span className="dropzone__file-icon">📄</span>
                    <div>
                      <div className="dropzone__file-name">{file.name}</div>
                      <div className="dropzone__file-size">{(file.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <button type="button" className="dropzone__remove" onClick={e => { e.preventDefault(); setFile(null); setResult(null); }}>✕</button>
                  </div>
                ) : (
                  <div className="dropzone__empty">
                    <div className="dropzone__icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17,8 12,3 7,8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div className="dropzone__text">
                      <strong>Drop your resume here</strong>
                      <span>or click to browse</span>
                    </div>
                    <div className="dropzone__formats">PDF, DOC, DOCX · Max 5MB</div>
                  </div>
                )}
              </label>

              {/* Job skills input */}
              <div className="form-group" style={{ marginTop: 20 }}>
                <label className="form-label">
                  Job Required Skills
                  <span style={{ color: '#404040', fontWeight: 400, marginLeft: 6 }}>(comma separated — optional)</span>
                </label>
                <textarea
                  className="input-base"
                  rows={3}
                  placeholder="React, Node.js, MongoDB, TypeScript, Docker..."
                  value={jobSkills}
                  onChange={e => setJobSkills(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ fontSize: 12, color: '#404040', marginTop: 4 }}>
                  Add job skills to calculate a precise match score against your resume
                </div>
              </div>

              <button
                className="btn btn-primary w-full"
                style={{ marginTop: 20 }}
                onClick={handleAnalyze}
                disabled={loading || !file}
              >
                {loading ? (
                  <><span className="spinner dark" /> Analyzing Resume...</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                    </svg>
                    Analyze Resume
                  </>
                )}
              </button>
            </div>

            {/* How it works */}
            <div className="dash-card" style={{ marginTop: 20 }}>
              <h3 className="section-title" style={{ marginBottom: 16 }}>How It Works</h3>
              <div className="how-steps">
                {[
                  { step: '01', title: 'Upload', desc: 'Upload your PDF or DOC resume file' },
                  { step: '02', title: 'Parse', desc: 'AI extracts skills, education, and experience' },
                  { step: '03', title: 'Match', desc: 'Skills are compared against job requirements' },
                  { step: '04', title: 'Score', desc: 'Get a 0–100% fit score with insights' },
                ].map(s => (
                  <div key={s.step} className="how-step">
                    <div className="how-step__num">{s.step}</div>
                    <div>
                      <div className="how-step__title">{s.title}</div>
                      <div className="how-step__desc">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="analyzer-results">
            {!result && !loading && (
              <div className="results-placeholder">
                <div className="placeholder-art">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" style={{ color: '#1a1a1a' }}>
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                </div>
                <h3>Your analysis will appear here</h3>
                <p>Upload a resume and click Analyze to see your skill match score, extracted skills, and personalized insights.</p>
              </div>
            )}

            {loading && (
              <div className="results-loading">
                <div className="loading-pulse">
                  <div className="pulse-ring" />
                  <div className="pulse-ring pulse-ring--2" />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                </div>
                <p>Analyzing your resume with AI...</p>
                <div className="loading-steps">
                  {['Parsing PDF', 'Extracting Skills', 'Calculating Match', 'Generating Insights'].map((s, i) => (
                    <div key={i} className="loading-step" style={{ animationDelay: `${i * 0.6}s` }}>
                      <span className="loading-step__dot" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result && (
              <div className="results-content animate-fadeIn">
                {/* Score gauge */}
                <div className="dash-card" style={{ textAlign: 'center' }}>
                  <ScoreGauge score={result.matchScore} />
                </div>

                {/* Skills analysis */}
                <div className="dash-card">
                  <h3 className="section-title" style={{ marginBottom: 16 }}>Skill Analysis</h3>

                  {result.matchedSkills?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', marginBottom: 8 }}>
                        ✓ MATCHED SKILLS ({result.matchedSkills.length})
                      </div>
                      <div className="skill-chips">
                        {result.matchedSkills.map(s => (
                          <span key={s} className="skill-chip skill-chip--match">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.missingSkills?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>
                        ✗ MISSING SKILLS ({result.missingSkills.length})
                      </div>
                      <div className="skill-chips">
                        {result.missingSkills.map(s => (
                          <span key={s} className="skill-chip skill-chip--miss">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.extractedSkills?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#525252', marginBottom: 8 }}>
                        ALL DETECTED SKILLS ({result.extractedSkills.length})
                      </div>
                      <div className="skill-chips">
                        {result.extractedSkills.map(s => (
                          <span key={s} className="skill-chip skill-chip--neutral">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Strengths */}
                {result.strengths?.length > 0 && (
                  <div className="dash-card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>Key Strengths</h3>
                    <div className="strengths-list">
                      {result.strengths.map((s, i) => (
                        <div key={i} className="strength-item">
                          <span className="strength-icon">⚡</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {result.experienceYears > 0 && (
                  <div className="dash-card">
                    <div className="exp-row">
                      <div>
                        <div style={{ fontSize: 13, color: '#525252', marginBottom: 4 }}>Experience Detected</div>
                        <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800 }}>{result.experienceYears}+</div>
                        <div style={{ fontSize: 13, color: '#525252' }}>years</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: '#525252', marginBottom: 4 }}>Tech Skills Found</div>
                        <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800 }}>{result.extractedSkills?.length || 0}</div>
                        <div style={{ fontSize: 13, color: '#525252' }}>skills</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
