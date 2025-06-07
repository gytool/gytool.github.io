import { parseMarkdown } from '../utils/markdown.js';
import { sendMessageToOpenRouter } from '../core/api.js';
import { addToHistory, getHistory, clearHistory } from '../core/history.js';

export function createRequestMessageElement(messageText) {
    const requestDiv = document.createElement('div');
    requestDiv.classList.add('space-request');

    const requestBlock = document.createElement('div');
    requestBlock.classList.add('space-request-block');

    const requestTextSpan = document.createElement('span');
    requestTextSpan.classList.add('space-request-text');
    requestTextSpan.textContent = messageText;

    const template = document.getElementById('copyIconTemplate');
    if (template) {
        const requestIcons = document.createElement('div');
        requestIcons.classList.add('space-request-icons');

        const copyIconClone = template.content.cloneNode(true);
        requestIcons.appendChild(copyIconClone);

        const copyIcon = requestIcons.querySelector('.space-copy');
        copyIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            const originalHTML = copyIcon.innerHTML;
            
            navigator.clipboard.writeText(messageText)
                .then(() => {
                    console.log('Request text copied to clipboard.');
                    
                    
                    copyIcon.src = "./assets/vectors/checkmark.svg";
                    copyIcon.alt = "Success";
						  copyIcon.classList.add('space-copy');
                    
                    setTimeout(() => {
							  copyIcon.src = "./assets/vectors/copy.svg";
							  copyIcon.alt = "Copy";
                    }, 1000);
                })
                .catch(err => {
                    console.error('Failed to copy text:', err);
                });
        });

        requestDiv.appendChild(requestIcons);
    }

    requestBlock.appendChild(requestTextSpan);
    requestDiv.appendChild(requestBlock);

    requestBlock.addEventListener('click', () => {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = requestTextSpan.textContent;
            chatInput.focus();
        }
    });

    return requestDiv;
}

