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
    
    const languagePatterns = patterns[languageAliases[language] || language];
    if (!languagePatterns) return escapeHtml(code);
    
    let escapedCode = escapeHtml(code);
    
    for (const { pattern, class: className, replace } of languagePatterns) {
        if (replace) {
            escapedCode = escapedCode.replace(pattern, replace);
        } else {
            escapedCode = escapedCode.replace(pattern, match => `<span class="${className}">${match}</span>`);
        }
    }
    
    return escapedCode;
}

export function setupCodeBlockHandlers() {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.code-copy-btn')) {
            const copyBtn = e.target.closest('.code-copy-btn');
            const codeBlock = copyBtn.closest('.code-block-container').querySelector('code');
            
            navigator.clipboard.writeText(codeBlock.textContent)
                .then(() => {
                    copyBtn.innerHTML = `
							<img loading="eager" src="./assets/vectors/white-checkmark.svg" alt="Checkmark"> 
						  `;
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = `
                           <img loading="eager" src="./assets/vectors/white-copy.svg" alt="Copy" width="16" height="16"> 
								`;
                    }, 2000);
                })
                .catch(err => console.error('Failed to copy text:', err));
        }
        
        if (e.target.closest('.code-collapse-btn')) {
            const collapseBtn = e.target.closest('.code-collapse-btn');
            const codeContainer = collapseBtn.closest('.code-block-container');
            const preElement = codeContainer.querySelector('pre');
            
            preElement.classList.toggle('collapsed');
            
            if (preElement.classList.contains('collapsed')) {
                collapseBtn.innerHTML = `
                  <img loading="eager" src="./assets/vectors/hide.svg" alt="Hide"> 
					`;
            } else {
                collapseBtn.innerHTML = `
                  <img loading="eager" src="./assets/vectors/show.svg" alt="Show"> `;
            }
        }
    });
}