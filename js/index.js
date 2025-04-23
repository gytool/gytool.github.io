import {
    sendMessageToOpenRouter,
    createApiKeyModal,
    createModelSettingsModal,
    getApiKey,
    setApiKey,
    getModel,
    setModel
} from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messageSpace = document.getElementById('message-space');
    const sendButton = document.querySelector('.panel-send');
    const headerNew = document.querySelector('.header-new');
    const headerApi = document.querySelector('.header-api');
    const headerSettings = document.querySelector('.header-settings');

    if (!chatForm) {
        return;
    }

    createApiKeyModal(headerApi);
    createModelSettingsModal(headerSettings);

    function createWelcomeScreen() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.classList.add('space-welcome');

        const logoSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        logoSvg.classList.add('space-welcome-logo');
        logoSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        logoSvg.setAttribute('width', '250');
        logoSvg.setAttribute('height', '206');
        logoSvg.setAttribute('viewBox', '0 0 250 206');
        logoSvg.setAttribute('fill', 'none');

        logoSvg.innerHTML = `
          <path d="M33.2518 150.829L31.605 148.025L28.3799 148.441C24.708 148.915 19.0736 148.429 14.3771 145.603C9.98219 142.959 5.8708 137.962 5.26891 128.131C4.40387 114.002 5.22354 106.66 6.94784 102.378C8.44703 98.6547 10.7552 96.8989 15.2924 94.6303L17.3798 93.5866L17.8921 91.3098C18.617 88.0879 21.7645 79.8931 27.8997 74.5495L29.8506 72.8504L29.5565 70.2801C28.4709 60.7929 27.626 46.0197 28.5987 32.6398C29.0858 25.939 30.0155 19.7888 31.5049 14.8963C32.8808 10.3768 34.5358 7.59641 36.1489 6.17258C36.9314 6.1 39.0672 6.09071 42.8388 7.42384C47.5135 9.07623 54.1542 12.6183 62.6245 19.6397L65.4164 21.954L68.4533 19.9721C85.7038 8.71381 133.033 -7.42714 181.708 20.1332L184.517 21.7234L187.094 19.7806C190.053 17.5495 195.097 14.1541 200.439 11.3424C205.577 8.63753 210.249 6.87738 213.46 6.62283C213.79 6.8331 214.419 7.33541 215.234 8.47879C216.516 10.278 218.002 13.3373 219.228 18.1922C221.681 27.9097 222.909 44.0931 220.049 69.7149L219.734 72.5369L222.02 74.2214C223.457 75.2804 225.861 77.4886 227.921 80.3794C229.994 83.29 231.437 86.4943 231.602 89.6201L231.771 92.8285L234.776 93.964C238.052 95.2015 244.618 99.9424 244.618 108.462C244.618 110.571 244.732 113.088 244.845 115.604C244.922 117.314 244.999 119.023 245.041 120.601C245.151 124.813 245.059 128.918 244.373 132.687C243.69 136.434 242.455 139.638 240.428 142.203C238.443 144.715 235.466 146.913 230.766 148.317L227.46 149.304L227.262 152.749C226.935 158.43 224.274 167.371 217.242 174.865C210.345 182.213 198.919 188.52 180.341 188.629L177.37 188.646L176.002 191.284C175.77 191.731 172.588 195.833 163.441 194.47L162.211 194.287L161.042 194.71C147.092 199.758 123.728 203.682 99.5495 198.839C75.5509 194.032 50.7423 180.607 33.2518 150.829Z" fill="#2B7DB4" stroke="#013B6C" stroke-width="9.83987"/>
          <path d="M67.7901 141.454C70.7999 143.538 69.0442 145.795 67.7901 146.664C66.6325 148.111 50.715 146.664 32.7717 148.689L33.9294 138.85C43.9622 138.85 64.7802 139.371 67.7901 141.454Z" fill="#013B6C"/>
          <path d="M182.321 141.454C179.311 143.538 181.067 145.795 182.321 146.664C183.479 148.111 199.396 146.664 217.34 148.689L216.182 138.85C206.149 138.85 185.331 139.371 182.321 141.454Z" fill="#013B6C"/>
          <path d="M86.0228 156.214C89.2062 174.446 115.928 169.43 125.382 163.449C128.662 165.571 137.248 169.758 145.351 169.526C155.481 169.237 164.742 162.291 164.742 156.214C164.742 151.302 161.848 151.294 160.401 151.294C158.954 151.294 156.233 151.12 155.77 156.214C155.307 161.307 148.631 162.388 145.351 162.291C137.016 163.68 131.46 157.082 129.723 153.609V149.847C138.521 146.837 141.107 140.489 141.3 137.692C141.493 134.412 138.579 127.794 125.382 127.562C112.185 127.331 109.272 134.219 109.465 137.692C109.928 143.48 116.989 148.207 120.462 149.847V153.609C117.452 161.481 109.175 162.677 105.413 162.291C99.6249 162.581 94.4156 160.844 94.4156 156.214C94.4156 152.509 92.1003 151.294 90.0745 151.294C86.891 151.294 85.7739 154.788 86.0228 156.214Z" fill="#013B6C"/>
          <path d="M225.228 147.821C225.691 168.196 206.127 180.042 196.287 183.418L218.861 147.821H225.228Z" fill="white"/>
          <path d="M71.5525 54.6324C59.2816 60.4205 50.6187 70.3569 47.821 74.6015C39.4861 49.3651 43.5764 36.3032 46.6634 32.9268C58.7028 35.7051 68.2725 48.5548 71.5525 54.6324Z" fill="#013B6C"/>
          <path d="M178.923 54.6324C191.194 60.4205 199.857 70.3569 202.654 74.6015C210.989 49.3651 206.899 36.3032 203.812 32.9268C191.773 35.7051 182.203 48.5548 178.923 54.6324Z" fill="#013B6C"/>
          <path d="M226.965 144.638V143.191L223.492 144.349L223.781 145.796L226.965 144.638Z" fill="#013B6C"/>
          <path d="M222.913 146.086C222.913 159.283 206.031 175.702 197.734 182.262L177.186 188.918L179.212 182.262C204.449 170.454 212.687 148.98 213.652 139.719C217.819 114.945 213.845 95.2464 211.336 88.4936C212.957 86.4098 214.134 78.3448 214.52 74.7754C217.993 75.933 221.948 80.39 223.492 82.4159C222.334 84.2681 222.334 87.4324 222.623 88.4936H226.964V143.192L222.913 146.086Z" fill="#013B6C"/>
          <path d="M221.177 88.7828H228.701L223.781 80.9688L221.177 88.7828Z" fill="white"/>
          <path d="M39.7176 88.2034C36.5341 91.3869 34.5083 126.019 34.2189 142.901L23.8002 144.638V97.4644C23.8233 96.3459 22.9556 96.3358 20.3273 97.4644L23.8002 88.2034H28.1413C28.1413 85.8881 27.3695 83.7658 26.9837 82.994C27.9098 79.9842 32.7718 76.3377 35.0871 74.8906C35.0871 78.3635 35.9553 84.4411 39.7176 88.2034Z" fill="#013B6C"/>
          <path d="M29.8776 89.3619H22.353L27.273 81.5479L29.8776 89.3619Z" fill="white"/>
          <path d="M158.664 42.4774C130.418 33.4479 101.554 38.4258 90.9428 42.1881L72.9995 22.2192C113.98 -1.39647 160.98 12.3791 176.318 22.219L158.664 42.4774Z" fill="white"/>
          <path d="M86.6015 52.0278C79.6557 42.3037 69.0518 31.7693 64.7107 27.7176L73.5782 21.3506L91.2321 41.3197C116.237 31.8272 146.413 37.3645 158.375 41.3197L176.318 21.9294L185.116 27.4282C178.402 33.2163 167.25 46.1432 162.716 52.0278C133.544 40.9146 99.8178 47.3973 86.6015 52.0278Z" fill="#013B6C"/>
          <path d="M155.77 179.657C148.13 181.509 149.114 190.269 150.561 194.417C166.768 203.447 176.993 197.6 180.08 193.548C181.045 191.716 182.164 186.776 178.923 181.683C175.681 176.589 162.137 178.21 155.77 179.657Z" fill="#013B6C"/>
          <circle cx="79.6559" cy="113.672" r="17.0751" fill="#013B6C"/>
          <circle cx="170.53" cy="113.672" r="17.0751" fill="#013B6C"/>
          <circle cx="174.871" cy="110.488" r="4.05171" fill="white"/>
          <circle cx="83.997" cy="110.488" r="4.05171" fill="white"/>
          <path d="M187.605 154.768C190.846 154.768 202.268 157.855 207.574 159.398C205.838 161.52 202.365 165.823 202.365 166.054C202.365 166.344 190.789 161.424 187.605 160.556C184.925 159.825 184.132 158.626 184.132 157.662C183.939 156.697 184.364 154.768 187.605 154.768Z" fill="#013B6C"/>
          <path d="M62.8703 154.479C59.6289 154.479 48.207 157.566 42.9012 159.109C44.6376 161.231 48.1105 165.534 48.1105 165.765C48.1105 166.055 59.6868 161.135 62.8703 160.267C65.5507 159.536 66.3432 158.337 66.3432 157.373C66.5361 156.408 66.1117 154.479 62.8703 154.479Z" fill="#013B6C"/>
        `;

        welcomeDiv.appendChild(logoSvg);

        const welcomeText = document.createElement('span');
        welcomeText.classList.add('space-welcome-text');
        welcomeText.textContent = 'S čím mohu pomoci?';
        welcomeDiv.appendChild(welcomeText);
        
        const tutorialBlock = document.createElement('div');
        tutorialBlock.classList.add('welcome-tutorial-block');

        const tutorialSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        tutorialSvg.setAttribute('width', '31');
        tutorialSvg.setAttribute('height', '25');
        tutorialSvg.setAttribute('viewBox', '0 0 62 50');
        tutorialSvg.setAttribute('fill', 'none');
        tutorialSvg.classList.add('welcome-tutorial-icon');

        tutorialSvg.innerHTML = `
          <path d="M30.5556 0L0 16.6667L11.1111 22.7222V39.3889L30.5556 50L50 39.3889V22.7222L55.5556 19.6944V38.8889H61.1111V16.6667L30.5556 0ZM49.5 16.6667L30.5556 27L11.6111 16.6667L30.5556 6.33333L49.5 16.6667ZM44.4444 36.1111L30.5556 43.6667L16.6667 36.1111V25.75L30.5556 33.3333L44.4444 25.75V36.1111Z" fill="url(#paint0_linear_415_3)"/>
          <defs>
            <linearGradient id="paint0_linear_415_3" x1="71.5762" y1="-15.0224" x2="9.46943" y2="14.6302" gradientUnits="userSpaceOnUse">
              <stop stop-color="#013B6C"/>
              <stop offset="1" stop-color="#2B7DB4"/>
            </linearGradient>
          </defs>
        `;

        const tutorialText = document.createElement('span');
        tutorialText.textContent = 'Sledujte náš užitečný API návod.';
        tutorialText.classList.add('welcome-tutorial-text');

        tutorialBlock.appendChild(tutorialSvg);
        tutorialBlock.appendChild(tutorialText);
        welcomeDiv.appendChild(tutorialBlock);

        tutorialBlock.onclick = () => {
            showTutorialModal();
        };

        return welcomeDiv;
    }

    function updateWelcomeScreen() {
        if (!messageSpace) return;

        const welcomeScreen = messageSpace.querySelector('.space-welcome');
        const hasMessages = messageSpace.querySelectorAll('.space-request, .space-response').length > 0;

        if (!hasMessages) {
            if (!welcomeScreen) {
                messageSpace.appendChild(createWelcomeScreen());
            }
        } else {
            if (welcomeScreen) {
                welcomeScreen.remove();
            }
        }
    }

    updateWelcomeScreen();

    function createRequestMessageElement(messageText) {
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
                navigator.clipboard.writeText(messageText)
                    .then(() => {
                        console.log('Request text copied to clipboard.');
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
            if (chatInput) {
                chatInput.value = requestTextSpan.textContent;
                chatInput.focus();
            }
        });

        return requestDiv;
    }

    function createResponseMessageElement(messageText, originalQuery, showIcons = false, thinking = null) {
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
                            navigator.clipboard.writeText(textToCopy)
                                .then(() => {
                                    console.log('Response text copied to clipboard.');
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

    const originalSendHTML = sendButton.innerHTML;

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
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

        updateWelcomeScreen();

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
            sendButton.disabled = false;
            sendButton.removeEventListener('click', stopHandler);
        }

        messageSpace.scrollTop = messageSpace.scrollHeight;
    });

    if (chatInput && sendButton) {
        chatInput.addEventListener('input', () => {
            sendButton.disabled = chatInput.value.trim() === '';
        });
        sendButton.disabled = chatInput.value.trim() === '';
    }

    if (chatInput) {
        chatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    e.preventDefault();

                    const cursorPos = this.selectionStart;

                    this.value =
                        this.value.substring(0, cursorPos) +
                        '\n' +
                        this.value.substring(cursorPos);

                    this.selectionStart = this.selectionEnd = cursorPos + 1;

                    return false;
                }
            }
        });
    }

    if (headerNew && messageSpace) {
        headerNew.addEventListener('click', () => {
            while (messageSpace.firstChild) {
                messageSpace.removeChild(messageSpace.firstChild);
            }
            updateWelcomeScreen();

            if (chatInput) {
                chatInput.focus();
            }
        });
    }

    // Add event delegation for code block buttons
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
});

