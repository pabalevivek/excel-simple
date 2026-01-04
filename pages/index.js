import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useState } from 'react';

// --- 1. DATA LOADING (Server Side) ---
export async function getStaticProps() {
  try {
    const toolsPath = path.join(process.cwd(), 'data', 'prompts.json');
    const toolsData = fs.readFileSync(toolsPath);
    const tools = JSON.parse(toolsData);
    return { props: { tools } };
  } catch (e) {
    // Default data if file is missing (Safety Net)
    return { props: { tools: [
      { title: "ChatGPT-4o", category: "Super AI", problem: "Best for logic & complex tasks", model_link: "https://chat.openai.com" },
      { title: "Claude 3.5 Sonnet", category: "Coding", problem: "The king of coding & reasoning", model_link: "https://claude.ai" },
      { title: "Midjourney", category: "Image", problem: "Unbeatable photorealistic images", model_link: "https://midjourney.com" },
      { title: "Perplexity", category: "Research", problem: "Real-time web search & citation", model_link: "https://perplexity.ai" }
    ]}};
  }
}

export default function Home({ tools }) {
  // --- STATE ---
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Optimizer State
  const [optInput, setOptInput] = useState('');
  const [optResult, setOptResult] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // --- CONFIGURATION ---
  const categories = ["All", "Super AI", "Coding", "Image", "Video", "Research", "Writing"];

  // --- LOGIC ---
  const handleOptimize = () => {
    if (!optInput) return;
    setIsOptimizing(true);
    // Simulating a smart AI response
    setTimeout(() => {
      setOptResult(`🎯 **PRO OPTIMIZATION:**\n\n"Act as a world-class expert. Your task is to ${optInput}.\n\nSteps to follow:\n1. Analyze the constraints.\n2. Think step-by-step.\n3. Provide a solution with examples."`);
      setIsOptimizing(false);
    }, 1000);
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(query.toLowerCase()) || 
                          tool.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', minHeight: '100vh', background: '#F8FAFC', color: '#0F172A' }}>
      <Head>
        <title>AI Command Center</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; }
          .btn-primary { background: #0F172A; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
          .btn-primary:hover { background: #334155; transform: translateY(-1px); }
          .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -10px rgba(0,0,0,0.1); border-color: #3B82F6; }
          .category-pill { cursor: pointer; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; font-weight: 600; transition: all 0.2s; }
          .category-pill.active { background: #0F172A; color: white; }
          .category-pill.inactive { background: white; color: #64748B; border: 1px solid #E2E8F0; }
          .category-pill.inactive:hover { background: #F1F5F9; }
        `}</style>
      </Head>

      {/* --- 1. NAVBAR --- */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '800' }}>
          <span>🤖</span> AI COMMAND CENTER
        </div>
        <button className="btn-primary" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>Submit Tool +</button>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <header style={{ textAlign: 'center', padding: '60px 20px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '15px', letterSpacing: '-1px' }}>
          Unlock the Power of AI
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Discover the best AI models for coding, writing, and art. Optimized for professionals.
        </p>

        {/* PROMPT OPTIMIZER WIDGET */}
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontWeight: '700', color: '#6366F1', fontSize: '0.9rem' }}>
            <span>✨</span> PROMPT OPTIMIZER
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="E.g. 'Write a python script to scrape data'..." 
              value={optInput}
              onChange={(e) => setOptInput(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', minWidth: '200px' }}
            />
            <button onClick={handleOptimize} className="btn-primary">
              {isOptimizing ? 'Optimizing...' : 'Optimize →'}
            </button>
          </div>
          {optResult && (
            <div style={{ marginTop: '15px', padding: '15px', background: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #6366F1', whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: '#334155' }}>
              {optResult}
            </div>
          )}
        </div>
      </header>

      {/* --- 3. TOOL DIRECTORY --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* FILTERS & SEARCH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="🔍 Search directory..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '50px', border: '1px solid #CBD5E1', textAlign: 'center' }}
          />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map(cat => (
              <div 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`category-pill ${activeCategory === cat ? 'active' : 'inactive'}`}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* CARDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredTools.map((tool, i) => (
            <a key={i} href={tool.model_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card-hover" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    {tool.category}
                  </span>
                  <span style={{ fontSize: '1.2rem' }}>↗</span>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: '700', color: '#0F172A' }}>{tool.title}</h3>
                <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: '1.5', flex: 1 }}>{tool.problem}</p>
                <div style={{ marginTop: '20px', color: '#2563EB', fontWeight: '600', fontSize: '0.9rem' }}>Try {tool.title}</div>
              </div>
            </a>
          ))}
        </div>
      </main>

      {/* --- 4. FOOTER --- */}
      <footer style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '0.9rem', borderTop: '1px solid #E2E8F0', marginTop: '40px' }}>
        <p>© 2024 AI Command Center. Built with Next.js.</p>
      </footer>
    </div>
  );
}
