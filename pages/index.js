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

  // Categories for the tabs
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

  // Search Logic
  const filteredTools = tools.filter(tool => {
    const matchesSearch = 
      tool.title.toLowerCase().includes(query.toLowerCase()) || 
      tool.problem.toLowerCase().includes(query.toLowerCase()) ||
      tool.solution.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh', color: '#111' }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ background: '#000', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>AI Command Center</h1>
        <p style={{ color: '#888', marginBottom: '30px' }}>Describe your task, and we'll find the perfect tool.</p>

        {/* Search Bar */}
        <input 
          type="text" 
          placeholder="Ex: 'make a logo' or 'fix my code'..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%', maxWidth: '500px', padding: '15px 25px', borderRadius: '50px',
            border: 'none', fontSize: '1.1rem', outline: 'none'
          }}
        />
      </div>

      {/* 2. CATEGORY TABS */}
      <div style={{ 
        padding: '20px', borderBottom: '1px solid #eee', overflowX: 'auto', 
        display: 'flex', gap: '10px', justifyContent: 'center'
      }}>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: activeCategory === cat.id ? '#000' : '#f0f0f0',
              color: activeCategory === cat.id ? 'white' : '#666', fontWeight: '600'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. RESULTS GRID */}
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredTools.map((item) => (
          <Link href={`/formula/${item.slug}`} key={item.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ 
              border: '1px solid #eee', borderRadius: '15px', padding: '20px', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)', height: '100%'
            }}>
              <span style={{ 
                background: '#f0f9ff', color: '#0070f3', padding: '5px 10px', 
                borderRadius: '5px', fontSize: '0.8rem', fontWeight: 'bold' 
              }}>
                {item.category}
              </span>
              <h3 style={{ fontSize: '1.2rem', margin: '15px 0 10px' }}>{item.title}</h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>{item.problem}</p>
              <div style={{ marginTop: '15px', fontWeight: '600', fontSize: '0.9rem' }}>
                Use {item.model_name} →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

