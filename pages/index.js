import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useState } from 'react';

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
  
  // Mobile & UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  const [expandedPrompt, setExpandedPrompt] = useState(null);
  
  // Optimizer State
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
  const toggleCategory = (idx) => {
    setOpenCategories(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const togglePrompt = (label) => {
    setExpandedPrompt(expandedPrompt === label ? null : label);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // --- OPTIMIZER LOGIC (High Effort Only) ---
  const handleOptimize = () => {
    if (!optInput) return;
    setIsOptimizing(true);
    setTimeout(() => {
      let refinedPrompt = `You are an expert AI assistant. `;
      refinedPrompt += `Your task is to: ${optInput}.\n\n`;
      // Locked to High Effort per request
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
    <div style={{ fontFamily: '"Inter", sans-serif', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- CSS STYLES --- */}
      <style jsx global>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        
        .sidebar-container { 
          width: 280px; 
          background: #0f172a; 
          height: 100vh; 
          position: fixed; 
          left: 0; top: 0; 
          z-index: 100;
          overflow-y: auto;
          color: white;
          transition: transform 0.3s ease;
        }

        .mobile-only { display: none; }

        @media (max-width: 768px) {
          .sidebar-container { transform: translateX(-100%); width: 85%; max-width: 320px; }
          .sidebar-container.open { transform: translateX(0); }
          .main-content { margin-left: 0 !important; width: 100% !important; padding: 20px !important; }
          .mobile-header { display: flex !important; }
          .mobile-only { display: block; }
        }

        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
          .main-content { margin-left: 280px; width: calc(100% - 280px); }
        }

        .nav-item {
          display: flex; align-items: center; padding: 10px 20px; cursor: pointer;
          transition: background 0.2s; color: #94a3b8; font-size: 0.85rem;
        }
        .nav-item:hover { background: #1e293b; color: white; }
        
        .group-header {
          padding: 12px 20px; font-size: 0.75rem; color: #cbd5e1; 
          font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;
          cursor: pointer; display: flex; justify-content: space-between;
          border-bottom: 1px solid #1e293b; margin-top: 5px;
        }
        .group-header:hover { background: #1e293b; }
        
        .prompt-preview {
          background: #1e293b; padding: 12px; margin: 0 20px 10px; 
          border-radius: 8px; font-size: 0.8rem; color: #e2e8f0; border: 1px solid #334155;
        }

        .optimizer-box {
          margin: 15px; padding: 15px; background: #1e293b; 
          border-radius: 12px; border: 1px solid #334155;
        }

        .tool-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
      `}</style>

      {/* --- MOBILE HEADER --- */}
      <div className="mobile-header" style={{ padding: '15px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 90 }}>
        <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>AI Command Center</div>
        <button onClick={() => setIsSidebarOpen(true)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer' }}>☰</button>
      </div>

      {/* --- SIDEBAR OVERLAY (Mobile Only) --- */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 95, backdropFilter: 'blur(2px)' }} className="mobile-only"></div>
      )}

      {/* --- LEFT SIDEBAR --- */}
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        
        {/* LOGO AREA */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '1.5rem' }}>🤖</div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>AI Center</div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="mobile-only" style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* 1. EMBEDDED OPTIMIZER WIDGET */}
        <div className="optimizer-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <span>✨</span> Prompt Optimizer
          </div>
          
          {!optOutput ? (
            <>
              <textarea 
                placeholder="Write here..." 
                value={optInput}
                onChange={(e) => setOptInput(e.target.value)}
                style={{ 
                  width: '100%', height: '70px', padding: '10px', borderRadius: '8px', 
                  border: '1px solid #334155', background: '#0f172a', color: 'white', 
                  fontSize: '0.85rem', marginBottom: '10px', fontFamily: 'inherit', resize: 'none'
                }}
              />
              
              {/* Only HIGH Setting */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button style={{ 
                  flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #3b82f6', 
                  background: '#3b82f6', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'default'
                }}>
                  High Effort
                </button>
              </div>

              <button 
                onClick={handleOptimize}
                style={{ 
                  width: '100%', padding: '8px', background: 'white', border: 'none', 
                  borderRadius: '6px', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' 
                }}
              >
                {isOptimizing ? 'Thinking...' : 'Optimize'}
              </button>
            </>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', marginBottom: '10px', maxHeight: '150px', overflowY: 'auto', fontSize: '0.8rem', lineHeight: '1.4', border: '1px solid #334155' }}>
                {optOutput}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => copyToClipboard(optOutput)} style={{ flex: 1, padding: '6px', background: '#10b981', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>Copy</button>
                <button onClick={() => { setOptOutput(''); setOptInput(''); }} style={{ flex: 1, padding: '6px', background: '#334155', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>Reset</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: '1px', background: '#1e293b', margin: '0 20px' }}></div>

        {/* 2. PROMPT LIBRARY (Collapsible) */}
        <div style={{ flex: 1 }}>
          {sidebarData && sidebarData.map((group, idx) => (
            <div key={idx}>
              <div className="group-header" onClick={() => toggleCategory(idx)}>
                <span>{group.category}</span>
                <span style={{ color: '#64748b' }}>{openCategories[idx] ? '−' : '+'}</span>
              </div>
              
              {openCategories[idx] && group.items.map((item, i) => (
                <div key={i}>
                  <div className="nav-item" onClick={() => item.type === 'gpt' ? window.open(item.link) : togglePrompt(item.label)}>
                    <span style={{ marginRight: '8px' }}>{item.type === 'gpt' ? '🤖' : '📝'}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                  </div>
                  
                  {item.type === 'prompt' && expandedPrompt === item.label && (
                    <div className="prompt-preview">
                      <div style={{ marginBottom: '10px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>{item.content}</div>
                      <button 
                        onClick={() => copyToClipboard(item.content)}
                        style={{ width: '100%', padding: '6px', background: '#3b82f6', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                      >
                        Copy Prompt
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="main-content" style={{ flex: 1, padding: '40px', transition: 'margin 0.3s' }}>
        
        {/* HERO SEARCH */}
        <div style={{ maxWidth: '900px', margin: '20px auto 40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '15px', letterSpacing: '-1px' }}>
            Find the Perfect Model
          </h1>
          <div style={{ display: 'flex', background: 'white', padding: '6px', borderRadius: '50px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            <input type="text" placeholder="Search 200+ models..." value={mainQuery} onChange={(e) => setMainQuery(e.target.value)} style={{ flex: 1, padding: '12px 20px', borderRadius: '50px', border: 'none', outline: 'none', fontSize: '1rem', minWidth: '0' }} />
            <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '40px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>Search</button>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '20px', justifyContent: 'flex-start', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ padding: '8px 16px', borderRadius: '25px', border: 'none', background: activeCategory === cat.id ? cat.solid : 'white', color: activeCategory === cat.id ? 'white' : '#64748b', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s', fontSize: '0.85rem' }}>
              <span style={{ marginRight: '6px' }}>{cat.icon}</span> {cat.id}
            </button>
          ))}
        </div>

        {/* RESULTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredTools.map((item) => {
            const theme = getConfig(item.category);
            return (
              <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none' }}>
                <div className="tool-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', border: `1px solid ${theme.solid}15`, height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: theme.solid, background: theme.soft, padding: '5px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>{theme.icon} {item.category}</span>
                    {item.is_multimodal && <span style={{ fontSize: '0.65rem', background: '#0f172a', color: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>PRO</span>}
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>{item.problem}</p>
                  <div style={{ background: theme.solid, color: 'white', textAlign: 'center', padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem' }}>Use {item.model_name} →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
