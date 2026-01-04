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
  const [isFallback, setIsFallback] = useState(false); // Tracks if we are showing "Backup" results

  // --- 1. SMART SYNONYMS ---
  const synonymMap = {
    'movie': 'video', 'film': 'video', 'clip': 'video',
    'pic': 'image', 'photo': 'image', 'picture': 'image', 'draw': 'image',
    'logo': 'design', 'brand': 'design', 'edit': 'design', // Maps 'edit' to design/image tools
    'fix': 'coding', 'bug': 'coding', 'code': 'coding',
    'excel': 'data', 'sheets': 'data', 'chart': 'data',
    'song': 'music', 'audio': 'music', 'sound': 'music',
    'resume': 'career', 'job': 'career', 'work': 'productivity'
  };

  const categories = [
    { id: 'All', label: '🌍 All' },
    { id: 'Image', label: '🎨 Image' },
    { id: 'Video', label: '🎥 Video' },
    { id: 'Coding', label: '💻 Coding' },
    { id: 'Writing', label: '✍️ Writing' },
    { id: 'Research', label: '🔬 Research' },
    { id: 'Business', label: '💼 Business' },
    { id: 'Music', label: '🎵 Music' }
  ];

  // --- 2. SEARCH HANDLER ---
  const handleSearch = () => {
    let cleanInput = inputValue.toLowerCase().trim();
    
    // Inject synonyms (e.g., "edit" adds "design")
    Object.keys(synonymMap).forEach(key => {
      if (cleanInput.includes(key)) {
        cleanInput += " " + synonymMap[key];
      }
    });

    setQuery(cleanInput);
    setActiveCategory('All');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // --- 3. FILTERING LOGIC (The "Zero-Fail" System) ---
  let displayTools = tools.filter(tool => {
    // 1. Category Filter
    if (activeCategory !== 'All' && tool.category !== activeCategory) return false;
    
    // 2. Search Filter (Split query into words)
    if (query) {
      const toolText = `${tool.title} ${tool.problem} ${tool.solution} ${tool.category}`.toLowerCase();
      const searchTerms = query.split(' ').filter(term => term.length > 2); // Ignore tiny words like "is", "a"
      
      // If ANY search term matches, we show the tool (OR Logic instead of AND)
      // This fixes "edit images" finding "images" tools even if they don't say "edit"
      return searchTerms.some(term => toolText.includes(term));
    }
    return true;
  });

  // --- 4. THE SAFETY NET (Fallback) ---
  // If search produced 0 results, force show the top tools
  useEffect(() => {
    if (query && displayTools.length === 0) {
      setIsFallback(true);
    } else {
      setIsFallback(false);
    }
  }, [query, displayTools.length]);

  // If fallback is active, show the first 8 tools as "Recommendations"
  const finalTools = (isFallback && query) ? tools.slice(0, 8) : displayTools;

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh', color: '#111' }}>
      
      {/* HERO SECTION */}
      <div style={{ background: '#000', padding: '60px 20px 80px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>AI Command Center</h1>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1.1rem' }}>
          What do you want to create today?
        </p>

        {/* SEARCH BAR */}
        <div style={{ 
          display: 'flex', maxWidth: '600px', margin: '0 auto', 
          background: 'white', borderRadius: '50px', padding: '5px',
          boxShadow: '0 5px 20px rgba(255,255,255,0.2)'
        }}>
          <input 
            type="text" 
            placeholder="Type 'edit images', 'fix code', 'write email'..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, padding: '15px 25px', borderRadius: '50px', border: 'none',
              fontSize: '1.1rem', outline: 'none', color: '#333'
            }}
          />
          <button 
            onClick={handleSearch}
            style={{
              background: '#0070f3', color: 'white', border: 'none',
              padding: '12px 30px', borderRadius: '40px', fontSize: '1rem',
              fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ 
        padding: '20px', borderBottom: '1px solid #eee', overflowX: 'auto', 
        display: 'flex', gap: '10px', justifyContent: 'center', background: '#f9f9f9'
      }}>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setQuery(''); setInputValue(''); setIsFallback(false); }}
            style={{
              padding: '8px 18px', borderRadius: '25px', border: 'none', cursor: 'pointer',
              background: activeCategory === cat.id ? '#000' : 'white',
              color: activeCategory === cat.id ? 'white' : '#555', 
              fontWeight: '600', border: '1px solid #ddd', whiteSpace: 'nowrap'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* RESULTS GRID */}
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Results Header / Fallback Message */}
        <div style={{ marginBottom: '20px', color: '#666' }}>
          {isFallback ? (
            <div style={{ padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '8px', border: '1px solid #ffeeba' }}>
              <strong>No exact match for "{inputValue}".</strong> But don't worry—here are the best AI tools for you:
            </div>
          ) : (
            <p>Showing {finalTools.length} results</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {finalTools.map((item) => (
            <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ 
                border: '1px solid #eee', borderRadius: '16px', padding: '25px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%', background: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ 
                    background: '#f0f9ff', color: '#0070f3', padding: '5px 12px', 
                    borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                  }}>
                    {item.category}
                  </span>
                  <span style={{ color: '#ddd' }}>↗</span>
                </div>
                
                <h3 style={{ fontSize: '1.3rem', margin: '0 0 10px', color: '#111' }}>{item.title}</h3>
                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>{item.problem}</p>
                
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f7f7f7', fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>
                  Use {item.model_name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
