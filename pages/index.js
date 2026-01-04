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
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // 1. Define Professional Categories (The "One-Stop" Departments)
  const categories = [
    { id: 'All', label: '🌍 All Tools' },
    { id: 'Image', label: '🎨 Image & Art' },
    { id: 'Video', label: '🎥 Video & Animation' },
    { id: 'Coding', label: '💻 Coding & Dev' },
    { id: 'Writing', label: '✍️ Writing & Copy' },
    { id: 'Research', label: '🔬 Research & PDF' },
    { id: 'Business', label: '💼 Business & Data' },
    { id: 'Life', label: '🧘 Lifestyle & Fun' } // Maps to 'Fun', 'Health', 'Travel'
  ];

  // 2. The Recommendation Logic
  const filteredTools = tools.filter(tool => {
    // Search Matching: Checks Title, Problem, and Solution text
    const matchesSearch = 
      tool.title.toLowerCase().includes(query.toLowerCase()) || 
      tool.problem.toLowerCase().includes(query.toLowerCase()) ||
      tool.solution.toLowerCase().includes(query.toLowerCase());

    // Category Matching: Smart mapping of your JSON tags to the UI buttons
    let matchesCategory = false;
    if (activeCategory === 'All') matchesCategory = true;
    else if (activeCategory === 'Life') matchesCategory = ['Fun', 'Health', 'Travel', 'Lifestyle'].includes(tool.category);
    else if (activeCategory === 'Business') matchesCategory = ['Business', 'Finance', 'Data', 'Marketing', 'Meeting'].includes(tool.category);
    else matchesCategory = tool.category.includes(activeCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', background: '#ffffff', minHeight: '100vh', color: '#111' }}>
      
      {/* --- HERO SECTION (The "Ask Me Anything" Area) --- */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        padding: '80px 20px 100px 20px', textAlign: 'center', color: 'white' 
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '15px', letterSpacing: '-1px' }}>
          Your AI Command Center
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          One place for every AI tool. Describe your task, and we'll find the perfect model for you.
        </p>

        {/* The Search Bar */}
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="Ex: 'How do I make a logo?' or 'Fix my Python code'..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '20px 25px', borderRadius: '50px', border: 'none',
              fontSize: '1.1rem', outline: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
          />
          <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem' }}>
            🔍
          </div>
        </div>
      </div>

      {/* --- CATEGORY NAVIGATION (Professional Tabs) --- */}
      <div style={{ 
        background: '#ffffff', padding: '20px', borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 100, overflowX: 'auto', whiteSpace: 'nowrap',
        display: 'flex', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
      }}>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '10px 20px', borderRadius: '30px', border: 'none', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: '600', transition: 'all 0.2s',
              background: activeCategory === cat.id ? '#0f172a' : '#f1f5f9',
              color: activeCategory === cat.id ? 'white' : '#64748b'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* --- RESULTS GRID (The Recommendations) --- */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        
        {filteredTools.length > 0 ? (
          filteredTools.map((item) => (
            <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ 
                background: 'white', borderRadius: '16px', padding: '30px', height: '100%',
                border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}
              >
                {/* Header: Category Badge & Arrow */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ 
                    background: '#f0f9ff', color: '#0369a1', padding: '6px 12px', 
                    borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' 
                  }}>
                    {item.category}
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: '1.2rem' }}>↗</span>
                </div>

                {/* Title & Problem */}
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px', color: '#0f172a' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: '1.6', flex: '1' }}>
                  {item.problem}
                </p>

                {/* Footer: The Solution */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#22c55e', width: '8px', height: '8px', borderRadius: '50%' }}></span>
                    Use {item.model_name}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No tools found for "{query}"</h3>
            <p>Try searching for specific tasks like "write email", "edit video", or "chart".</p>
          </div>
        )}
      </div>

    </div>
  );
}
