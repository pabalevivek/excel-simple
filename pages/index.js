import fs from 'fs';
import path from 'path';
import { useState } from 'react';

// --- DATA LOADING ---
export async function getStaticProps() {
  const toolsPath = path.join(process.cwd(), 'data', 'prompts.json');
  const toolsData = fs.readFileSync(toolsPath);
  const tools = JSON.parse(toolsData);

  return { props: { tools } };
}

export default function Home({ tools }) {
  // --- STATE ---
  const [mainQuery, setMainQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Optimizer State
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [optInput, setOptInput] = useState('');
  const [optOutput, setOptOutput] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // --- CONFIGURATION ---
  const categoryConfig = {
    'All': { solid: '#334155', soft: '#f8fafc', icon: '🌍' },
    'Super AI': { solid: '#000000', soft: '#f3f4f6', icon: '⚡' },
    'Coding': { solid: '#2563eb', soft: '#eff6ff', icon: '💻' },
    'Image': { solid: '#9333ea', soft: '#f3e8ff', icon: '🎨' },
    'Video': { solid: '#dc2626', soft: '#fef2f2', icon: '🎥' },
    'Writing': { solid: '#d97706', soft: '#fffbeb', icon: '✍️' },
    'Research': { solid: '#059669', soft: '#ecfdf5', icon: '🔬' },
    'Business': { solid: '#4f46e5', soft: '#eef2ff', icon: '💼' },
    'Music': { solid: '#db2777', soft: '#fdf2f8', icon: '🎵' },
    'Voice': { solid: '#ea580c', soft: '#fff7ed', icon: '🎙️' },
    'Chat': { solid: '#be185d', soft: '#fce7f3', icon: '💬' },
    '3D': { solid: '#0891b2', soft: '#ecfeff', icon: '🧊' }
  };

  const categories = Object.keys(categoryConfig).map(key => ({ id: key, ...categoryConfig[key] }));
  const getConfig = (cat) => categoryConfig[cat] || categoryConfig['All'];

  // --- HELPER FUNCTIONS ---
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // --- OPTIMIZER LOGIC ---
  const handleOptimize = () => {
    if (!optInput) return;
    setIsOptimizing(true);
    setTimeout(() => {
      let refinedPrompt = `You are an expert AI assistant. `;
      refinedPrompt += `Your task is to: ${optInput}.\n\n`;
      refinedPrompt += `[System: reasoning_effort = xhigh]\nPlan step-by-step. Analyze edge cases before answering.\n`;
      refinedPrompt += `\nOutput Format:\n1. Summary\n2. Detailed Execution\n3. Code/Examples`;
      
      setOptOutput(refinedPrompt);
      setIsOptimizing(false);
    }, 800);
  };

  // --- FILTERING ---
  const filteredTools = tools.filter(tool => {
    if (activeCategory === 'Super AI' && !tool.is_multimodal) return false;
    if (activeCategory !== 'All' && activeCategory !== 'Super AI' && tool.category !== activeCategory) return false;
    if (mainQuery) return tool.title.toLowerCase().includes(mainQuery.toLowerCase());
    return true;
  }).sort((a, b) => (b.is_multimodal === true) - (a.is_multimodal === true));

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* --- CSS STYLES --- */}
      <style jsx global>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        
        .container {
          max-width: 1200px;
          width: 100%;
          padding: 40px 20px;
        }

        .tool-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.15); }
        
        /* Optimizer Animations */
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* --- MAIN CONTAINER --- */}
      <div className="container">
        
        {/* HERO SECTION */}
        <div style={{ maxWidth: '800px', margin: '0 auto 50px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', marginBottom: '20px', letterSpacing: '-1.5px', lineHeight: '1.1' }}>
            Find the Perfect Model
          </h1>
          
          <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* 1. Main Search Bar */}
            <div style={{ display: 'flex', width: '100%', background: 'white', padding: '8px', borderRadius: '50px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
              <input 
                type="text" 
                placeholder="Search 200+ models..." 
                value={mainQuery} 
                onChange={(e) => setMainQuery(e.target.value)} 
                style={{ flex: 1, padding: '12px 25px', borderRadius: '50px', border: 'none', outline: 'none', fontSize: '1.1rem', minWidth: '0' }} 
              />
              <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '40px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                Search
              </button>
            </div>
            
            {/* 2. PROMPT OPTIMIZER SECTION */}
            <div style={{ width: '100%' }}>
              
              <button 
                onClick={() => setShowOptimizer(!showOptimizer)}
                style={{ 
                  width: '100%', 
                  padding: '18px 25px', 
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                  color: 'white', 
                  border: '1px solid #334155', 
                  borderRadius: showOptimizer ? '20px 20px 0 0' : '20px', 
                  cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>✨</span>
                <span style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '900', 
                  background: 'linear-gradient(to right, #60a5fa, #c084fc)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px'
                }}>
                  Prompt Optimizer
                </span>
                <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '1.2rem' }}>
                  {showOptimizer ? '▲' : '▼'}
                </span>
              </button>

              {showOptimizer && (
                <div style={{ 
                  background: '#1e293b', 
                  padding: '25px', 
                  borderRadius: '0 0 20px 20px', 
                  border: '1px solid #334155', 
                  borderTop: 'none',
                  animation: 'slideDown 0.3s ease-out',
                  textAlign: 'left'
                }}>
                  
                  {!optOutput ? (
                    <>
                      <textarea 
                        placeholder="Write here... (e.g. 'Build a python snake game')" 
                        value={optInput}
                        onChange={(e) => setOptInput(e.target.value)}
                        style={{ 
                          width: '100%', height: '100px', padding: '15px', borderRadius: '12px', 
                          border: '1px solid #334155', background: '#0f172a', color: 'white', 
                          fontSize: '1rem', marginBottom: '20px', fontFamily: 'inherit', resize: 'none',
                          outline: 'none'
                        }}
                      />
                      <button 
                        onClick={handleOptimize} 
                        style={{ 
                          width: '100%', padding: '15px', background: 'white', border: 'none', 
                          borderRadius: '12px', color: '#0f172a', fontWeight: '800', cursor: 'pointer', 
                          fontSize: '1rem', transition: 'filter 0.2s', boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.filter = 'brightness(0.9)'}
                        onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
                      >
                        {isOptimizing ? 'Optimizing...' : 'Generate Pro Prompt'}
                      </button>
                    </>
                  ) : (
                    <div>
                      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto', fontSize: '0.95rem', lineHeight: '1.6', border: '1px solid #334155', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                        {optOutput}
                      </div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => copyToClipboard(optOutput)} style={{ flex: 1, padding: '12px', background: '#10b981', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Copy</button>
                        <button onClick={() => { setOptOutput(''); setOptInput(''); }} style={{ flex: 1, padding: '12px', background: '#334155', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>New</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ padding: '10px 20px', borderRadius: '25px', border: 'none', background: activeCategory === cat.id ? cat.solid : 'white', color: activeCategory === cat.id ? 'white' : '#64748b', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s', fontSize: '0.9rem' }}>
              <span style={{ marginRight: '8px' }}>{cat.icon}</span> {cat.id}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
          {filteredTools.map((item) => {
            const theme = getConfig(item.category);
            return (
              <a href={item.model_link} target="_blank" rel="noopener noreferrer" key={item.slug} style={{ textDecoration: 'none' }}>
                <div className="tool-card" style={{ background: 'white', borderRadius: '20px', padding: '25px', border: `1px solid ${theme.solid}15`, height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: theme.solid, background: theme.soft, padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>{theme.icon} {item.category}</span>
                    {item.is_multimodal && <span style={{ fontSize: '0.7rem', background: '#0f172a', color: 'white', padding: '5px 10px', borderRadius: '8px', fontWeight: 'bold' }}>PRO</span>}
                  </div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem', fontWeight: '700', color: '#1e293b' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '25px', flex: 1, lineHeight: '1.6' }}>{item.problem}</p>
                  <div style={{ background: theme.solid, color: 'white', textAlign: 'center', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem' }}>Use {item.model_name} →</div>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </div>
  );
}

