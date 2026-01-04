import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// --- DATA LOADING ---
export async function getStaticProps() {
  // Load Main AI Tools (Right Side)
  const toolsPath = path.join(process.cwd(), 'data', 'prompts.json');
  const toolsData = fs.readFileSync(toolsPath);
  const tools = JSON.parse(toolsData);

  // Load Sidebar Data (Left Side)
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Menu Toggle
  
  // --- PROMPT OPTIMIZER STATE (Based on PDF Guide) ---
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

  // --- GPT-5 OPTIMIZER LOGIC (Metaprompting) ---
  const handleOptimize = () => {
    if (!optInput) return;
    setIsOptimizing(true);

    // Simulating the "Metaprompting" strategy from the PDF (Page 9)
    setTimeout(() => {
      let refinedPrompt = `You are an expert AI assistant. `;
      
      // Structure the task
      refinedPrompt += `Your task is to: ${optInput}.\n\n`;
      
      // Apply Reasoning Effort (Page 10 of PDF)
      if (optEffort === 'High') {
        refinedPrompt += `[System: reasoning_effort = xhigh]\n`; 
        refinedPrompt += `Plan your response step-by-step. Analyze edge cases before answering.\n`;
      } else if (optEffort === 'Low') {
        refinedPrompt += `[System: reasoning_effort = low]\n`;
        refinedPrompt += `Provide a direct, concise answer without filler.\n`;
      } else {
        refinedPrompt += `[System: reasoning_effort = medium]\n`;
      }

      refinedPrompt += `\nOutput Format:\n1. Brief Summary\n2. Detailed Execution\n3. Code/Examples`;

      setOptOutput(refinedPrompt);
      setIsOptimizing(false);
    }, 800);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
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
      
      <style jsx global>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .sidebar-desktop { width: 320px; background: white; border-right: 1px solid #e2e8f0; display: flex; flexDirection: column; height: 100vh; position: fixed; left: 0; top: 0; zIndex: 90; }
        .tool-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
        .opt-btn:hover { filter: brightness(1.1); }
      `}</style>

      {/* MOBILE HEADER */}
      <div style={{ padding: '15px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, display: isSidebarOpen ? 'none' : 'flex', '@media(min-width: 768px)': { display: 'none' } }}>
        <span style={{ fontWeight: '800', fontSize: '1.2rem', background: 'linear-gradient(to right, #2563eb, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Command Center</span>
        <button onClick={() => setIsSidebarOpen(true)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: '8px' }}>☰ Menu</button>
      </div>

      <div style={{ display: 'flex' }}>
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="sidebar-desktop" style={{ display: isSidebarOpen ? 'flex' : 'none', '@media(min-width: 768px)': { display: 'flex' } }}>
          
          {/* 1. OPTIMIZER WIDGET (Top of Sidebar) */}
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✨ GPT-5 Optimizer
            </h3>
            
            {!optOutput ? (
              <>
                <textarea 
                  placeholder="Task (e.g. 'Write a snake game')..." 
                  value={optInput}
                  onChange={(e) => setOptInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '0.85rem', marginBottom: '10px', height: '70px', fontFamily: 'inherit' }}
                />
                
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                  {['Low', 'Medium', 'High'].map(level => (
                    <button 
                      key={level}
                      onClick={() => setOptEffort(level)}
                      style={{ 
                        flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', 
                        background: optEffort === level ? 'white' : 'transparent', 
                        color: optEffort === level ? 'black' : 'white', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '600'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleOptimize}
                  className="opt-btn"
                  style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {isOptimizing ? 'Optimizing...' : 'Generate Prompt'}
                </button>
              </>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.7rem', margin: '0 0 5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Optimized Output:</p>
                <div style={{ fontSize: '0.8rem', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap', marginBottom: '10px', lineHeight: '1.4' }}>
                  {optOutput}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => copyToClipboard(optOutput)} style={{ flex: 1, padding: '6px', background: '#10b981', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Copy</button>
                  <button onClick={() => { setOptOutput(''); setOptInput(''); }} style={{ flex: 1, padding: '6px', background: '#475569', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>New</button>
                </div>
              </div>
            )}
          </div>

          {/* 2. PROMPT LIBRARY (Scrollable List) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', marginBottom: '10px', paddingLeft: '10px', letterSpacing: '0.5px' }}>LIBRARY</div>
            {sidebarData && sidebarData.map((group, idx) => (
              <details key={idx} open style={{ marginBottom: '10px' }}>
                <summary style={{ padding: '8px 10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', color: '#334155', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {group.category} <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>▼</span>
                </summary>
                {group.items.map((item, i) => (
                  <div key={i} onClick={() => item.type === 'prompt' ? copyToClipboard(item.content) : window.open(item.link)}
                    style={{ padding: '8px 10px 8px 20px', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer', borderLeft: '2px solid transparent', transition: 'all 0.1s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.borderLeft = '2px solid #2563eb'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderLeft = '2px solid transparent'; }}
                  >
                    {item.type === 'gpt' ? '🤖' : '📝'} {item.label}
                  </div>
                ))}
              </details>
            ))}
          </div>
        </aside>

        {/* --- MAIN CONTENT (RIGHT) --- */}
        <main style={{ flex: 1, marginLeft: '320px', padding: '40px', height: '100vh', overflowY: 'auto', width: 'calc(100% - 320px)' }}>
          
          {/* SEARCH HEADER */}
          <div style={{ maxWidth: '900px', margin: '0 auto 40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px', letterSpacing: '-1px' }}>Find the Perfect Model</h1>
            <div style={{ display: 'flex', background: 'white', padding: '8px', borderRadius: '50px', boxShadow: '0 4px 30px rgba(0,0,0,0.08)' }}>
              <input type="text" placeholder="Search 200+ models (e.g. 'Grok', 'Code')..." value={mainQuery} onChange={(e) => setMainQuery(e.target.value)} style={{ flex: 1, padding: '12px 25px', borderRadius: '50px', border: 'none', outline: 'none', fontSize: '1.1rem' }} />
              <button style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '40px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>Search</button>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '20px', justifyContent: 'center' }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{ padding: '8px 18px', borderRadius: '20px', border: '1px solid #e2e8f0', background: activeCategory === cat.id ? cat.solid : 'white', color: activeCategory === cat.id ? 'white' : '#64748b', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                <span style={{ marginRight: '6px' }}>{cat.icon}</span> {cat.id}
              </button>
            ))}
          </div>

          {/* GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
            {filteredTools.map((item) => {
              const theme = getConfig(item.category);
              return (
                <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none' }}>
                  <div className="tool-card" style={{ background: 'white', borderRadius: '20px', padding: '25px', border: `1px solid ${theme.solid}20`, height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
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
    </div>
  );
}
