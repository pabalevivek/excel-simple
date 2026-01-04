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

  // --- 1. CONFIGURATION (Added "Super AI" Tab) ---
  const categoryConfig = {
    'All':        { solid: '#334155', soft: '#f8fafc', icon: '🌍' },
    'Super AI':   { solid: '#000000', soft: '#f3f4f6', icon: '⚡' }, // NEW TAB
    'Reasoning':  { solid: '#7c3aed', soft: '#f5f3ff', icon: '🧠' },
    'Chat':       { solid: '#be185d', soft: '#fce7f3', icon: '💬' },
    'Image':      { solid: '#9333ea', soft: '#f3e8ff', icon: '🎨' },
    'Video':      { solid: '#dc2626', soft: '#fef2f2', icon: '🎥' },
    'Coding':     { solid: '#2563eb', soft: '#eff6ff', icon: '💻' },
    'Writing':    { solid: '#d97706', soft: '#fffbeb', icon: '✍️' },
    'Research':   { solid: '#059669', soft: '#ecfdf5', icon: '🔬' },
    'Business':   { solid: '#4f46e5', soft: '#eef2ff', icon: '💼' },
    'Music':      { solid: '#db2777', soft: '#fdf2f8', icon: '🎵' },
    'Voice':      { solid: '#ea580c', soft: '#fff7ed', icon: '🎙️' },
    '3D':         { solid: '#0891b2', soft: '#ecfeff', icon: '🧊' }
  };

  const getConfig = (cat) => categoryConfig[cat] || categoryConfig['All'];
  
  // Create the list of tabs
  const categories = Object.keys(categoryConfig).map(key => ({ id: key, ...categoryConfig[key] }));

  // --- 2. SEARCH LOGIC ---
  const handleSearch = () => {
    setQuery(inputValue.toLowerCase().trim());
    setActiveCategory('All');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // --- 3. FILTERING LOGIC (Fixed for Tabs) ---
  let displayTools = tools.filter(tool => {
    // A. Tab Filter
    if (activeCategory === 'Super AI') {
      if (!tool.is_multimodal) return false; // Only show PRO models
    } else if (activeCategory !== 'All' && tool.category !== activeCategory) {
      return false;
    }
    
    // B. Search Filter
    if (query) {
      const toolText = `${tool.title} ${tool.model_name} ${tool.problem} ${tool.category}`.toLowerCase();
      // Simple keyword match
      if (toolText.includes(query)) return true;
      return false;
    }
    return true;
  });

  // --- 4. SORTING ---
  // Always put PRO models at the top
  displayTools.sort((a, b) => (b.is_multimodal === true) - (a.is_multimodal === true));

  // --- 5. FALLBACK ---
  useEffect(() => {
    setIsFallback(query && displayTools.length === 0);
  }, [query, displayTools.length]);

  const finalTools = (isFallback && query) ? tools.slice(0, 8) : displayTools;

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* HERO */}
      <div style={{ 
        background: '#0f172a', 
        padding: '60px 20px 80px', 
        textAlign: 'center', 
        color: 'white'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '15px' }}>
          <span style={{ background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Command Center</span>
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '1.2rem' }}>
          {tools.length}+ Models. One Search.
        </p>

        <div style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '50px', padding: '6px' }}>
          <input 
            type="text" 
            placeholder="Search 'GPT-5', 'Logo', or 'Code'..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ 
              flex: 1, padding: '15px 25px', borderRadius: '50px', border: 'none', 
              fontSize: '1.1rem', outline: 'none', color: '#0f172a'
            }}
          />
          <button 
            onClick={handleSearch}
            style={{ 
              background: '#2563eb', color: 'white', border: 'none', padding: '12px 30px', 
              borderRadius: '40px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, padding: '15px 0' }}>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '0 20px', justifyContent: 'flex-start' }}>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setQuery(''); setInputValue(''); }}
              style={{
                padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: activeCategory === cat.id ? cat.solid : cat.soft,
                color: activeCategory === cat.id ? 'white' : cat.solid, 
                fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap',
                border: `1px solid ${activeCategory === cat.id ? cat.solid : 'transparent'}`
              }}
            >
              <span style={{ marginRight: '6px' }}>{cat.icon}</span> {cat.id}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS */}
      <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 20px' }}>
        <p style={{ marginBottom: '20px', color: '#64748b' }}>
          Showing {finalTools.length} results
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {finalTools.map((item) => {
            const theme = getConfig(item.category);
            return (
              <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  borderRadius: '20px', background: 'white', height: '100%', 
                  border: `1px solid ${theme.solid}20`, padding: '25px',
                  display: 'flex', flexDirection: 'column', position: 'relative',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                  
                  {/* HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ background: theme.soft, color: theme.solid, padding: '6px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '800' }}>
                      {theme.icon} {item.category}
                    </div>
                    
                    {/* THE PRO BADGE */}
                    {item.is_multimodal && (
                      <div style={{ background: 'black', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        ⚡ ALL-IN-ONE
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#1e293b', fontWeight: '800' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '25px', flex: 1 }}>{item.problem}</p>

                  <div style={{ background: theme.solid, color: 'white', padding: '12px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                    Use {item.model_name} →
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

