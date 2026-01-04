import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export async function getStaticProps() {
  // We read the new 'prompts.json' file here
  const filePath = path.join(process.cwd(), 'data', 'prompts.json');
  const fileData = fs.readFileSync(filePath);
  const prompts = JSON.parse(fileData);
  return { props: { prompts } };
}

export default function Home({ prompts }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🚀 Prompt Library</h1>
      
      {prompts.map((item) => (
        <div key={item.slug} style={{ 
          border: '1px solid #eee', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '15px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <span style={{ 
            background: '#e6f7ff', color: '#0070f3',
            padding: '4px 8px', borderRadius: '4px', 
            fontSize: '0.8rem', fontWeight: 'bold'
          }}>
            {item.category}
          </span>

          <h3 style={{ margin: '10px 0' }}>
            <Link href={`/formula/${item.slug}`} style={{ textDecoration: 'none', color: '#333' }}>
              {item.title}
            </Link>
          </h3>
          
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            Model: <strong>{item.model_name}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
