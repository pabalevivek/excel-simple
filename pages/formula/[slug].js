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

  const handleCopy = async () => {
    // 1. Try the Modern Way (navigator.clipboard)
    try {
      await navigator.clipboard.writeText(promptData.prompt);
      setCopied(true);
    } catch (err) {
      // 2. If that fails, use the "Old School" Way (textarea fallback)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = promptData.prompt;
        
        // Ensure it's part of the document but hidden
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
      } catch (fallbackErr) {
        alert("Could not copy automatically. Please copy the text manually.");
      }
    }
    
    // Reset the green checkmark after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  if (!promptData) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: '-apple-system, sans-serif' }}>
      
      <Link href="/" style={{ textDecoration: 'none', color: '#666', fontSize: '0.9rem' }}>← Back to Library</Link>

      <h1 style={{ marginTop: '20px', fontSize: '1.8rem' }}>{promptData.title}</h1>
      
      {/* The Prompt Box */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', margin: '20px 0' }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#555', fontSize: '0.75rem', letterSpacing: '1px' }}>PROMPT TEMPLATE:</p>
        <code style={{ fontSize: '1rem', color: '#222', display: 'block', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
          {promptData.prompt}
        </code>
        
        {/* The Copy Button */}
        <button 
          onClick={handleCopy}
          style={{ 
            marginTop: '15px', 
            background: copied ? '#10b981' : '#111', // Green if copied, Black if not
            color: 'white', 
            border: 'none', 
            padding: '12px 20px', 
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            width: '100%',
            transition: 'background 0.2s'
          }}
        >
          {copied ? '✅ Copied to Clipboard!' : '📋 Copy Prompt'}
        </button>
      </div>

      {/* The Link Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{color: '#666', marginBottom: '10px'}}>Ready to use?</p>
        <a 
          href={promptData.model_link} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: '#0070f3', 
            textDecoration: 'none', 
            fontWeight: 'bold', 
            fontSize: '1.1rem',
            borderBottom: '2px solid #0070f3'
          }}
        >
          Open {promptData.model_name} ↗
        </a>
      </div>
    </div>
  );
}
