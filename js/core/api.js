import { API_URLS, MODELS, DEFAULT_SETTINGS } from './config.js';
import { showTutorialModal } from '../ui/modals.js';

let OPENROUTER_API_KEY = localStorage.getItem('openrouter_api_key') || '';
let OPENROUTER_MODEL = localStorage.getItem('openrouter_model') || DEFAULT_SETTINGS.MODEL;

async function sendMessageToOpenRouter(message, signal, onChunk) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("Není nastaven API klíč. Nastavte jej v sekci API.");
    }

    const requestBody = {
        model: OPENROUTER_MODEL,
        messages: [
            { role: 'user', content: message }
        ],
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
					<img src="./assets/vectors/eye.svg" alt="Show" width="22" height="15">
				`;

            toggleIcon.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggleIcon.innerHTML = `
							  <img src="./assets/vectors/closed-eye.svg" alt="Hide" width="24" height="21">
						  `;
                } else {
                    input.type = 'password';
                    toggleIcon.innerHTML = `
							  <img src="./assets/vectors/eye.svg" alt="Show" width="22" height="15">
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
                        OPENROUTER_MODEL = select.value;
                        localStorage.setItem('openrouter_model', OPENROUTER_MODEL);
                        overlay.parentNode.removeChild(overlay);
                    }
                }
            });

            const selectContainer = document.createElement('div');
            selectContainer.className = 'settings-select-container';

            const label = document.createElement('label');
            label.textContent = 'Model:';
            label.htmlFor = 'model-select';
            label.className = 'settings-label';

            const select = document.createElement('select');
            select.id = 'model-select';
            select.className = 'settings-select';
            
            select.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !select.size) {
                    e.preventDefault();
                    e.stopPropagation();
                    OPENROUTER_MODEL = select.value;
                    localStorage.setItem('openrouter_model', OPENROUTER_MODEL);
                    
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
					option.textContent = model.label;
					if (model.value === OPENROUTER_MODEL) {
						 option.selected = true;
					}
					select.appendChild(option);
			  });

            selectContainer.appendChild(label);
            selectContainer.appendChild(select);
            form.appendChild(selectContainer);

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
                OPENROUTER_MODEL = select.value;
                localStorage.setItem('openrouter_model', OPENROUTER_MODEL);
                if (onSave) {
                    onSave(OPENROUTER_MODEL);
                }
                overlay.parentNode.removeChild(overlay);
            });

            settingsBlock.appendChild(form);

            const infoText = document.createElement('p');
            infoText.textContent = "Vyberte model pro generování odpovědí.";
            infoText.className = 'api-info-text';
            
            infoText.addEventListener('click', () => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                showTutorialModal();
            });
            
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
    setModel
};