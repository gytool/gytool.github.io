import { API_URLS, MODELS, DEFAULT_SETTINGS, SYSTEM_PROMPT } from './config.js';
import { showTutorialModal } from '../ui/modals.js';

let OPENROUTER_API_KEY = localStorage.getItem('openrouter_api_key') || '';
let OPENROUTER_MODEL = localStorage.getItem('openrouter_model') || DEFAULT_SETTINGS.MODEL;

// Helper function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Helper function to check if current model supports vision
function getCurrentModelSupportsVision() {
    let modelToCheck = OPENROUTER_MODEL;
    if (modelToCheck.startsWith('custom:')) {
        // For custom models, assume they support vision if they contain certain keywords
        const modelName = modelToCheck.substring(7).toLowerCase();
        return modelName.includes('vision') || modelName.includes('gpt-4') || modelName.includes('gemini') || modelName.includes('claude');
    }
    
    const model = MODELS.find(m => m.value === modelToCheck);
    return model ? model.supportsVision : false;
}

async function sendMessageToOpenRouter(message, signal, onChunk, history = [], attachedFiles = []) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("Není nastaven API klíč. Nastavte jej v sekci API.");
    }

    let modelToUse = OPENROUTER_MODEL;
    if (modelToUse.startsWith('custom:')) {
        modelToUse = modelToUse.substring(7);
    }

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    messages.push(...history);
    
    // Create the user message
    const userMessage = { role: 'user', content: [] };
    
    // Add text content
    if (message && message.trim()) {
        userMessage.content.push({
            type: 'text',
            text: message
        });
    }
    
    // Add image content if model supports vision and we have image files
    const supportsVision = getCurrentModelSupportsVision();
    if (supportsVision && attachedFiles && attachedFiles.length > 0) {
        for (const file of attachedFiles) {
            if (file.type.startsWith('image/')) {
                try {
                    const base64Data = await fileToBase64(file);
                    userMessage.content.push({
                        type: 'image_url',
                        image_url: {
                            url: base64Data
                        }
                    });
                } catch (error) {
                    console.error('Error converting image to base64:', error);
                }
            } else {
                // For non-image files, add as text description
                userMessage.content.push({
                    type: 'text',
                    text: `[Připojený soubor: ${file.name}, velikost: ${formatFileSize(file.size)}]`
                });
            }
        }
    } else if (attachedFiles && attachedFiles.length > 0) {
        // If model doesn't support vision, add file info as text
        const fileInfo = attachedFiles.map(file => 
            `[Připojený soubor: ${file.name}, velikost: ${formatFileSize(file.size)}]`
        ).join('\n');
        
        if (message && message.trim()) {
            userMessage.content[0].text += '\n\n' + fileInfo;
        } else {
            userMessage.content.push({
                type: 'text',
                text: fileInfo
            });
        }
    }
    
    // If content is just text, simplify the structure
    if (userMessage.content.length === 1 && userMessage.content[0].type === 'text') {
        userMessage.content = userMessage.content[0].text;
    }
    
    messages.push(userMessage);

    const requestBody = {
        model: modelToUse,
        messages: messages,
        stream: true
    };

    try {
        const response = await fetch(API_URLS.OPENROUTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'HejChat'
            },
            body: JSON.stringify(requestBody),
            signal
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        if (!response.body) {
            throw new Error("ReadableStream not supported in this browser.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let thinking = '';
        let hasThinking = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            
            for (const line of lines) {
                if (line.trim() === "") continue;
                if (line.trim() === "data: [DONE]") continue;

                try {
                    const trimmedLine = line.replace(/^data: /, "");
                    const parsedLine = JSON.parse(trimmedLine);
                    
                    if (parsedLine.choices && parsedLine.choices.length > 0) {
                        const content = parsedLine.choices[0].delta?.content || '';
                        
                        if (content) {
                            fullText += content;
                            
                            if (parsedLine.choices[0].delta?.thinking) {
                                hasThinking = true;
                                thinking += parsedLine.choices[0].delta.thinking;
                            }
                            
                            onChunk(content, fullText, hasThinking, thinking);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing SSE line:", e, line);
                }
            }
        }

        return fullText;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request was aborted');
            throw error;
        }
        console.error("API request error:", error);
        throw error;
    }
}

// Helper function for file size formatting
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function createApiKeyModal(headerApi, onSave) {
    headerApi.addEventListener('click', () => {
        let overlay = document.getElementById('api-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'api-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);

            const apiBlock = document.createElement('div');
            apiBlock.id = 'api-block';
            apiBlock.className = 'modal-block';

            const headerApiRect = headerApi.getBoundingClientRect();
            apiBlock.style.top = (headerApiRect.bottom + 10 + window.scrollY) + "px";

            const form = document.createElement('form');
            form.id = 'api-form';
            form.className = 'modal-form';

            const inputContainer = document.createElement('div');
            inputContainer.className = 'settings-select-container';

            const label = document.createElement('label');
            label.textContent = 'API klíč:';
            label.htmlFor = 'api-input';
            label.className = 'settings-label';

            const apiInputContainer = document.createElement('div');
            apiInputContainer.className = 'api-input-container';

            const input = document.createElement('input');
            input.type = 'password';
            input.placeholder = 'Zadejte OpenRouter API klíč';
            input.className = 'api-input';
            input.id = 'api-input';
            input.value = OPENROUTER_API_KEY;

            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'api-toggle-icon';

            toggleIcon.innerHTML = `
					<img loading="eager" src="./assets/vectors/eye.svg" alt="Show" width="22" height="15">
				`;

            toggleIcon.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggleIcon.innerHTML = `
							  <img loading="eager" src="./assets/vectors/closed-eye.svg" alt="Hide" width="24" height="21">
						  `;
                } else {
                    input.type = 'password';
                    toggleIcon.innerHTML = `
							  <img loading="eager" src="./assets/vectors/eye.svg" alt="Show" width="22" height="15">
						  `;
                }
            });

            apiInputContainer.appendChild(input);
            apiInputContainer.appendChild(toggleIcon);
            
            inputContainer.appendChild(label);
            inputContainer.appendChild(apiInputContainer);
            
            form.appendChild(inputContainer);

            const saveButton = document.createElement('button');
            saveButton.type = 'submit';
            saveButton.textContent = 'Uložit';
            saveButton.className = 'api-button api-save-button';

            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.textContent = 'Zavřít';
            closeButton.className = 'api-button api-close-button';
            closeButton.addEventListener('click', () => {
                overlay.parentNode.removeChild(overlay);
            });

            form.appendChild(saveButton);
            form.appendChild(closeButton);

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                OPENROUTER_API_KEY = input.value.trim();
                localStorage.setItem('openrouter_api_key', OPENROUTER_API_KEY);
                if (onSave) {
                    onSave(OPENROUTER_API_KEY);
                }
                overlay.parentNode.removeChild(overlay);
            });
            apiBlock.appendChild(form);

            const infoText = document.createElement('p');
            infoText.textContent = "Sledujte náš užitečný API návod.";
            infoText.className = 'api-info-text';
            
            infoText.addEventListener('click', () => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                showTutorialModal();
            });
            
            apiBlock.appendChild(infoText);

            overlay.appendChild(apiBlock);

            setTimeout(() => {
                const apiInput = document.getElementById('api-input');
                if (apiInput) {
                    apiInput.focus();
                }
            }, 100);

            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    overlay.parentNode.removeChild(overlay);
                }
            });
        } else {
            overlay.parentNode.removeChild(overlay);
        }
    });
}

