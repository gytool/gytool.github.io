import { parseMarkdown } from '../utils/markdown.js';
import { sendMessageToOpenRouter } from '../core/api.js';

/**
 * Creates a request message element
 */
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
                    
                    // Show success feedback with the gradient checkmark
                    copyIcon.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="space-copy" viewBox="0 0 40 30" fill="none">
									<path d="M38.7359 1.02394C39.4585 1.70707 39.8803 2.6492 39.9084 3.64319C39.9365 4.63718 39.5688 5.60165 38.8859 6.32455L17.6335 28.8272C17.2891 29.1912 16.8751 29.4825 16.4162 29.6839C15.9573 29.8853 15.4626 29.9926 14.9615 29.9996C14.4604 30.0066 13.963 29.9131 13.4986 29.7246C13.0342 29.5361 12.6123 29.2565 12.2579 28.9022L1.00658 17.6509C0.344099 16.9399 -0.0165588 15.9996 0.000584302 15.0279C0.0177274 14.0563 0.411333 13.1293 1.09848 12.4422C1.78562 11.755 2.71265 11.3614 3.68427 11.3443C4.65589 11.3271 5.59623 11.6878 6.30719 12.3502L14.8332 20.8712L33.4353 1.17396C34.1184 0.451362 35.0606 0.0296347 36.0546 0.00150289C37.0486 -0.0266289 38.013 0.341138 38.7359 1.02394Z" fill="url(#paint0_linear_538_471)"/>
									<defs>
										<linearGradient id="paint0_linear_538_471" x1="46.7443" y1="-9.01345" x2="7.52899" y2="11.3658" gradientUnits="userSpaceOnUse">
											<stop stop-color="#013B6C"/>
											<stop offset="1" stop-color="#2B7DB4"/>
										</linearGradient>
									</defs>
								</svg>`;
                    
                    // Revert back to original icon after 2 seconds
                    setTimeout(() => {
                        copyIcon.innerHTML = originalHTML;
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

/**
 * Creates a response message element
 */
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
        responseTextSpan.innerHTML = '<p>Promiň, teď tvůj požadavek nejde zpracovat. Zkus to prosím znovu.</p>';
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
                                
                                // Show success feedback with the gradient checkmark
                                copyIcon.innerHTML = `
                                    <svg xmlns="http://www.w3.org/2000/svg" class="space-copy" viewBox="0 0 40 30" fill="none">
													<path d="M38.7359 1.02394C39.4585 1.70707 39.8803 2.6492 39.9084 3.64319C39.9365 4.63718 39.5688 5.60165 38.8859 6.32455L17.6335 28.8272C17.2891 29.1912 16.8751 29.4825 16.4162 29.6839C15.9573 29.8853 15.4626 29.9926 14.9615 29.9996C14.4604 30.0066 13.963 29.9131 13.4986 29.7246C13.0342 29.5361 12.6123 29.2565 12.2579 28.9022L1.00658 17.6509C0.344099 16.9399 -0.0165588 15.9996 0.000584302 15.0279C0.0177274 14.0563 0.411333 13.1293 1.09848 12.4422C1.78562 11.755 2.71265 11.3614 3.68427 11.3443C4.65589 11.3271 5.59623 11.6878 6.30719 12.3502L14.8332 20.8712L33.4353 1.17396C34.1184 0.451362 35.0606 0.0296347 36.0546 0.00150289C37.0486 -0.0266289 38.013 0.341138 38.7359 1.02394Z" fill="url(#paint0_linear_538_471)"/>
													<defs>
														<linearGradient id="paint0_linear_538_471" x1="46.7443" y1="-9.01345" x2="7.52899" y2="11.3658" gradientUnits="userSpaceOnUse">
															<stop stop-color="#013B6C"/>
															<stop offset="1" stop-color="#2B7DB4"/>
														</linearGradient>
													</defs>
												</svg>`;

                                setTimeout(() => {
                                    copyIcon.innerHTML = originalHTML;
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
                            
                            // Create a temporary response element while we wait for the new response
                            const tempResponseElement = createResponseMessageElement("", originalQuery, false);
                            const tempResponseTextSpan = tempResponseElement.querySelector('.space-response-text');
                            
                            const typingIndicator = document.createElement('span');
                            typingIndicator.className = 'typing-indicator';
                            typingIndicator.textContent = "•••";
                            tempResponseTextSpan.appendChild(typingIndicator);
                            
                            parentContainer.replaceChild(tempResponseElement, responseDiv);
                            
                            try {
                                let rawMarkdownContent = '';
                                let currentThinking = '';
                                let hasThinkingContent = false;
                                
                                const abortController = new AbortController();
                                
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
                                // Remove typing indicator if it exists
                                if (typingIndicator && typingIndicator.parentNode) {
                                    typingIndicator.parentNode.removeChild(typingIndicator);
                                }
                                
                                console.error("Error re-running query:", error);
                                tempResponseTextSpan.textContent = "Promiň, teď tvůj požadavek nejde zpracovat. Zkus to prosím znovu.";
                                
                                const errorResponseElement = createResponseMessageElement(
                                    "Promiň, teď tvůj požadavek nejde zpracovat. Zkus to prosím znovu.", 
                                    originalQuery, 
                                    true
                                );
                                
                                parentContainer.replaceChild(errorResponseElement, tempResponseElement);
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

    const abortController = new AbortController();

    sendButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 35 35" fill="none">
            <path d="M0 5C0 2.23858 2.23858 0 5 0H30C32.7614 0 35 2.23858 35 5V30C35 32.7614 32.7614 35 30 35H5C2.23858 35 0 32.7614 0 30V5Z" fill="url(#paint0_linear_392_92)"/>
            <defs>
                <linearGradient id="paint0_linear_392_92" x1="40.9937" y1="-10.5157" x2="3.09782" y2="4.28783" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#013B6C"/>
                    <stop offset="1" stop-color="#2B7DB4"/>
                </linearGradient>
            </defs>
        </svg>`;
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
        
        await sendMessageToOpenRouter(userMessage, abortController.signal, 
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
            }
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