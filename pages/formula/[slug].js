import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useState } from 'react';

export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), 'data', 'prompts.json');
  const fileData = fs.readFileSync(filePath);
  const tools = JSON.parse(fileData);
  const paths = tools.map((item) => ({ params: { slug: item.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), 'data', 'prompts.json');
  const fileData = fs.readFileSync(filePath);
  const tools = JSON.parse(fileData);
  const promptData = tools.find((item) => item.slug === params.slug);
  return { props: { promptData } };
}

export default function PromptPage({ promptData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Mobile-friendly copy trick
    const textArea = document.createElement("textarea");
    textArea.value = promptData.prompt;
    textArea.style.position = "fixed"; 
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
    } catch (err) {
      alert("Manual copy required.");
    }
    document.body.removeChild(textArea);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!promptData) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <Link href="/" style={{ textDecoration: 'none', color: '#666' }}>← Back to Library</Link>
      <h1 style={{ marginTop: '20px' }}>{promptData.title}</h1>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', margin: '20px 0' }}>
        <p style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#555' }}>PROMPT:</p>
        <code style={{ display: 'block', whiteSpace: 'pre-wrap', marginBottom: '15px' }}>
          {promptData.prompt}
        </code>
        <button 
          onClick={handleCopy}
          style={{ 
            background: copied ? '#10b981' : '#000', color: 'white', border: 'none', 
            padding: '12px', borderRadius: '8px', width: '100%', fontSize: '1rem' 
          }}
        >
          {copied ? '✅ Copied!' : '📋 Copy Prompt'}
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <a href={promptData.model_link} target="_blank" style={{ color: '#0070f3', fontWeight: 'bold', fontSize: '1.2rem' }}>
          Open {promptData.model_name} ↗
        </a>
      </div>
    </div>
  );
}
