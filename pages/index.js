import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useState } from 'react';

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'data', 'prompts.json');
  const fileData = fs.readFileSync(filePath);
  const tools = JSON.parse(fileData);
  return { props: { tools } };
}

export default function Home({ tools }) {
  const [inputValue, setInputValue] = useState(''); // What the user types
  const [query, setQuery] = useState(''); // What we actually search for
  const [activeCategory, setActiveCategory] = useState('All');

  // --- 1. THE "SMART" SYNONYM BRAIN ---
  // This maps common user words to your actual data categories/keywords
  const synonymMap = {
    'movie': 'video',
    'film': 'video',
    'clip': 'video',
    'pic': 'image',
    'photo': 'image',
    'picture': 'image',
    'draw': 'image',
    'art': 'image',
    'logo': 'design',
    'edit': 'design', // If they type "edit", show Design tools
    'fix': 'coding',  // If they type "fix", show Coding tools
    'debug': 'coding',
    'excel': 'data',
    'sheets': 'data',
    'song': 'music',
    'audio': 'music',
    'sound': 'music',
    'resume': 'career',
    'job': 'career'
  };

  // --- 2. CATEGORIES ---
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

  // --- 3. HANDLE SEARCH (Click or Enter) ---
  const handleSearch = () => {
    // Convert user input to lower case and check for synonyms
    let cleanInput = inputValue.toLowerCase().trim();
    
    // Check if the user typed a known synonym (e.g., "movies" -> "video")
    Object.keys(synonymMap).forEach(key => {
      if (cleanInput.includes(key)) {
        cleanInput += " " + synonymMap[key]; // Append the "real" keyword
      }
    });

    setQuery(cleanInput);
    setActiveCategory('All'); // Reset category to show all search results
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // --- 4. FILTERING LOGIC ---
  const filteredTools = tools.filter(tool => {
    // Combine all text fields into one big string to search against
    const toolText = `${tool.title} ${tool.problem} ${tool.solution} ${tool.category}`.toLowerCase();
    
    // Search Check: Does the tool contain the query words?
    // We split query by space to allow "edit images" to find "Image Editor"
    const searchTerms = query.split(' ');
    const matchesSearch = searchTerms.every(term => toolText.includes(term));

    // Category Check
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;

    // Only show if it matches BOTH (unless query is empty, then just Category)
    if (query === '') return matchesCategory;
    return matchesSearch;
  });

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh', color: '#111' }}>
      
      {/* HERO SECTION */}
      <div style={{ background: '#000', padding: '60px 20px 80px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>AI Command Center</h1>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1.1rem' }}>
          Describe your task (e.g. "edit photos", "fix code")
        </p>

        {/* SEARCH BAR CONTAINER */}
        <div style={{ 
          display: 'flex', maxWidth: '600px', margin: '0 auto', 
          background: 'white', borderRadius: '50px', padding: '5px',
          boxShadow: '0 5px 20px rgba(255,255,255,0.2)'
        }}>
          {/* Input Field */}
          <input 
            type="text" 
            placeholder="What do you want to create?" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, padding: '15px 25px', borderRadius: '50px', border: 'none',
              fontSize: '1.1rem', outline: 'none', color: '#333'
            }}
          />
          
          {/* Search Button */}
          <button 
            onClick={handleSearch}
            style={{
              background: '#0070f3', color: 'white', border: 'none',
              padding: '12px 30px', borderRadius: '40px', fontSize: '1rem',
              fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s'
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div style={{ 
        padding: '20px', borderBottom: '1px solid #eee', overflowX: 'auto', 
        display: 'flex', gap: '10px', justifyContent: 'center', background: '#f9f9f9'
      }}>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setQuery(''); setInputValue(''); }}
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
        
        {/* Result Count */}
        <p style={{ color: '#888', marginBottom: '20px' }}>
          Found {filteredTools.length} tools {query && `for "${inputValue}"`}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {filteredTools.length > 0 ? (
            filteredTools.map((item) => (
              <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  border: '1px solid #eee', borderRadius: '16px', padding: '25px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%', background: 'white',
                  transition: 'transform 0.2s'
                }}
                >
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
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#999' }}>
              <h3>No tools found.</h3>
              <p>Try searching for "video", "code", or "writing".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

