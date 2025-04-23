import { highlightCodeSyntax } from './syntax.js';

export function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function parseMarkdown(text) {
    if (!text) return '';
    
    // First, capture and temporarily replace code blocks to prevent their contents from being parsed
    const codeBlocks = [];
    text = text.replace(/```(\w*)([\s\S]*?)```/g, function(match, language, code) {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push({
            language: language,
            code: code.trim()
        });
        return placeholder;
    });
    
    // Handle inline code (also store and replace)
    const inlineCodes = [];
    text = text.replace(/`([^`]+)`/g, function(match, code) {
        const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
        inlineCodes.push(code);
        return placeholder;
    });
    
    // Process other markdown elements
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    text = text.replace(/(?<!\*)\*(?!\s)([^\*]+?)(?<!\s)\*(?!\*)/g, '<em>$1</em>');
    
    text = text.replace(/^\> (.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Handle lists
    let inList = false;
    let listType = null;
    let currentLevel = 0;
    let levels = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const olMatch = lines[i].match(/^(\s*)(\d+)\.\s+(.+)$/);
        const ulMatch = lines[i].match(/^(\s*)([\*\+\-])\s+(.+)$/);
        
        if (olMatch || ulMatch) {
            const match = olMatch || ulMatch;
            const [_, indent, marker, content] = match;
            const isOrdered = !!olMatch;
            const indentLevel = indent.length;
            
            if (!inList) {
                inList = true;
                listType = isOrdered ? 'ol' : 'ul';
                currentLevel = indentLevel;
                levels = [listType];
                
                lines[i] = `<${listType}><li>${content}</li>`;
            } else {
                if (indentLevel > currentLevel) {
                    const newListType = isOrdered ? 'ol' : 'ul';
                    levels.push(newListType);
                    lines[i-1] = lines[i-1].replace(/<\/li>$/, `<${newListType}>`);
                    lines[i] = `<li>${content}</li>`;
                    currentLevel = indentLevel;
                } else if (indentLevel < currentLevel) {
                    let closeTags = '';
                    while (levels.length > 1 && indentLevel < currentLevel) {
                        closeTags += `</${levels.pop()}>`;
                        currentLevel = indent.length;
                    }
                    lines[i-1] = lines[i-1].replace(/<\/li>$/, `</li>${closeTags}`);
                    lines[i] = `<li>${content}</li>`;
                    currentLevel = indentLevel;
                } else {
                    lines[i] = `<li>${content}</li>`;
                }
            }
        } else if (inList && lines[i].trim() === '') {
            let closeTags = '';
            while (levels.length > 0) {
                closeTags += `</${levels.pop()}></li>`;
            }
            lines[i-1] = lines[i-1].replace(/<\/li>$/, closeTags);
            inList = false;
        }
    }
    
    if (inList && levels.length > 0) {
        let closeTags = '';
        while (levels.length > 0) {
            closeTags += `</${levels.pop()}>`;
        }
        lines[lines.length-1] += closeTags;
    }
    
    text = lines.join('\n');
    
    // Handle links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Paragraphs
    text = text.replace(/\n\s*\n/g, '</p><p>');
    
    if (!text.startsWith('<ul') && !text.startsWith('<ol')) {
        text = '<p>' + text + '</p>';
    }
    
    text = text.replace(/<p><(ul|ol)>/g, '<$1>');
    text = text.replace(/<\/(ul|ol)><\/p>/g, '</$1>');
    
    // Now restore code blocks with proper HTML and syntax highlighting
    for (let i = 0; i < codeBlocks.length; i++) {
        const { language, code } = codeBlocks[i];
        const languageClass = language ? `language-${language}` : '';
        const languageLabel = language ? `<div class="code-language">${language}</div>` : '';
        
        // Apply syntax highlighting to code
        const highlightedCode = highlightCodeSyntax(code, language);
        
        const codeHTML = `
        <div class="code-block-container">
            <div class="code-block-header">
                ${languageLabel}
                <div class="code-block-actions">
                    <button class="code-copy-btn" title="Kopírovat kód">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                    <button class="code-collapse-btn" title="Sbalit/rozbalit kód">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
            <pre class="${languageClass}"><code>${highlightedCode}</code></pre>
        </div>`;
        
        text = text.replace(`__CODE_BLOCK_${i}__`, codeHTML);
    }
    
    // Restore inline code
    for (let i = 0; i < inlineCodes.length; i++) {
        text = text.replace(`__INLINE_CODE_${i}__`, `<code class="inline-code">${escapeHtml(inlineCodes[i])}</code>`);
    }
    
    return text;
}