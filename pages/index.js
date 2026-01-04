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

  // --- 1. COLOR SYSTEM ---
  const categoryColors = {
    'All': '#111',
    'Image': '#8b5cf6', 
    'Video': '#ef4444', 
    'Coding': '#3b82f6', 
    'Writing': '#f59e0b', 
    'Research': '#10b981', 
    'Business': '#64748b', 
    'Music': '#ec4899', 
    'Voice': '#f97316', 
    'Reasoning': '#7c3aed',
    '3D': '#06b6d4'
  };

  const getCategoryColor = (cat) => categoryColors[cat] || '#666';
  const categories = Object.keys(categoryColors).map(key => ({ id: key, label: key }));

  // --- 2. SEARCH HANDLER ---
  const handleSearch = () => {
    setQuery(inputValue.toLowerCase().trim());
    setActiveCategory('All'); // Force reset to 'All' so we search everything
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // --- 3. OPTIMIZED FILTER LOGIC ---
  let displayTools = tools.filter(tool => {
    // A. Category Check
    if (activeCategory !== 'All' && tool.category !== activeCategory) return false;
    
    // B. Search Check (If query exists)
    if (query) {
      // Create a "Searchable String" that includes Title, Model Name, and Description
      const searchableText = `${tool.title} ${tool.model_name} ${tool.problem} ${tool.solution} ${tool.category}`.toLowerCase();
      
      // 1. Direct Match: If the tool name literally contains the search query (e.g. "gemini")
      if (searchableText.includes(query)) return true;

      // 2. Fuzzy Match: Split query into words (e.g. "edit video")
      const searchTerms = query.split(' ').filter(t => t.trim().length > 0);
      
      // Check if ANY of the words match (e.g. "video" matches)
      return searchTerms.some(term => searchableText.includes(term));
    }
    
    return true; // If no query, show everything in the category
  });

  // --- 4. SORTING (Smart Ranking) ---
  if (query) {
    displayTools.sort((a, b) => {
      // Rule 1: Exact Title Match gets priority (e.g. "Gemini" -> Gemini Pro)
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aMatch = aTitle.includes(query);
      const bMatch = bTitle.includes(query);
      
      if (aMatch && !bMatch) return -1; // A comes first
      if (!aMatch && bMatch) return 1;  // B comes first
      
      // Rule 2: "All-in-One" models come next
      return (b.is_multimodal === true) - (a.is_multimodal === true);
    });
  } else {
    // Default Sort: All-in-One at top
    displayTools.sort((a, b) => (b.is_multimodal === true) - (a.is_multimodal === true));
  }

  // --- 5. SAFETY NET ---
  useEffect(() => {
    if (query && displayTools.length === 0) {
      setIsFallback(true);
    } else {
      setIsFallback(false);
    }
  }, [query, displayTools.length]);

  const finalTools = (isFallback && query) ? tools.slice(0, 8) : displayTools;

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#111' }}>
      
      {/* HERO */}
      <div style={{ background: '#0f172a', padding: '60px 20px 80px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>AI Command Center</h1>
        <p style={{ color: '#cbd5e1', marginBottom: '30px', fontSize: '1.1rem' }}>One search. Every AI model.</p>

        <div style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '50px', padding: '5px' }}>
          <input 
            type="text" 
            placeholder="Type 'Gemini', 'DeepSeek', or 'Create Logo'..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, padding: '15px 25px', borderRadius: '50px', border: 'none', fontSize: '1.1rem', outline: 'none', color: '#333' }}
          />
          <button 
            onClick={handleSearch}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '40px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', display: 'flex', gap: '10px', justifyContent: 'center', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setQuery(''); setInputValue(''); setIsFallback(false); }}
            style={{
              padding: '8px 18px', borderRadius: '25px', border: 'none', cursor: 'pointer',
              background: activeCategory === cat.id ? getCategoryColor(cat.id) : '#f1f5f9',
              color: activeCategory === cat.id ? 'white' : '#64748b', 
              fontWeight: '700', whiteSpace: 'nowrap', transition: 'all 0.2s'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* RESULTS GRID */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '20px', color: '#64748b' }}>
          {isFallback ? (
            <div style={{ padding: '15px', background: '#fffbeb', color: '#b45309', borderRadius: '8px', border: '1px solid #fcd34d' }}>
              <strong>No results for "{inputValue}".</strong> Check out these top models:
            </div>
          ) : (
            <p>Showing {finalTools.length} results</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {finalTools.map((item) => (
            <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ 
                border: '1px solid #e2e8f0', borderRadius: '16px', padding: '25px', 
                background: 'white', height: '100%', position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s'
              }}>
                
                {/* BADGE for Multimodal */}
                {item.is_multimodal && (
                  <div style={{ 
                    position: 'absolute', top: 0, right: 0, background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', 
                    color: 'white', fontSize: '0.65rem', fontWeight: 'bold', padding: '5px 10px', 
                    borderBottomLeftRadius: '10px', textTransform: 'uppercase'
                  }}>
                    All-in-One
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <span style={{ 
                    background: getCategoryColor(item.category) + '20', 
                    color: getCategoryColor(item.category), 
                    padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase'
                  }}>
                    {item.category}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px', color: '#0f172a', fontWeight: '800' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>{item.problem}</p>
                
                <div style={{ 
                  borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginTop: 'auto',
                  fontSize: '0.9rem', fontWeight: '700', color: getCategoryColor(item.category),
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  Use {item.model_name} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

