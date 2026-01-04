import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useState } from 'react';

export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), 'data', 'prompts.json');
  const fileData = fs.readFileSync(filePath);
  const prompts = JSON.parse(fileData);
  const paths = prompts.map((item) => ({ params: { slug: item.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), 'data', 'prompts.json');
  const fileData = fs.readFileSync(filePath);
  const prompts = JSON.parse(fileData);
  const promptData = prompts.find((item) => item.slug === params.slug);
  return { props: { promptData } };
}

export default function PromptPage({ promptData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptData.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!promptData) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <Link href="/" style={{ textDecoration: 'none', color: '#888' }}>← Back to Library</Link>
      <h1 style={{ marginTop: '20px' }}>{promptData.title}</h1>
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #ddd', margin: '20px 0' }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#555', fontSize: '0.8rem' }}>PROMPT:</p>
        <code style={{ fontSize: '1.1rem', color: '#333', display: 'block', whiteSpace: 'pre-wrap' }}>
          {promptData.prompt}
        </code>
        <button onClick={handleCopy} style={{ marginTop: '15px', background: copied ? '#52c41a' : '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}>
          {copied ? '✅ Copied!' : '📋 Copy Prompt'}
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <a href={promptData.model_link} target="_blank" rel="noopener noreferrer" style={{ background: '#0070f3', color: 'white', padding: '15px 30px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
          Open {promptData.model_name} ↗
        </a>
      </div>
    </div>
  );
}