function parseMarkdown(text) {
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
    
    // Now restore code blocks with proper HTML
    for (let i = 0; i < codeBlocks.length; i++) {
        const { language, code } = codeBlocks[i];
        const languageClass = language ? `language-${language}` : '';
        const languageLabel = language ? `<div class="code-language">${language}</div>` : '';
        
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
            <pre class="${languageClass}"><code>${escapeHtml(code)}</code></pre>
        </div>`;
        
        text = text.replace(`__CODE_BLOCK_${i}__`, codeHTML);
    }
    
    // Restore inline code
    for (let i = 0; i < inlineCodes.length; i++) {
        text = text.replace(`__INLINE_CODE_${i}__`, `<code class="inline-code">${escapeHtml(inlineCodes[i])}</code>`);
    }
    
    return text;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showTutorialModal() {
    let overlay = document.getElementById('tutorial-overlay');
    if (overlay) return;
    
    overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
    
    const tutorialModal = document.createElement('div');
    tutorialModal.id = 'tutorial-modal';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.className = 'tutorial-close-button';
    
    closeButton.addEventListener('click', () => {
        overlay.parentNode.removeChild(overlay);
    });
    
    tutorialModal.appendChild(closeButton);
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'tutorial-content-container';
    
    const pages = [
        {
            title: 'Krok 1: Registrace na OpenRouter',
            content: 'Nejprve přejděte na web OpenRouter a zaregistrujte se pro vytvoření účtu.',
            link: 'https://openrouter.ai/sign-up',
            linkText: 'openrouter.ai/sign-up',
            image: './img/openrouter_signup.png'
        },
        {
            title: 'Krok 2: Vytvoření API klíče',
            content: 'V nastavení vašeho OpenRouter účtu vytvořte nový API klíč.',
            link: 'https://openrouter.ai/settings/keys',
            linkText: 'openrouter.ai/settings/keys',
            image: './img/openrouter_key.png'
        },
        {
            title: 'Krok 3: Vložení API klíče do HejChat',
            content: 'Zkopírujte vytvořený API klíč a vložte jej do HejChat v sekci API.',
            image: './img/hejchat_api.png'
        }
    ];
    
    let currentPage = 0;
    
    function renderPage(pageIndex) {
        const page = pages[pageIndex];
        contentContainer.innerHTML = '';
        
        const pageContent = document.createElement('div');
        pageContent.className = 'tutorial-page';
        
        const titleEl = document.createElement('h2');
        const titleText = page.title.replace(/^(Krok \d+:)/, '$1<br>');
        titleEl.innerHTML = titleText;
        titleEl.className = 'tutorial-title';
        
        const contentEl = document.createElement('p');
        contentEl.textContent = page.content;
        contentEl.className = 'tutorial-description';

        const contentArea = document.createElement('div');
        contentArea.className = 'tutorial-content-area';
        
        contentArea.appendChild(titleEl);
        contentArea.appendChild(contentEl);
        
        if (page.image) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'tutorial-image-container';
            
            const imageEl = document.createElement('img');
            imageEl.src = page.image;
            imageEl.alt = `Ilustrace ke kroku ${pageIndex + 1}`;
            imageEl.className = 'tutorial-image';
            
            imageContainer.appendChild(imageEl);
            contentArea.appendChild(imageContainer);
        }
        
        pageContent.appendChild(contentArea);
        
        const footerContainer = document.createElement('div');
        footerContainer.className = 'tutorial-footer';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'tutorial-buttons-container';

        if (page.link) {
            const linkBtn = document.createElement('a');
            
            let linkText = '';
            if (pageIndex === 0) {
                linkText = 'Registrovat';
            } else if (pageIndex === 1) {
                linkText = 'Vytvořit klíč';
            }
            
            const linkTextSpan = document.createElement('span');
            linkTextSpan.textContent = linkText;
            
            const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgIcon.classList.add('tutorial-link-icon');
            svgIcon.setAttribute('width', '20');
            svgIcon.setAttribute('height', '20');
            svgIcon.setAttribute('viewBox', '0 0 20 20');
            svgIcon.setAttribute('fill', 'none');
            svgIcon.innerHTML = `
                <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" stroke-width="1.25" stroke-miterlimit="10"></path>
                <path d="M8.4375 7.97925H12.1875V11.7292" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M7.5 12.875L11.875 8.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
            `;
            
            linkBtn.href = page.link;
            linkBtn.target = '_blank';
            linkBtn.className = 'tutorial-external-link';

            linkBtn.appendChild(linkTextSpan);
            linkBtn.appendChild(svgIcon);
            
            buttonsContainer.appendChild(linkBtn);
        }

        const navButton = document.createElement('button');
        navButton.className = 'tutorial-nav-button';

        if (pageIndex < pages.length - 1) {
            navButton.innerHTML = '✓';
            navButton.title = 'Další';
            navButton.addEventListener('click', () => {
                currentPage++;
                renderPage(currentPage);
            });
        } else {
            navButton.innerHTML = '✓';
            navButton.title = 'Dokončit';
            navButton.addEventListener('click', () => {
                overlay.parentNode.removeChild(overlay);
            });
        }
        
        buttonsContainer.appendChild(navButton);
        
        footerContainer.appendChild(buttonsContainer);
        pageContent.appendChild(footerContainer);
        
        contentContainer.appendChild(pageContent);
    }
    
    renderPage(currentPage);
    
    tutorialModal.appendChild(contentContainer);
    overlay.appendChild(tutorialModal);
    
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            overlay.parentNode.removeChild(overlay);
        }
    });
}
