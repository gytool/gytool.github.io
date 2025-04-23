import { API_URLS, MODELS, DEFAULT_SETTINGS } from './config.js';

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
                            
                            // Check if there's thinking content in antml format
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

            toggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="15" viewBox="0 0 22 15" fill="none">
              <path d="M11 4.5C10.2044 4.5 9.44129 4.81607 8.87868 5.37868C8.31607 5.94129 8 6.70435 8 7.5C8 8.29565 8.31607 9.05871 8.87868 9.62132C9.44129 10.1839 10.2044 10.5 11 10.5C11.7956 10.5 12.5587 10.1839 13.1213 9.62132C13.6839 9.05871 14 8.29565 14 7.5C14 6.70435 13.6839 5.94129 13.1213 5.37868C12.5587 4.81607 11.7956 4.5 11 4.5ZM11 12.5C9.67392 12.5 8.40215 11.9732 7.46447 11.0355C6.52678 10.0979 6 8.82608 6 7.5C6 6.17392 6.52678 4.90215 7.46447 3.96447C8.40215 3.02678 9.67392 2.5 11 2.5C12.3261 2.5 13.5979 3.02678 14.5355 3.96447C15.4732 4.90215 16 6.17392 16 7.5C16 8.82608 15.4732 10.0979 14.5355 11.0355C13.5979 11.9732 12.3261 12.5 11 12.5ZM11 0C6 0 1.73 3.11 0 7.5C1.73 11.89 6 15 11 15C16 15 20.27 11.89 22 7.5C20.27 3.11 16 0 11 0Z" fill="black"/>
            </svg>`;

            toggleIcon.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="21" viewBox="0 0 24 21" fill="none">
                      <path d="M13.3946 3.77853C12.9367 3.72756 12.4716 3.69834 12 3.69107C9.93951 3.70048 7.80355 4.2164 5.78174 5.20499C4.28058 5.96924 2.81828 7.04816 1.54834 8.37903C0.924641 9.05842 0.12862 10.0421 0 11.0917C0.0152 12.0009 0.963061 13.123 1.54834 13.8044C2.7392 15.083 4.16342 16.131 5.78174 16.9784C5.83676 17.0059 5.89193 17.033 5.94726 17.0598L4.44582 19.7589L6.48593 21L17.5143 1.23541L15.5505 0L13.3946 3.77853ZM18.0513 5.12657L16.5527 7.79999C17.2421 8.72194 17.6514 9.85886 17.6514 11.0917C17.6514 14.1645 15.1209 16.6557 11.9985 16.6557C11.8636 16.6557 11.7327 16.6407 11.6001 16.6316L10.6084 18.3988C11.0657 18.4492 11.5282 18.4859 12 18.4923C14.0625 18.4828 16.1972 17.9609 18.2168 16.9784C19.718 16.2141 21.1817 15.1352 22.4517 13.8044C23.0754 13.125 23.8714 12.1413 24 11.0917C23.9848 10.1825 23.0369 9.06033 22.4517 8.37901C21.2608 7.10041 19.8351 6.05237 18.2168 5.20495C18.1622 5.17769 18.1063 5.15317 18.0513 5.12657ZM11.9985 5.52768C12.1355 5.52768 12.2713 5.53332 12.4058 5.54275L11.2441 7.61304C9.61387 7.95327 8.39063 9.38109 8.39063 11.0902C8.39063 11.5195 8.46745 11.9305 8.60889 12.3115C8.60905 12.312 8.60873 12.3126 8.60889 12.3131L7.44433 14.3894C6.75331 13.4666 6.34569 12.3259 6.34569 11.0917C6.34571 8.01888 8.87617 5.52766 11.9985 5.52768ZM15.3779 9.89293L12.7603 14.5613C14.3818 14.2147 15.5962 12.7933 15.5962 11.0902C15.5962 10.6687 15.5145 10.2679 15.3779 9.89293Z" fill="black"/>
                    </svg>`;
                } else {
                    input.type = 'password';
                    toggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="15" viewBox="0 0 22 15" fill="none">
                      <path d="M11 4.5C10.2044 4.5 9.44129 4.81607 8.87868 5.37868C8.31607 5.94129 8 6.70435 8 7.5C8 8.29565 8.31607 9.05871 8.87868 9.62132C9.44129 10.1839 10.2044 10.5 11 10.5C11.7956 10.5 12.5587 10.1839 13.1213 9.62132C13.6839 9.05871 14 8.29565 14 7.5C14 6.70435 13.6839 5.94129 13.1213 5.37868C12.5587 4.81607 11.7956 4.5 11 4.5ZM11 12.5C9.67392 12.5 8.40215 11.9732 7.46447 11.0355C6.52678 10.0979 6 8.82608 6 7.5C6 6.17392 6.52678 4.90215 7.46447 3.96447C8.40215 3.02678 9.67392 2.5 11 2.5C12.3261 2.5 13.5979 3.02678 14.5355 3.96447C15.4732 4.90215 16 6.17392 16 7.5C16 8.82608 15.4732 10.0979 14.5355 11.0355C13.5979 11.9732 12.3261 12.5 11 12.5ZM11 0C6 0 1.73 3.11 0 7.5C1.73 11.89 6 15 11 15C16 15 20.27 11.89 22 7.5C20.27 3.11 16 0 11 0Z" fill="black"/>
                    </svg>`;
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