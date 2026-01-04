import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'data', 'prompts.json');
  const fileData = fs.readFileSync(filePath);
  const tools = JSON.parse(fileData);
  return { props: { tools } };
}

export default function Home({ tools }) {
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFallback, setIsFallback] = useState(false);

  // --- 1. CONFIGURATION ---
  const categoryConfig = {
    'All':      { solid: '#334155', soft: '#f8fafc', icon: '🌍' },
    'Image':    { solid: '#9333ea', soft: '#f3e8ff', icon: '🎨' },
    'Video':    { solid: '#dc2626', soft: '#fef2f2', icon: '🎥' },
    'Coding':   { solid: '#2563eb', soft: '#eff6ff', icon: '💻' },
    'Writing':  { solid: '#d97706', soft: '#fffbeb', icon: '✍️' },
    'Research': { solid: '#059669', soft: '#ecfdf5', icon: '🔬' },
    'Business': { solid: '#4f46e5', soft: '#eef2ff', icon: '💼' },
    'Music':    { solid: '#db2777', soft: '#fdf2f8', icon: '🎵' },
    'Voice':    { solid: '#ea580c', soft: '#fff7ed', icon: '🎙️' },
    'Reasoning':{ solid: '#7c3aed', soft: '#f5f3ff', icon: '🧠' },
    '3D':       { solid: '#0891b2', soft: '#ecfeff', icon: '🧊' },
    'Life':     { solid: '#0d9488', soft: '#f0fdfa', icon: '🌱' },
    'Chat':     { solid: '#be185d', soft: '#fce7f3', icon: '💬' }
  };

  const getConfig = (cat) => categoryConfig[cat] || categoryConfig['All'];
  const categories = Object.keys(categoryConfig).filter(k => k !== 'Life').map(key => ({ id: key, ...categoryConfig[key] }));

  // --- 2. SMART SEARCH LOGIC ---
  const stopWords = ['create', 'make', 'generate', 'build', 'how', 'to', 'i', 'want', 'need', 'a', 'an', 'the', 'for', 'with', 'using', 'can', 'you'];

  const handleSearch = () => {
    // 1. Clean the input
    let cleanInput = inputValue.toLowerCase().trim();
    
    // 2. Remove "Stop Words" (e.g., "create resume" -> "resume")
    // This prevents matching "Create Music" when user wants "Resume"
    let importantWords = cleanInput.split(' ').filter(word => !stopWords.includes(word));
    
    // If the user ONLY typed stop words (e.g. "create"), keep them, otherwise use the filtered list
    let finalQuery = importantWords.length > 0 ? importantWords.join(' ') : cleanInput;

    setQuery(finalQuery);
    setActiveCategory('All');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // --- 3. FILTERING ---
  let displayTools = tools.filter(tool => {
    // Category Filter
    if (activeCategory !== 'All' && tool.category !== activeCategory) return false;
    
    // Search Filter
    if (query) {
      const toolText = `${tool.title} ${tool.model_name} ${tool.problem} ${tool.solution} ${tool.category}`.toLowerCase();
      
      // A. Exact Phrase Match (High Priority)
      if (toolText.includes(query)) return true;

      // B. Keyword Match (Filtered)
      const searchTerms = query.split(' ');
      // Check if ANY of the important keywords exist in the tool
      return searchTerms.some(term => toolText.includes(term));
    }
    return true;
  });

  // --- 4. SORTING ---
  if (query) {
    displayTools.sort((a, b) => {
      // Prioritize Exact Matches in Title
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aHasQuery = aTitle.includes(query);
      const bHasQuery = bTitle.includes(query);
      
      if (aHasQuery && !bHasQuery) return -1;
      if (!aHasQuery && bHasQuery) return 1;
      
      return (b.is_multimodal === true) - (a.is_multimodal === true);
    });
  } else {
    displayTools.sort((a, b) => (b.is_multimodal === true) - (a.is_multimodal === true));
  }

  // --- 5. FALLBACK ---
  useEffect(() => {
    setIsFallback(query && displayTools.length === 0);
  }, [query, displayTools.length]);

  const finalTools = (isFallback && query) ? tools.slice(0, 8) : displayTools;

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      <style jsx global>{`
        .tool-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .tool-card:hover { transform: translateY(-5px); }
        .search-input::placeholder { color: #94a3b8; }
      `}</style>

      {/* HERO */}
      <div style={{ 
        background: '#0f172a', 
        backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 70%)',
        padding: '70px 20px 90px', 
        textAlign: 'center', 
        color: 'white',
        borderBottom: '1px solid #1e293b'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '15px', letterSpacing: '-1px' }}>
          <span style={{ background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Command Center</span>
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px' }}>
          Find the perfect AI model for any task. Instantly.
        </p>

        <div style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '50px', padding: '6px', boxShadow: '0 0 0 4px rgba(255,255,255,0.1)' }}>
          <input 
            className="search-input"
            type="text" 
            placeholder="Type 'Resume', 'Logo', or 'Code'..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ 
              flex: 1, padding: '15px 25px', borderRadius: '50px', border: 'none', 
              fontSize: '1.1rem', outline: 'none', background: 'transparent', color: '#0f172a'
            }}
          />
          <button 
            onClick={handleSearch}
            style={{ 
              background: '#2563eb', color: 'white', border: 'none', padding: '12px 30px', 
              borderRadius: '40px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* CATEGORY BAR */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, padding: '15px 0' }}>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '0 20px', maxWidth: '1280px', margin: '0 auto', justifyContent: 'flex-start' }}>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setQuery(''); setInputValue(''); setIsFallback(false); }}
              style={{
                padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: activeCategory === cat.id ? cat.solid : cat.soft,
                color: activeCategory === cat.id ? 'white' : cat.solid, 
                fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap',
                transition: 'all 0.2s', border: `1px solid ${activeCategory === cat.id ? cat.solid : 'transparent'}`
              }}
            >
              <span style={{ marginRight: '6px' }}>{cat.icon}</span> {cat.id}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS GRID */}
      <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '20px', color: '#64748b', fontWeight: '500' }}>
          {isFallback ? (
            <div style={{ padding: '15px', background: '#fffbeb', color: '#b45309', borderRadius: '10px', border: '1px solid #fcd34d' }}>
              ⚠️ No exact match. Showing top recommendations:
            </div>
          ) : (
            <p>Showing {finalTools.length} results</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {finalTools.map((item) => {
            const theme = getConfig(item.category);
            
            return (
              <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div 
                  className="tool-card"
                  style={{ 
                    borderRadius: '20px', 
                    background: `linear-gradient(to bottom right, ${theme.soft}, #ffffff)`,
                    height: '100%', 
                    position: 'relative',
                    border: `1px solid ${theme.solid}20`,
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ 
                        background: 'white', color: theme.solid, 
                        padding: '6px 12px', borderRadius: '30px', 
                        fontSize: '0.75rem', fontWeight: '800', 
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                      }}>
                        {theme.icon} {item.category}
                      </div>
                      {item.is_multimodal && (
                        <div style={{ 
                          background: '#0f172a', color: '#fff', 
                          padding: '4px 10px', borderRadius: '8px', 
                          fontSize: '0.7rem', fontWeight: '700'
                        }}>
                          PRO
                        </div>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#1e293b', fontWeight: '800', letterSpacing: '-0.5px' }}>
                      {item.title}
                    </h3>

                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', flex: 1, marginBottom: '25px' }}>
                      {item.problem}
                    </p>

                    <div style={{ 
                      background: theme.solid, 
                      color: 'white',
                      padding: '12px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                      boxShadow: `0 4px 12px ${theme.solid}40`
                    }}>
                      Use {item.model_name} <span style={{ fontSize: '1.1rem' }}>→</span>
                    </div>

                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

