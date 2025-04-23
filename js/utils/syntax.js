import { escapeHtml } from './markdown.js';

export function highlightCodeSyntax(code, language) {
    if (!language) return code;
    
    language = language.toLowerCase();
    
    const patterns = {
        javascript: [
            { pattern: /(\/\/.*)/g, class: 'code-comment' },
            { pattern: /\/\*[\s\S]*?\*\//g, class: 'code-comment' },
            { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|new|this)\b/g, class: 'code-keyword' },
            { pattern: /(".*?"|'.*?'|`[\s\S]*?`)/g, class: 'code-string' },
            { pattern: /\b(true|false|null|undefined)\b/g, class: 'code-literal' },
            { pattern: /\b(\d+(\.\d+)?)\b/g, class: 'code-number' }
        ],
        typescript: [
            { pattern: /(\/\/.*)/g, class: 'code-comment' },
            { pattern: /\/\*[\s\S]*?\*\//g, class: 'code-comment' },
            { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|new|this|interface|type|enum)\b/g, class: 'code-keyword' },
            { pattern: /(".*?"|'.*?'|`[\s\S]*?`)/g, class: 'code-string' },
            { pattern: /\b(true|false|null|undefined)\b/g, class: 'code-literal' },
            { pattern: /\b(\d+(\.\d+)?)\b/g, class: 'code-number' }
        ],
        html: [
            { pattern: /(&lt;\/?[a-zA-Z][a-zA-Z0-9]*(?:\s+[a-zA-Z][a-zA-Z0-9]*="[^"]*")*\s*\/?&gt;)/g, class: 'code-tag' },
            { pattern: /([a-zA-Z][a-zA-Z0-9]*=)(".*?")/g, replace: '<span class="code-attr">$1</span><span class="code-string">$2</span>' },
            { pattern: /(&lt;!--[\s\S]*?--&gt;)/g, class: 'code-comment' }
        ],
        css: [
            { pattern: /(\/\*[\s\S]*?\*\/)/g, class: 'code-comment' },
            { pattern: /([a-zA-Z-]+\s*:)/g, class: 'code-property' },
            { pattern: /(#[a-zA-Z0-9]+|\.[\w-]+|\w+(?=\s*\{))/g, class: 'code-selector' },
            { pattern: /(@\w+)\b/g, class: 'code-keyword' },
            { pattern: /\b(inherit|initial|unset|none|block|flex)\b/g, class: 'code-value' }
        ],
        python: [
            { pattern: /(#.*)/g, class: 'code-comment' },
            { pattern: /\b(def|class|import|from|if|elif|else|for|while|try|except|finally|with|as|return|in|not|and|or|True|False|None|lambda)\b/g, class: 'code-keyword' },
            { pattern: /(".*?"|'.*?'|"""[\s\S]*?"""|'''[\s\S]*?''')/g, class: 'code-string' },
            { pattern: /\b(\d+(\.\d+)?)\b/g, class: 'code-number' }
        ],
        json: [
            { pattern: /(".*?")(\s*:)/g, replace: '<span class="code-key">$1</span>$2' },
            { pattern: /:\s*(".*?")/g, replace: ': <span class="code-string">$1</span>' },
            { pattern: /:\s*(\d+(\.\d+)?)/g, replace: ': <span class="code-number">$1</span>' },
            { pattern: /:\s*(true|false|null)/g, replace: ': <span class="code-literal">$1</span>' }
        ],
        php: [
            { pattern: /(\/\/.*|#.*)/g, class: 'code-comment' },
            { pattern: /\/\*[\s\S]*?\*\//g, class: 'code-comment' },
            { pattern: /\b(function|return|if|else|foreach|for|while|class|public|private|protected|echo|include|require|namespace|use|extends|implements|new|try|catch|throw)\b/g, class: 'code-keyword' },
            { pattern: /\$\w+/g, class: 'code-variable' },
            { pattern: /(".*?"|'.*?')/g, class: 'code-string' },
            { pattern: /\b(\d+(\.\d+)?)\b/g, class: 'code-number' }
        ],
        sql: [
            { pattern: /(--.*)/g, class: 'code-comment' },
            { pattern: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|AND|OR|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|HAVING|AS|ON|COUNT|SUM|AVG|MIN|MAX|UNION|ALL|DISTINCT|CREATE|TABLE|DROP|ALTER|INDEX|VIEW)\b/gi, class: 'code-keyword' },
            { pattern: /(".*?"|'.*?')/g, class: 'code-string' },
            { pattern: /\b(\d+(\.\d+)?)\b/g, class: 'code-number' }
        ]
    };
    
    // Add aliases for common languages
    const languageAliases = {
        'js': 'javascript',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'py': 'python',
        'scss': 'css',
        'sass': 'css',
        'less': 'css'
    };
    
    // Get the patterns for the specified language or its alias
    const languagePatterns = patterns[languageAliases[language] || language];
    if (!languagePatterns) return escapeHtml(code); // No highlighting for unknown languages
    
    // First escape HTML in the code
    let escapedCode = escapeHtml(code);
    
    // Apply patterns
    for (const { pattern, class: className, replace } of languagePatterns) {
        if (replace) {
            escapedCode = escapedCode.replace(pattern, replace);
        } else {
            escapedCode = escapedCode.replace(pattern, match => `<span class="${className}">${match}</span>`);
        }
    }
    
    return escapedCode;
}

/**
 * Setup code block event handlers
 */
export function setupCodeBlockHandlers() {
    document.body.addEventListener('click', (e) => {
        // Copy button click handler
        if (e.target.closest('.code-copy-btn')) {
            const copyBtn = e.target.closest('.code-copy-btn');
            const codeBlock = copyBtn.closest('.code-block-container').querySelector('code');
            
            // Copy the text
            navigator.clipboard.writeText(codeBlock.textContent)
                .then(() => {
                    // Show success feedback
                    copyBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>`;
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>`;
                    }, 2000);
                })
                .catch(err => console.error('Failed to copy text:', err));
        }
        
        // Collapse button click handler
        if (e.target.closest('.code-collapse-btn')) {
            const collapseBtn = e.target.closest('.code-collapse-btn');
            const codeContainer = collapseBtn.closest('.code-block-container');
            const preElement = codeContainer.querySelector('pre');
            
            // Toggle collapsed state
            preElement.classList.toggle('collapsed');
            
            // Update icon based on state
            if (preElement.classList.contains('collapsed')) {
                collapseBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>`;
            } else {
                collapseBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>`;
            }
        }
    });
}