function createModelSettingsModal(headerSettings, onSave) {
    headerSettings.addEventListener('click', () => {
        let overlay = document.getElementById('settings-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'settings-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);

            const settingsBlock = document.createElement('div');
            settingsBlock.id = 'settings-block';
            settingsBlock.className = 'modal-block'; 

            const headerSettingsRect = headerSettings.getBoundingClientRect();
            settingsBlock.style.top = (headerSettingsRect.bottom + 10 + window.scrollY) + "px";

            const form = document.createElement('form');
            form.id = 'settings-form';
            form.className = 'modal-form';
            
            form.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const select = document.getElementById('model-select');
                    if (document.activeElement !== select || !select.size) {
                        e.preventDefault();
                        saveModelSettings();
                        overlay.parentNode.removeChild(overlay);
                    }
                }
            });

            // Create toggle buttons for selection method
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'select-toggle-container';
            
            const presetToggle = document.createElement('button');
            presetToggle.type = 'button';
            presetToggle.textContent = 'Z nabídky';
            presetToggle.className = 'toggle-button';
            presetToggle.id = 'preset-toggle';
            
            const customToggle = document.createElement('button');
            customToggle.type = 'button';
            customToggle.textContent = 'Vlastní model';
            customToggle.className = 'toggle-button';
            customToggle.id = 'custom-toggle';
            
            // Check if we're using a custom model
            const isCustomModel = OPENROUTER_MODEL.startsWith('custom:');
            
            // Set initial active state
            if (!isCustomModel) {
                presetToggle.classList.add('active');
            } else {
                customToggle.classList.add('active');
            }
            
            toggleContainer.appendChild(presetToggle);
            toggleContainer.appendChild(customToggle);
            form.appendChild(toggleContainer);

            // Create container for dropdown selection
            const selectContainer = document.createElement('div');
            selectContainer.className = 'settings-select-container';
            selectContainer.id = 'preset-container';
            
            // Create container for custom model input
            const customContainer = document.createElement('div');
            customContainer.className = 'settings-select-container';
            customContainer.id = 'custom-container';
            
            // Set initial visibility
            if (isCustomModel) {
                selectContainer.style.display = 'none';
                customContainer.style.display = 'block';
            } else {
                selectContainer.style.display = 'block';
                customContainer.style.display = 'none';
            }

            // Dropdown components
            const selectLabel = document.createElement('label');
            selectLabel.textContent = 'Model:';
            selectLabel.htmlFor = 'model-select';
            selectLabel.className = 'settings-label';

            const select = document.createElement('select');
            select.id = 'model-select';
            select.className = 'settings-select';
            
            select.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !select.size) {
                    e.preventDefault();
                    e.stopPropagation();
                    saveModelSettings();
                    
                    setTimeout(() => {
                        if (overlay.parentNode) {
                            overlay.parentNode.removeChild(overlay);
                        }
                    }, 100);
                }
            });

            MODELS.forEach(model => {
                const option = document.createElement('option');
                option.value = model.value;
                
                // Add vision indicator to label
                const visionIndicator = model.supportsVision ? ' 📷' : '';
                option.textContent = model.label + visionIndicator;
                
                if (model.value === OPENROUTER_MODEL) {
                    option.selected = true;
                }
                select.appendChild(option);
            });

            selectContainer.appendChild(selectLabel);
            selectContainer.appendChild(select);
            
            // Custom model input components
            const customLabel = document.createElement('label');
            customLabel.textContent = 'Vlastní model:';
            customLabel.htmlFor = 'custom-model-input';
            customLabel.className = 'settings-label';

            const customInputContainer = document.createElement('div');
            customInputContainer.className = 'api-input-container';

            const customInput = document.createElement('input');
            customInput.type = 'text';
            customInput.id = 'custom-model-input';
            customInput.className = 'api-input';
            customInput.placeholder = 'např. openai/gpt-4o';
            
            // Set value if it's a custom model
            if (isCustomModel) {
                customInput.value = OPENROUTER_MODEL.substring(7); // Remove 'custom:' prefix
            }
            
            customInputContainer.appendChild(customInput);
            customContainer.appendChild(customLabel);
            customContainer.appendChild(customInputContainer);
            
            form.appendChild(selectContainer);
            form.appendChild(customContainer);
            
            // Toggle button event listeners
            presetToggle.addEventListener('click', () => {
                presetToggle.classList.add('active');
                customToggle.classList.remove('active');
                selectContainer.style.display = 'block';
                customContainer.style.display = 'none';
            });
            
            customToggle.addEventListener('click', () => {
                customToggle.classList.add('active');
                presetToggle.classList.remove('active');
                customContainer.style.display = 'block';
                selectContainer.style.display = 'none';
            });

            const saveButton = document.createElement('button');
            saveButton.type = 'submit';
            saveButton.textContent = 'Uložit';
            saveButton.className = 'api-button api-save-button';

            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.textContent = 'Zavřít';
            closeButton.className = 'api-button api-close-button';
            closeButton.addEventListener('click', () => {
                overlay.parentNode.removeChild(overlay);
            });

            form.appendChild(saveButton);
            form.appendChild(closeButton);

            // Function to save model settings
            function saveModelSettings() {
                if (presetToggle.classList.contains('active')) {
                    // Save from dropdown
                    OPENROUTER_MODEL = select.value;
                } else {
                    // Save custom model with prefix
                    const customModelValue = customInput.value.trim();
                    if (customModelValue) {
                        OPENROUTER_MODEL = 'custom:' + customModelValue;
                    } else {
                        // Fallback to default if empty
                        OPENROUTER_MODEL = DEFAULT_SETTINGS.MODEL;
                    }
                }
                
                localStorage.setItem('openrouter_model', OPENROUTER_MODEL);
                if (onSave) {
                    onSave(OPENROUTER_MODEL);
                }
            }

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                saveModelSettings();
                overlay.parentNode.removeChild(overlay);
            });

            // Info text with vision capability note
            const infoText = document.createElement('p');
            infoText.innerHTML = "Vyberte model pro generování odpovědí.<br><small>📷 = podporuje obrázky</small>";
            infoText.className = 'api-info-text';
            
            infoText.addEventListener('click', () => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                showTutorialModal();
            });
            
            settingsBlock.appendChild(form);
            settingsBlock.appendChild(infoText);
            overlay.appendChild(settingsBlock);

            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    overlay.parentNode.removeChild(overlay);
                }
            });
        } else {
            overlay.parentNode.removeChild(overlay);
        }
    });
}

function getApiKey() {
    return OPENROUTER_API_KEY;
}

function setApiKey(key) {
    OPENROUTER_API_KEY = key;
    localStorage.setItem('openrouter_api_key', key);
}

function getModel() {
    return OPENROUTER_MODEL;
}

function setModel(model) {
    OPENROUTER_MODEL = model;
    localStorage.setItem('openrouter_model', model);
}

export {
    sendMessageToOpenRouter,
    createApiKeyModal,
    createModelSettingsModal,
    getApiKey,
    setApiKey,
    getModel,
    setModel,
    getCurrentModelSupportsVision
};