export function createResponseMessageElement(messageText, originalQuery, showIcons = false, thinking = null) {
    const responseDiv = document.createElement('div');
    responseDiv.classList.add('space-response');

    if (originalQuery) {
        responseDiv.dataset.originalQuery = originalQuery;
    }

    const responseBlock = document.createElement('div');
    responseBlock.classList.add('space-response-block');

    const responseTextSpan = document.createElement('span');
    responseTextSpan.classList.add('space-response-text');
    
    if (messageText && messageText.trim() !== '') {
        responseTextSpan.innerHTML = parseMarkdown(messageText);
    } else {
        responseTextSpan.innerHTML = '<p>Odpověď byla přerušena. Neváhej se zeptat znovu.</p>';
        responseDiv.classList.add('empty-response');
    }

    responseBlock.appendChild(responseTextSpan);
    
    if (thinking) {
        const thinkingToggle = document.createElement('div');
        thinkingToggle.classList.add('thinking-toggle');
        thinkingToggle.textContent = "Thinking...";
        
        const thinkingContent = document.createElement('div');
        thinkingContent.classList.add('thinking-content');
        thinkingContent.style.display = 'none';
        thinkingContent.textContent = thinking;
        
        thinkingToggle.addEventListener('click', () => {
            if (thinkingContent.style.display === 'none') {
                thinkingContent.style.display = 'block';
                thinkingToggle.textContent = "Hide thinking";
                thinkingToggle.classList.add('active');
            } else {
                thinkingContent.style.display = 'none';
                thinkingToggle.textContent = "Thinking...";
                thinkingToggle.classList.remove('active');
            }
        });
        
        responseBlock.appendChild(thinkingToggle);
        responseBlock.appendChild(thinkingContent);
    }
    
    responseDiv.appendChild(responseBlock);

    if (showIcons) {
        const template = document.getElementById('responseIconsTemplate');
        if (template) {
            const iconsClone = template.content.cloneNode(true);
            responseDiv.appendChild(iconsClone);
            const responseIcons = responseDiv.querySelector('.space-response-icons');
            if (responseIcons) {
                const copyIcon = responseIcons.querySelector('.space-copy');
                if (copyIcon) {
                    copyIcon.addEventListener('click', () => {
                        const textToCopy = responseDiv.querySelector('.space-response-text').textContent;
                        const originalHTML = copyIcon.innerHTML;
                        
                        navigator.clipboard.writeText(textToCopy)
                            .then(() => {
                                console.log('Response text copied to clipboard.');
                                
                                
                                copyIcon.src = "./assets/vectors/checkmark.svg";
										  copyIcon.alt = "Success";
										  copyIcon.classList.add('space-copy');
										
										  setTimeout(() => {
											  copyIcon.src = "./assets/vectors/copy.svg";
											  copyIcon.alt = "Copy";
										}, 1000);
                            })
                            .catch(err => {
                                console.error('Failed to copy text:', err);
                            });
                    });
                }

                const rerunIcon = responseIcons.querySelector('.space-rerun');
                if (rerunIcon) {
                    rerunIcon.addEventListener('click', async () => {
                        const originalQuery = responseDiv.dataset.originalQuery;
                        if (originalQuery) {
                            
                            const parentContainer = responseDiv.parentNode;
                            if (!parentContainer) return;
                            
                            
                            let currentElement = parentContainer.nextElementSibling;
                            while (currentElement) {
                                const nextElement = currentElement.nextElementSibling;
                                currentElement.remove();
                                currentElement = nextElement;
                            }
                            
                            
                            
                            const allContainers = Array.from(document.querySelectorAll('.message-container'));
                            const currentIndex = allContainers.indexOf(parentContainer);
                            
                            
                            
                            const historyPairsToKeep = Math.floor((currentIndex + 1) / 2);
                            const historyItemsToKeep = historyPairsToKeep * 2; 
                            
                            
                            const currentHistory = getHistory();
                            if (currentHistory.length > historyItemsToKeep) {
                                
                                const trimmedHistory = currentHistory.slice(0, historyItemsToKeep);
                                
                                
                                clearHistory();
                                trimmedHistory.forEach(item => {
                                    addToHistory(item.role, item.content);
                                });
                            }
                            
                            
                            const tempResponseElement = createResponseMessageElement(" ", originalQuery, false);
                            const tempResponseTextSpan = tempResponseElement.querySelector('.space-response-text');
                            
                            
                            tempResponseTextSpan.innerHTML = '';
                            
                            const typingIndicator = document.createElement('span');
                            typingIndicator.className = 'typing-indicator';
                            typingIndicator.textContent = "•••";
                            tempResponseTextSpan.appendChild(typingIndicator);
                            
                            parentContainer.replaceChild(tempResponseElement, responseDiv);
                            
                            
                            const sendButton = document.querySelector('.panel-block[type="submit"]');
                            const originalSendHTML = sendButton ? sendButton.innerHTML : '';
                            
                            if (sendButton) {
                                
                                sendButton.innerHTML = `
                                    <img loading="eager" src="./assets/vectors/stop.svg" alt="Stop" width="15" height="15">
                                `;
                                sendButton.disabled = false;
                            }
                            
                            const abortController = new AbortController();
                            let isAborted = false;
                            
                            
                            function stopHandler(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Stop button clicked during rerun');
                                isAborted = true;
                                abortController.abort();
                                
                                if (typingIndicator && typingIndicator.parentNode) {
                                    typingIndicator.parentNode.removeChild(typingIndicator);
                                }
                                
                                
                                const newResponseElement = createResponseMessageElement(
                                    rawMarkdownContent || '',
                                    originalQuery, 
                                    true,
                                    hasThinkingContent && currentThinking.length > 0 ? currentThinking : null
                                );
                                
                                parentContainer.replaceChild(newResponseElement, tempResponseElement);
                                
                                
                                if (rawMarkdownContent) {
                                    addToHistory('assistant', rawMarkdownContent);
                                }
                                
                                
                                if (sendButton) {
                                    sendButton.innerHTML = originalSendHTML;
                                    const chatInput = document.getElementById('chat-input');
                                    sendButton.disabled = chatInput && chatInput.value.trim() === '';
                                    sendButton.removeEventListener('click', stopHandler);
                                }
                            }
                            
                            
                            if (sendButton) {
                                sendButton.addEventListener('click', stopHandler);
                            }
                            
                            try {
                                let rawMarkdownContent = '';
                                let currentThinking = '';
                                let hasThinkingContent = false;
                                
                                const result = await sendMessageToOpenRouter(
                                    originalQuery, 
                                    abortController.signal,
                                    (chunk, fullText, hasThinking, thinkingText) => {
                                        if (typingIndicator && typingIndicator.parentNode) {
                                            typingIndicator.parentNode.removeChild(typingIndicator);
                                        }
                                        
                                        rawMarkdownContent = fullText;
                                        tempResponseTextSpan.innerHTML = parseMarkdown(fullText);
                                        
                                        if (hasThinking && thinkingText) {
                                            currentThinking = thinkingText;
                                            hasThinkingContent = true;
                                        }
                                        
                                        const messageSpace = document.getElementById('message-space');
                                        if (messageSpace) {
                                            messageSpace.scrollTop = messageSpace.scrollHeight;
                                        }
                                    }
                                );
                                
                                const newResponseElement = createResponseMessageElement(
                                    rawMarkdownContent,
                                    originalQuery, 
                                    true,
                                    hasThinkingContent && currentThinking.length > 0 ? currentThinking : null
                                );
                                
                                parentContainer.replaceChild(newResponseElement, tempResponseElement);
                                
                            } catch (error) {
                                
                                if (typingIndicator && typingIndicator.parentNode) {
                                    typingIndicator.parentNode.removeChild(typingIndicator);
                                }
                                
                                console.error("Error re-running query:", error);
                                tempResponseTextSpan.textContent = "Odpověď byla přerušena. Neváhej se zeptat znovu.";
                                
                                const errorResponseElement = createResponseMessageElement(
                                    "Odpověď byla přerušena. Neváhej se zeptat znovu.", 
                                    originalQuery, 
                                    true
                                );
                                
                                parentContainer.replaceChild(errorResponseElement, tempResponseElement);
                            } finally {
                                
                                if (sendButton) {
                                    sendButton.innerHTML = originalSendHTML;
                                    const chatInput = document.getElementById('chat-input');
                                    sendButton.disabled = chatInput && chatInput.value.trim() === '';
                                    sendButton.removeEventListener('click', stopHandler);
                                }
                            }
                        }
                    });
                }
            }
        }
    }

    return responseDiv;
}

