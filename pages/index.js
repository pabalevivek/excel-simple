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

  // --- 1. PROFESSIONAL COLOR PALETTE (Vibrant & Modern) ---
  const categoryConfig = {
    'All':      { color: '#334155', bg: '#f1f5f9', icon: '🌍' },
    'Image':    { color: '#a855f7', bg: '#f3e8ff', icon: '🎨' }, // Purple
    'Video':    { color: '#ef4444', bg: '#fee2e2', icon: '🎥' }, // Red
    'Coding':   { color: '#3b82f6', bg: '#dbeafe', icon: '💻' }, // Blue
    'Writing':  { color: '#f59e0b', bg: '#fef3c7', icon: '✍️' }, // Amber
    'Research': { color: '#10b981', bg: '#d1fae5', icon: '🔬' }, // Emerald
    'Business': { color: '#6366f1', bg: '#e0e7ff', icon: '💼' }, // Indigo
    'Music':    { color: '#ec4899', bg: '#fce7f3', icon: '🎵' }, // Pink
    'Voice':    { color: '#f97316', bg: '#ffedd5', icon: '🎙️' }, // Orange
    'Reasoning':{ color: '#8b5cf6', bg: '#ede9fe', icon: '🧠' }, // Violet
    '3D':       { color: '#06b6d4', bg: '#cffafe', icon: '🧊' }, // Cyan
    'Life':     { color: '#14b8a6', bg: '#ccfbf1', icon: '🌱' }  // Teal
  };

  const getConfig = (cat) => categoryConfig[cat] || categoryConfig['All'];
  const categories = Object.keys(categoryConfig).filter(k => k !== 'Life').map(key => ({ id: key, ...categoryConfig[key] }));

  // --- 2. SEARCH HANDLER ---
  const handleSearch = () => {
    setQuery(inputValue.toLowerCase().trim());
    setActiveCategory('All');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // --- 3. FILTER LOGIC ---
  let displayTools = tools.filter(tool => {
    if (activeCategory !== 'All' && tool.category !== activeCategory) return false;
    
    if (query) {
      const toolText = `${tool.title} ${tool.model_name} ${tool.problem} ${tool.solution} ${tool.category}`.toLowerCase();
      
      // Exact Match (Priority)
      if (toolText.includes(query)) return true;
      
      // Fuzzy Match
      const searchTerms = query.split(' ').filter(t => t.trim().length > 1);
      return searchTerms.some(term => toolText.includes(term));
    }
    return true;
  });

  // --- 4. SORTING ---
  if (query) {
    displayTools.sort((a, b) => {
      const aMatch = a.title.toLowerCase().includes(query);
      const bMatch = b.title.toLowerCase().includes(query);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
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
    <div style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* CSS FOR HOVER EFFECTS */}
      <style jsx global>{`
        .tool-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tool-card:hover {
          transform: translateY(-8px);
        }
        .category-btn {
          transition: all 0.2s ease;
        }
        .category-btn:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* HERO SECTION */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        padding: '80px 20px 100px', 
        textAlign: 'center', 
        color: 'white',
        borderBottomLeftRadius: '50px',
        borderBottomRightRadius: '50px',
        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '15px', letterSpacing: '-1.5px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI Command Center
        </h1>
        <p style={{ color: '#cbd5e1', marginBottom: '40px', fontSize: '1.25rem', fontWeight: '400' }}>
          One search. Every AI model. Infinite possibilities.
        </p>

        {/* Search Bar */}
        <div style={{ display: 'flex', maxWidth: '650px', margin: '0 auto', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '60px', padding: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <input 
            type="text" 
            placeholder="Try 'Gemini', 'Logo Design', or 'Fix Code'..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ 
              flex: 1, padding: '15px 30px', borderRadius: '50px', border: 'none', 
              fontSize: '1.1rem', outline: 'none', background: 'transparent', color: 'white', fontWeight: '500'
            }}
          />
          <button 
            onClick={handleSearch}
            style={{ 
              background: '#fff', color: '#0f172a', border: 'none', padding: '12px 35px', 
              borderRadius: '40px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div style={{ marginTop: '-35px', padding: '0 20px', overflowX: 'auto', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button 
            key={cat.id}
            className="category-btn"
            onClick={() => { setActiveCategory(cat.id); setQuery(''); setInputValue(''); setIsFallback(false); }}
            style={{
              padding: '10px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer',
              background: activeCategory === cat.id ? cat.color : 'white',
              color: activeCategory === cat.id ? 'white' : '#64748b', 
              fontWeight: '600', fontSize: '0.95rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <span>{cat.icon}</span> {cat.id}
          </button>
        ))}
      </div>

      {/* RESULTS GRID */}
      <div style={{ maxWidth: '1280px', margin: '50px auto', padding: '0 25px' }}>
        
        {/* Status Text */}
        <div style={{ marginBottom: '30px', color: '#64748b', fontWeight: '500' }}>
          {isFallback ? (
            <div style={{ padding: '15px 20px', background: '#fffbeb', color: '#b45309', borderRadius: '12px', border: '1px solid #fcd34d', display: 'inline-block' }}>
              ⚠️ No exact match found. Showing top recommendations:
            </div>
          ) : (
            <p>Showing {finalTools.length} powerful models</p>
          )}
        </div>

        {/* THE CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' }}>
          {finalTools.map((item) => {
            const theme = getConfig(item.category);
            
            return (
              <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div 
                  className="tool-card"
                  style={{ 
                    borderRadius: '24px', 
                    background: 'white', 
                    height: '100%', 
                    position: 'relative',
                    border: '1px solid #f1f5f9',
                    boxShadow: `0 10px 40px -20px rgba(0,0,0,0.1)`, 
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 20px 40px -10px ${theme.color}40`; // Dynamic colored glow on hover
                    e.currentTarget.style.borderColor = theme.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 10px 40px -20px rgba(0,0,0,0.1)`;
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }}
                >
                  
                  {/* TOP BANNER (Dynamic Color) */}
                  <div style={{ 
                    height: '6px', 
                    width: '100%', 
                    background: theme.color,
                    opacity: 0.8
                  }}></div>

                  {/* CARD BODY */}
                  <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Header: Icon + Category */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div style={{ 
                        background: theme.bg, color: theme.color, 
                        padding: '8px 12px', borderRadius: '12px', 
                        fontSize: '0.8rem', fontWeight: '800', 
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        {theme.icon} {item.category}
                      </div>

                      {/* Multimodal Badge */}
                      {item.is_multimodal && (
                        <div style={{ 
                          background: 'linear-gradient(135deg, #111, #444)', color: '#fff', 
                          padding: '6px 10px', borderRadius: '8px', 
                          fontSize: '0.7rem', fontWeight: '700',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}>
                          ⚡ PRO
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.5rem', margin: '0 0 10px', color: '#1e293b', fontWeight: '800', letterSpacing: '-0.5px' }}>
                      {item.title}
                    </h3>

                    {/* Problem/Desc */}
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', flex: 1 }}>
                      {item.problem}
                    </p>

                    {/* Footer / Action Button */}
                    <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ 
                        background: theme.bg,
                        color: theme.color,
                        padding: '12px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        transition: 'filter 0.2s'
                      }}>
                        Use {item.model_name} →
                      </div>
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

