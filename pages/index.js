import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// --- DATA LOADING ---
export async function getStaticProps() {
  const toolsPath = path.join(process.cwd(), 'data', 'prompts.json');
  const toolsData = fs.readFileSync(toolsPath);
  const tools = JSON.parse(toolsData);

  let sidebarData = [];
  try {
    const sidebarPath = path.join(process.cwd(), 'data', 'sidebar.json');
    const sidebarFile = fs.readFileSync(sidebarPath);
    sidebarData = JSON.parse(sidebarFile);
  } catch (e) {
    console.log("Sidebar data missing.");
  }

  return { props: { tools, sidebarData } };
}

export default function Home({ tools, sidebarData }) {
  // --- STATE ---
  const [mainQuery, setMainQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showOptimizer, setShowOptimizer] = useState(false); // Modal State
  
  // --- OPTIMIZER STATE ---
  const [optInput, setOptInput] = useState('');
  const [optEffort, setOptEffort] = useState('Medium'); 
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

  // --- OPTIMIZER LOGIC ---
  const handleOptimize = () => {
    if (!optInput) return;
    setIsOptimizing(true);
    setTimeout(() => {
      let refinedPrompt = `You are an expert AI assistant. `;
      refinedPrompt += `Your task is to: ${optInput}.\n\n`;
      if (optEffort === 'High') {
        refinedPrompt += `[System: reasoning_effort = xhigh]\nPlan step-by-step.\n`;
      } else if (optEffort === 'Low') {
        refinedPrompt += `[System: reasoning_effort = low]\nBe concise.\n`;
      } else {
        refinedPrompt += `[System: reasoning_effort = medium]\n`;
      }
      refinedPrompt += `\nOutput Format:\n1. Summary\n2. Execution\n3. Code/Examples`;
      setOptOutput(refinedPrompt);
      setIsOptimizing(false);
    }, 800);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  // --- FILTERING ---
  const filteredTools = tools.filter(tool => {
    if (activeCategory === 'Super AI' && !tool.is_multimodal) return false;
    if (activeCategory !== 'All' && activeCategory !== 'Super AI' && tool.category !== activeCategory) return false;
    if (mainQuery) return tool.title.toLowerCase().includes(mainQuery.toLowerCase());
    return true;
  }).sort((a, b) => (b.is_multimodal === true) - (a.is_multimodal === true));

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', background: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
      
      {/* --- GLOBAL STYLES --- */}
      <style jsx global>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        
        .sidebar-container { 
          width: 280px; /* FIXED WIDTH */
          background: #0f172a; 
          height: 100vh; 
          position: fixed; 
          left: 0; top: 0; 
          z-index: 100;
          overflow-y: auto; /* Scrollable */
          box-shadow: 4px 0 20px rgba(0,0,0,0.1);
          color: white;
          display: flex;
          flex-direction: column;
        }
        
        .nav-item {
          display: flex; align-items: center; padding: 12px 24px; cursor: pointer;
          white-space: nowrap; transition: background 0.2s; color: #94a3b8;
        }
        .nav-item:hover { background: #1e293b; color: white; }
        .nav-icon { min-width: 24px; font-size: 1.1rem; text-align: center; }
        .nav-label { margin-left: 12px; font-size: 0.9rem; font-weight: 500; }
        
        .group-title {
          padding: 20px 24px 8px; font-size: 0.75rem; color: #64748b; 
          fontWeight: bold; text-transform: uppercase; letter-spacing: 1px;
        }

        .tool-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
      `}</style>

      {/* --- LEFT SIDEBAR (FIXED) --- */}
      <aside className="sidebar-container">
        
        {/* LOGO AREA */}
        <div style={{ padding: '25px 24px', borderBottom: '1px solid #1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '1.5rem' }}>🤖</div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>AI Center</div>
        </div>

        {/* 1. MAGIC BUTTON (Optimizer) */}
        <div className="nav-item" onClick={() => setShowOptimizer(true)} style={{ background: 'rgba(96, 165, 250, 0.1)', borderLeft: '3px solid #60a5fa', color: 'white' }}>
          <div className="nav-icon">✨</div>
          <div className="nav-label" style={{ fontWeight: 'bold' }}>GPT-5 Optimizer</div>
        </div>

        <div style={{ height: '1px', background: '#1e293b', margin: '15px 24px' }}></div>

        {/* 2. PROMPT LIBRARY */}
        <div style={{ flex: 1 }}>
          {sidebarData && sidebarData.map((group, idx) => (
            <div key={idx}>
              <div className="group-title">
                {group.category} 
              </div>
              {group.items.map((item, i) => (
                <div key={i} className="nav-item" onClick={() => item.type === 'prompt' ? copyToClipboard(item.content) : window.open(item.link)}>
                  <div className="nav-icon">{item.type === 'gpt' ? '🤖' : '📝'}</div>
                  <div className="nav-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* --- MODAL: GPT-5 OPTIMIZER --- */}
      {showOptimizer && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#1e293b', width: '90%', maxWidth: '500px', borderRadius: '20px', padding: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', color: 'white', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>✨ GPT-5 Prompt Optimizer</h2>
              <button onClick={() => setShowOptimizer(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            {!optOutput ? (
              <>
                <textarea 
                  placeholder="What do you want to create? (e.g. 'Snake game in Python')" 
                  value={optInput}
                  onChange={(e) => setOptInput(e.target.value)}
                  style={{ width: '100%', height: '100px', padding: '15px', borderRadius: '10px', border: 'none', background: '#0f172a', color: 'white', fontSize: '1rem', marginBottom: '20px', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  {['Low', 'Medium', 'High'].map(level => (
                    <button key={level} onClick={() => setOptEffort(level)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: optEffort === level ? '1px solid #3b82f6' : '1px solid #334155', background: optEffort === level ? '#3b82f6' : 'transparent', color: 'white', cursor: 'pointer' }}>
                      {level} Effort
                    </button>
                  ))}
                </div>
                <button onClick={handleOptimize} style={{ width: '100%', padding: '15px', background: 'linear-gradient(to right, #2563eb, #9333ea)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                  {isOptimizing ? 'Thinking...' : 'Optimize Now'}
                </button>
              </>
            ) : (
              <div>
                <div style={{ background: '#0f172a', padding: '15px', borderRadius: '10px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {optOutput}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => copyToClipboard(optOutput)} style={{ flex: 1, padding: '12px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Copy</button>
                  <button onClick={() => { setOptOutput(''); setOptInput(''); }} style={{ flex: 1, padding: '12px', background: '#334155', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>New</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT (Adjusted Margin) --- */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '30px', width: 'calc(100% - 280px)' }}>
        
        {/* SEARCH & HEADER */}
        <div style={{ maxWidth: '900px', margin: '20px auto 40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '15px', letterSpacing: '-1.5px' }}>
            Find the Perfect Model
          </h1>
          <div style={{ display: 'flex', background: 'white', padding: '8px', borderRadius: '50px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <input type="text" placeholder="Search 200+ models..." value={mainQuery} onChange={(e) => setMainQuery(e.target.value)} style={{ flex: 1, padding: '15px 25px', borderRadius: '50px', border: 'none', outline: 'none', fontSize: '1.1rem' }} />
            <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '40px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>Search</button>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '20px', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ padding: '10px 20px', borderRadius: '25px', border: 'none', background: activeCategory === cat.id ? cat.solid : 'white', color: activeCategory === cat.id ? 'white' : '#64748b', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
              <span style={{ marginRight: '8px' }}>{cat.icon}</span> {cat.id}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {filteredTools.map((item) => {
            const theme = getConfig(item.category);
            return (
              <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none' }}>
                <div className="tool-card" style={{ background: 'white', borderRadius: '20px', padding: '25px', border: `1px solid ${theme.solid}15`, height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: theme.solid, background: theme.soft, padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>{theme.icon} {item.category}</span>
                    {item.is_multimodal && <span style={{ fontSize: '0.7rem', background: '#0f172a', color: 'white', padding: '5px 10px', borderRadius: '8px', fontWeight: 'bold' }}>PRO</span>}
                  </div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem', fontWeight: '700', color: '#1e293b' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '25px', flex: 1, lineHeight: '1.6' }}>{item.problem}</p>
                  <div style={{ background: theme.solid, color: 'white', textAlign: 'center', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem' }}>Use {item.model_name} →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