export async function handleChatSubmission(chatForm, chatInput, messageSpace, sendButton, originalSendHTML) {
    if (!chatInput) return;

    const userMessage = chatInput.value.trim();
    if (userMessage === '') return;
    if (!messageSpace) return;

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    
    const newRequestElement = createRequestMessageElement(userMessage);
    messageContainer.appendChild(newRequestElement);
    
    chatInput.value = '';

    const welcomeScreen = messageSpace.querySelector('.space-welcome');
    if (welcomeScreen) {
        welcomeScreen.remove();
    }

    const responseElement = createResponseMessageElement("", userMessage, false);
    const responseTextSpan = responseElement.querySelector('.space-response-text');
    responseTextSpan.textContent = "";

    const typingIndicator = document.createElement('span');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.textContent = "•••";
    responseTextSpan.appendChild(typingIndicator);
    
    messageContainer.appendChild(responseElement);
    
    messageSpace.appendChild(messageContainer);
    messageSpace.scrollTop = messageSpace.scrollHeight;

    
    addToHistory('user', userMessage);

    const abortController = new AbortController();

    sendButton.innerHTML = `
        <img loading="eager" src="./assets/vectors/stop.svg" alt="Stop" width="15" height="15">
    `;
    sendButton.disabled = false;

    let isAborted = false;

    function stopHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Stop button clicked');
        isAborted = true;
        abortController.abort();
        
        if (typingIndicator && typingIndicator.parentNode) {
            typingIndicator.parentNode.removeChild(typingIndicator);
        }
        
        if (messageContainer.contains(responseElement)) {
            const newResponseElement = createResponseMessageElement(
                rawMarkdownContent || responseTextSpan.innerHTML, 
                userMessage, 
                true,
                hasThinkingContent && currentThinking.length > 0 ? currentThinking : null
            );
            messageContainer.removeChild(responseElement);
            messageContainer.appendChild(newResponseElement);
            
            
            if (rawMarkdownContent) {
                addToHistory('assistant', rawMarkdownContent);
            }
        }
        
        sendButton.innerHTML = originalSendHTML;
        sendButton.disabled = chatInput.value.trim() === '';
        sendButton.removeEventListener('click', stopHandler);
    }

    sendButton.addEventListener('click', stopHandler);

    try {
        let rawMarkdownContent = '';
        let currentThinking = '';
        let hasThinkingContent = false;
        
        
        const conversationHistory = getHistory();
        
        await sendMessageToOpenRouter(
            userMessage, 
            abortController.signal, 
            (chunk, fullText, hasThinking, thinkingText) => {
                if (typingIndicator && typingIndicator.parentNode) {
                    typingIndicator.parentNode.removeChild(typingIndicator);
                }
                
                rawMarkdownContent = fullText;
                
                const parsedFullText = parseMarkdown(fullText);
                
                responseTextSpan.innerHTML = parsedFullText;
                
                if (hasThinking && thinkingText) {
                    currentThinking = thinkingText;
                    hasThinkingContent = true;
                }
                
                messageSpace.scrollTop = messageSpace.scrollHeight;
            },
            conversationHistory 
        );
        
        console.log("Creating final response with length:", rawMarkdownContent.length);
        const newResponseElement = createResponseMessageElement(
            rawMarkdownContent,
            userMessage, 
            true,
            hasThinkingContent && currentThinking.length > 0 ? currentThinking : null
        );
        
        messageContainer.removeChild(responseElement);
        messageContainer.appendChild(newResponseElement);
        
        
        addToHistory('assistant', rawMarkdownContent);
        
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error("Error during chat request:", error);
            let errorMessage = "Omlouvám se, ale došlo k chybě při zpracování vaší žádosti.";
            
            if (error.message.includes("API klíč")) {
                errorMessage = error.message;
            } else if (error.message.includes("status 401")) {
                errorMessage = "Neplatný API klíč. Zkontrolujte své nastavení API.";
            } else if (error.message.includes("status 400")) {
                errorMessage = "Neplatný požadavek na model. Zkuste jiný model v nastavení.";
            } else if (error.message.includes("status 429")) {
                errorMessage = "Překročili jste limit požadavků na API. Zkuste to později.";
            } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
                errorMessage = "Problém s připojením k API. Zkontrolujte své internetové připojení.";
            }
            
            responseTextSpan.textContent = errorMessage;
        }
    } finally {
        if (typingIndicator && typingIndicator.parentNode) {
            typingIndicator.parentNode.removeChild(typingIndicator);
        }

        if (messageContainer.contains(responseElement)) {
            const finalResponseText = responseTextSpan.textContent;
            const newResponseElement = createResponseMessageElement(finalResponseText, userMessage, true);
            messageContainer.removeChild(responseElement);
            messageContainer.appendChild(newResponseElement);
        }
        
        sendButton.innerHTML = originalSendHTML;
        sendButton.disabled = chatInput.value.trim() === '';
        sendButton.removeEventListener('click', stopHandler);
    }
}