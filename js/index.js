import {
	sendMessageToOpenRouter,
	createApiKeyModal,
	createModelSettingsModal,
	getApiKey,
	setApiKey,
	getModel,
	setModel
} from './core/api.js';

import {
	createRequestMessageElement,
	createResponseMessageElement,
	handleChatSubmission
} from './ui/chat.js';

import {
	createWelcomeScreen,
	updateWelcomeScreen
} from './ui/welcome.js';

import {
	showTutorialModal
} from './ui/modals.js';

import {
	createChatHistoryModal,
	startNewChat,
	saveCurrentChatIfNeeded
} from './ui/chat-history.js';

import {
	setupCodeBlockHandlers
} from './utils/syntax.js';

import { clearHistory } from './core/history.js';
import { SpeechRecognitionManager } from './utils/speech.js';

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messageSpace = document.getElementById('message-space');
    const sendButton = document.querySelector('.panel-block[type="submit"]');
    const headerNew = document.querySelector('.header-new');
    const headerApi = document.querySelector('.header-api');
    const headerModel = document.querySelector('.header-model');
    const headerHistory = document.querySelector('.header-history'); // Burger icon
    const plusButton = document.querySelector('.panel-more').closest('.panel-block');
    
    
    window.pendingUploads = [];

    if (!chatForm) {
         return;
    }

    createApiKeyModal(headerApi);
    createModelSettingsModal(headerModel);
    updateWelcomeScreen(messageSpace);
    setupCodeBlockHandlers();
    
    
    setupPlusMenu(plusButton);
    
    const voiceIconHTML = `<img loading="eager" src="./assets/vectors/voice.svg" alt="Voice" class='panel-send'>`;
    const sendIconHTML = `<img loading="eager" src="./assets/vectors/send.svg" alt="Send" class='panel-send'>`;
    
    chatForm.addEventListener('submit', async (event) => {
         event.preventDefault();
         
         // Save current chat before sending new message
         saveCurrentChatIfNeeded();
         
         await handleCombinedSubmission(chatForm, chatInput, messageSpace, sendButton, sendIconHTML);
    });

    if (chatInput && sendButton) {
         chatInput.addEventListener('input', () => {
              const isEmpty = chatInput.value.trim() === '';
              sendButton.disabled = isEmpty;
              sendButton.innerHTML = isEmpty ? voiceIconHTML : sendIconHTML;
         });
         
         // Handle voice button click when input is empty
         sendButton.addEventListener('click', (e) => {
              if (chatInput.value.trim() === '' && sendButton.innerHTML.includes('voice.svg')) {
                    e.preventDefault();
                    e.stopPropagation();
                    openSpeechModal();
              }
         });
         
         
         const isEmpty = chatInput.value.trim() === '';
         sendButton.disabled = isEmpty;
         sendButton.innerHTML = isEmpty ? voiceIconHTML : sendIconHTML;
    }

    if (chatInput) {
         chatInput.addEventListener('keydown', function (e) {
              if (e.key === 'Enter' && e.shiftKey) {
                    e.preventDefault();
                    const cursorPos = this.selectionStart;
                    this.value =
                         this.value.substring(0, cursorPos) +
                         '\n' +
                         this.value.substring(cursorPos);
                    this.selectionStart = this.selectionEnd = cursorPos + 1;
                    return false;
              }
         });
    }

    // Chat history functionality (burger icon)
    if (headerHistory) {
        headerHistory.addEventListener('click', () => {
            createChatHistoryModal();
        });
    }

    if (headerNew && messageSpace) {
         headerNew.addEventListener('click', () => {
              startNewChat();

              if (chatInput) {
                    chatInput.focus();
              }

              if (sendButton) {
                    sendButton.disabled = true;
                    sendButton.innerHTML = `<img loading="eager" src="./assets/vectors/voice.svg" alt="Voice" class='panel-send'>`;
              }
         });
    }
});


async function handleCombinedSubmission(chatForm, chatInput, messageSpace, sendButton, sendIconHTML) {
    const userMessage = chatInput.value.trim();
    const hasFiles = window.pendingUploads && window.pendingUploads.length > 0;
    
    if (!userMessage && !hasFiles) return;
    
    let filesToSend = [];
    
    if (hasFiles) {
        // Store files to send to API
        filesToSend = [...window.pendingUploads];
        
        // Clear uploads immediately - files will be shown in the message container
        window.pendingUploads = [];
        
        const uploadedContainer = document.querySelector('.uploaded-container');
        if (uploadedContainer) {
            uploadedContainer.classList.remove('active');
            setTimeout(() => {
                if (uploadedContainer.parentNode) {
                    uploadedContainer.parentNode.removeChild(uploadedContainer);
                }
            }, 200);
        }
    }
    
    // Send message with files - files will be handled in handleChatSubmission
    if (userMessage || hasFiles) {
        await handleChatSubmission(chatForm, chatInput, messageSpace, sendButton, sendIconHTML, filesToSend);
    }
}


function setupPlusMenu(plusButton) {
	
	const plusMenuContainer = document.createElement('div');
	plusMenuContainer.id = 'plus-menu-container';
	document.body.appendChild(plusMenuContainer);
	
	let isMenuOpen = false;
	
	const template = document.getElementById('plusMenuTemplate');
	if (template && plusButton) {
		plusButton.addEventListener('click', (e) => {
			e.stopPropagation();
			
			 
			const existingMenu = plusMenuContainer.querySelector('.plus-menu');
			if (existingMenu && isMenuOpen) {
				
				existingMenu.classList.remove('active');
				isMenuOpen = false;
				
				
				document.removeEventListener('click', closeMenu);
				return;
			}
			
			
			while (plusMenuContainer.firstChild) {
				plusMenuContainer.removeChild(plusMenuContainer.firstChild);
			}
			
			
			const menuClone = template.content.cloneNode(true);
			plusMenuContainer.appendChild(menuClone);
			
			
			const plusRect = plusButton.getBoundingClientRect();
			const menu = plusMenuContainer.querySelector('.plus-menu');
			menu.style.left = `${plusRect.left}px`;
			menu.style.bottom = `${window.innerHeight - plusRect.top + 10}px`;
			
			
			setTimeout(() => {
				menu.classList.add('active');
				isMenuOpen = true;
			}, 10);
			
			
			const menuItems = plusMenuContainer.querySelectorAll('.plus-menu-item');
			menuItems.forEach(item => {
				item.addEventListener('click', () => {
					const itemText = item.querySelector('span').textContent;
					console.log(`Selected: ${itemText}`);
					
					if (itemText === 'Fotografie' || itemText === 'Soubory') {
						const fileInput = document.createElement('input');
						fileInput.type = 'file';
						fileInput.multiple = true; 
						fileInput.accept = itemText === 'Fotografie' ? 'image/*' : '*/*';
						
						fileInput.addEventListener('change', (event) => {
							if (event.target.files && event.target.files.length > 0) {
								
								const files = Array.from(event.target.files);
								displayUploadedFiles(files, itemText === 'Fotografie');
							}
						});
						
						fileInput.click();
					} else if (itemText === 'Kamera') {
						// Implement camera functionality
						openCamera();
					}
					
					
					menu.classList.remove('active');
					isMenuOpen = false;
				});
			});
			
			
			document.addEventListener('click', closeMenu);
		});
	}
	
	function closeMenu() {
		const menu = plusMenuContainer.querySelector('.plus-menu');
		if (menu) {
			menu.classList.remove('active');
			isMenuOpen = false;
			
			
			setTimeout(() => {
				document.removeEventListener('click', closeMenu);
			}, 200);
		}
	}
	
	
	function displayUploadedFiles(files, isImageUpload) {
		
		let uploadedContainer = document.querySelector('.uploaded-container');
		let isNewContainer = false;
		
		if (!uploadedContainer) {
			uploadedContainer = document.createElement('div');
			uploadedContainer.className = 'uploaded-container';
			document.body.appendChild(uploadedContainer);
			isNewContainer = true;
			
			
			const filesContainer = document.createElement('div');
			filesContainer.className = 'files-container';
			uploadedContainer.appendChild(filesContainer);
			
			
			const actionBar = document.createElement('div');
			actionBar.className = 'upload-actions';
			uploadedContainer.appendChild(actionBar);
			
			
			const plusRect = plusButton.getBoundingClientRect();
			uploadedContainer.style.left = `${plusRect.left}px`;
			uploadedContainer.style.bottom = `${window.innerHeight - plusRect.top + 10}px`;
		}
		
		const filesContainer = uploadedContainer.querySelector('.files-container');
		const actionBar = uploadedContainer.querySelector('.upload-actions');
		
		
		files.forEach(file => {
			
			if (isImageUpload && file.type.startsWith('image/')) {
				const objectURL = URL.createObjectURL(file);
				file.previewUrl = objectURL; 
			}
			
			window.pendingUploads.push(file);
			
			
			const filePreview = document.createElement('div');
			filePreview.className = 'file-preview';
			
			if (isImageUpload && file.type.startsWith('image/')) {
				
				const img = document.createElement('img');
				img.className = 'uploaded-image';
				img.alt = file.name;
				
				const objectURL = URL.createObjectURL(file);
				img.src = objectURL;
				img.dataset.src = objectURL; 
				
				img.onload = () => {
					URL.revokeObjectURL(objectURL);
				};
				
				filePreview.appendChild(img);
			} else {
				
				const fileInfo = document.createElement('div');
				fileInfo.className = 'file-attachment';
				
				const fileIcon = document.createElement('img');
				fileIcon.src = './assets/vectors/file.svg';
				fileIcon.alt = 'File';
				fileIcon.className = 'file-attachment-icon';
				
				const fileName = document.createElement('span');
				fileName.textContent = file.name;
				fileName.className = 'file-attachment-name';
				
				const fileSize = document.createElement('span');
				fileSize.textContent = formatFileSize(file.size);
				fileSize.className = 'file-attachment-size';
				
				fileInfo.appendChild(fileIcon);
				fileInfo.appendChild(fileName);
				fileInfo.appendChild(fileSize);
				filePreview.appendChild(fileInfo);
			}
			
			
			filesContainer.appendChild(filePreview);
		});
		
		
		updateActionBar(actionBar);
		
		
		if (isNewContainer) {
			setTimeout(() => {
				uploadedContainer.classList.add('active');
			}, 10);
		}
		
		function updateActionBar(actionBar) {
			
			actionBar.innerHTML = '';
			
			
			const closeButton = document.createElement('button');
			closeButton.className = 'upload-close-button';
			closeButton.innerHTML = '✕';
			closeButton.addEventListener('click', closeUploadPreview);
			actionBar.appendChild(closeButton);
		}
		
		function closeUploadPreview() {
			uploadedContainer.classList.remove('active');
			setTimeout(() => {
				if (document.body.contains(uploadedContainer)) {
					document.body.removeChild(uploadedContainer);
				}
				
			}, 200);
		}
	}
	
	// Add camera functionality
    function openCamera() {
        // Check if camera is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Kamera není podporována ve vašem prohlížeči.');
            return;
        }
        
        // Create camera modal
        const cameraOverlay = document.createElement('div');
        cameraOverlay.className = 'camera-overlay';
        
        const cameraModal = document.createElement('div');
        cameraModal.className = 'camera-modal';
        
        // Camera header
        const cameraHeader = document.createElement('div');
        cameraHeader.className = 'camera-header';
        
        const cameraTitle = document.createElement('h3');
        cameraTitle.textContent = 'Kamera';
        cameraTitle.className = 'camera-title';
        
        const cameraClose = document.createElement('button');
        cameraClose.className = 'camera-close';
        cameraClose.innerHTML = '✕';
        cameraClose.addEventListener('click', closeCameraModal);
        
        cameraHeader.appendChild(cameraTitle);
        cameraHeader.appendChild(cameraClose);
        
        // Camera content
        const cameraContent = document.createElement('div');
        cameraContent.className = 'camera-content';
        
        const video = document.createElement('video');
        video.className = 'camera-video';
        video.autoplay = true;
        video.muted = true;
        video.playsinline = true; // Important for iOS
        
        const canvas = document.createElement('canvas');
        canvas.className = 'camera-canvas';
        canvas.style.display = 'none';
        
        // Camera controls
        const cameraControls = document.createElement('div');
        cameraControls.className = 'camera-controls';
        
        const captureButton = document.createElement('button');
        captureButton.className = 'camera-capture';
		  captureButton.innerHTML = `
		  	<svg xmlns="http://www.w3.org/2000/svg" width="40" height="36" viewBox="0 0 40 36" fill="none">
				<path d="M20 29C22.5 29 24.6253 28.1253 26.376 26.376C28.1267 24.6267 29.0013 22.5013 29 20C28.9987 17.4987 28.124 15.374 26.376 13.626C24.628 11.878 22.5027 11.0027 20 11C17.4973 10.9973 15.3727 11.8727 13.626 13.626C11.8793 15.3793 11.004 17.504 11 20C10.996 22.496 11.8713 24.6213 13.626 26.376C15.3807 28.1307 17.5053 29.0053 20 29ZM20 25C18.6 25 17.4167 24.5167 16.45 23.55C15.4833 22.5833 15 21.4 15 20C15 18.6 15.4833 17.4167 16.45 16.45C17.4167 15.4833 18.6 15 20 15C21.4 15 22.5833 15.4833 23.55 16.45C24.5167 17.4167 25 18.6 25 20C25 21.4 24.5167 22.5833 23.55 23.55C22.5833 24.5167 21.4 25 20 25ZM4 36C2.9 36 1.95867 35.6087 1.176 34.826C0.393333 34.0433 0.00133333 33.1013 0 32V8C0 6.9 0.392 5.95867 1.176 5.176C1.96 4.39333 2.90133 4.00133 4 4H10.3L12.8 1.3C13.1667 0.9 13.6087 0.583333 14.126 0.35C14.6433 0.116667 15.1847 0 15.75 0H24.25C24.8167 0 25.3587 0.116667 25.876 0.35C26.3933 0.583333 26.8347 0.9 27.2 1.3L29.7 4H36C37.1 4 38.042 4.392 38.826 5.176C39.61 5.96 40.0013 6.90133 40 8V32C40 33.1 39.6087 34.042 38.826 34.826C38.0433 35.61 37.1013 36.0013 36 36H4ZM4 32H36V8H27.9L24.25 4H15.75L12.1 8H4V32Z" fill="white"/>
			</svg>
		  `;
        captureButton.addEventListener('click', capturePhoto);
        
        const switchButton = document.createElement('button');
        switchButton.className = 'camera-switch';
        switchButton.innerHTML = `
		  	<svg xmlns="http://www.w3.org/2000/svg" width="45" height="42" viewBox="0 0 45 42" fill="none">
				<path d="M8.35312 15.9961C9.075 13.9523 10.2469 12.0305 11.8969 10.3898C17.7562 4.53047 27.2531 4.53047 33.1125 10.3898L34.7156 12.0023H31.5C29.8406 12.0023 28.5 13.343 28.5 15.0023C28.5 16.6617 29.8406 18.0023 31.5 18.0023H41.9906C43.65 18.0023 44.9906 16.6617 44.9906 15.0023V4.50234C44.9906 2.84297 43.65 1.50234 41.9906 1.50234C40.3312 1.50234 38.9906 2.84297 38.9906 4.50234V7.80234L37.35 6.15234C29.1469 -2.05078 15.8531 -2.05078 7.65 6.15234C5.3625 8.43984 3.7125 11.1305 2.7 14.0086C2.14687 15.5742 2.97188 17.2805 4.52813 17.8336C6.08438 18.3867 7.8 17.5617 8.35312 16.0055V15.9961ZM2.15625 24.1242C1.6875 24.2648 1.2375 24.518 0.871875 24.893C0.496875 25.268 0.24375 25.718 0.1125 26.2055C0.0843751 26.318 0.05625 26.4398 0.0375 26.5617C0.00937496 26.7211 0 26.8805 0 27.0398V37.5023C0 39.1617 1.34062 40.5023 3 40.5023C4.65938 40.5023 6 39.1617 6 37.5023V34.2117L7.65 35.8523C15.8531 44.0461 29.1469 44.0461 37.3406 35.8523C39.6281 33.5648 41.2875 30.8742 42.3 27.9961C42.8531 26.4305 42.0281 24.7242 40.4719 24.1711C38.9156 23.618 37.2 24.443 36.6469 25.9992C35.925 28.043 34.7531 29.9648 33.1031 31.6055C27.2438 37.4648 17.7469 37.4648 11.8875 31.6055L11.8781 31.5961L10.275 30.0023H13.5C15.1594 30.0023 16.5 28.6617 16.5 27.0023C16.5 25.343 15.1594 24.0023 13.5 24.0023H3.0375C2.8875 24.0023 2.7375 24.0117 2.5875 24.0305C2.3625 24.0586 2.29688 24.0773 2.15625 24.1242Z" fill="url(#paint0_linear_853_3)"/>
				<defs>
					<linearGradient id="paint0_linear_853_3" x1="52.6951" y1="-12.6181" x2="4.91581" y2="7.37638" gradientUnits="userSpaceOnUse">
						<stop stop-color="#013B6C"/>
						<stop offset="1" stop-color="#2B7DB4"/>
					</linearGradient>
				</defs>
			</svg>
		`;
        switchButton.addEventListener('click', switchCamera);
        
        cameraControls.appendChild(switchButton);
        cameraControls.appendChild(captureButton);
        
        cameraContent.appendChild(video);
        cameraContent.appendChild(canvas);
        cameraContent.appendChild(cameraControls);
        
        cameraModal.appendChild(cameraHeader);
        cameraModal.appendChild(cameraContent);
        cameraOverlay.appendChild(cameraModal);
        document.body.appendChild(cameraOverlay);
        
        // Camera state
        let currentStream = null;
        let currentFacingMode = 'user'; // 'user' for front camera, 'environment' for back camera
        
        // Start camera
        async function startCamera(facingMode = 'user') {
            try {
                // Stop existing stream
                if (currentStream) {
                    currentStream.getTracks().forEach(track => track.stop());
                }
                
                // Camera constraints - optimized for cross-platform compatibility
                const constraints = {
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1280, max: 1920 },
                        height: { ideal: 720, max: 1080 }
                    },
                    audio: false
                };
                
                // For older devices, fallback to basic constraints
                let stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch (err) {
                    console.warn('Failed with advanced constraints, trying basic:', err);
                    // Fallback for older devices
                    const basicConstraints = {
                        video: true,
                        audio: false
                    };
                    stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
                }
                
                currentStream = stream;
                video.srcObject = stream;
                
                // Show camera modal with animation
                setTimeout(() => {
                    cameraOverlay.classList.add('active');
                }, 10);
                
            } catch (err) {
                console.error('Error accessing camera:', err);
                let errorMessage = 'Nepodařilo se získat přístup ke kameře.';
                
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    errorMessage = 'Přístup ke kameře byl odmítnut. Povolte přístup v nastavení prohlížeče.';
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    errorMessage = 'Kamera nebyla nalezena.';
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    errorMessage = 'Kamera je již používána jinou aplikací.';
                }
                
                alert(errorMessage);
                closeCameraModal();
            }
        }
        
        // Switch between front and back camera
        async function switchCamera() {
            currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            await startCamera(currentFacingMode);
        }
        
        // Capture photo
        function capturePhoto() {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create file from blob
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const file = new File([blob], `camera-${timestamp}.jpg`, { 
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    // Add preview URL for immediate display
                    file.previewUrl = URL.createObjectURL(blob);
                    
                    // Display the captured photo
                    displayUploadedFiles([file], true);
                    
                    // Close camera modal
                    closeCameraModal();
                }
            }, 'image/jpeg', 0.9); // 90% quality
        }
        
        // Close camera modal
        function closeCameraModal() {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
            
            cameraOverlay.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(cameraOverlay)) {
                    document.body.removeChild(cameraOverlay);
                }
            }, 300);
        }
        
        // Handle escape key
        function handleKeyPress(e) {
            if (e.key === 'Escape') {
                closeCameraModal();
            }
        }
        
        document.addEventListener('keydown', handleKeyPress);
        
        // Remove event listener when modal is closed
        cameraOverlay.addEventListener('transitionend', () => {
            if (!cameraOverlay.classList.contains('active')) {
                document.removeEventListener('keydown', handleKeyPress);
            }
        });
        
        // Start the camera
        startCamera(currentFacingMode);
    }
}


function formatFileSize(bytes) {
	if (bytes < 1024) return bytes + ' B';
	else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
	else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Speech recognition modal functions
function openSpeechModal() {
    if (!speechManager.isSupported()) {
        alert('Rozpoznávání řeči není v tomto prohlížeči podporováno.');
        return;
    }
    
    // Create modal from template
    const template = document.getElementById('speechModalTemplate');
    if (!template) return;
    
    const modalClone = template.content.cloneNode(true);
    const overlay = modalClone.querySelector('.speech-overlay');
    const modal = modalClone.querySelector('.speech-modal');
    const circle = modalClone.querySelector('.speech-circle');
    const closeBtn = modalClone.querySelector('.speech-close');
    const stopBtn = modalClone.querySelector('.speech-stop');
    const interimText = modalClone.querySelector('#speech-interim');
    const finalText = modalClone.querySelector('#speech-final');
    
    document.body.appendChild(overlay);
    
    // Show modal with animation
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
    
    let finalTranscript = '';
    
    // Setup speech recognition callbacks
    speechManager.onResult = (final, interim) => {
        if (final) {
            finalTranscript += final;
            finalText.textContent = finalTranscript;
            interimText.textContent = interim || 'Pokračujte v mluvení...';
        } else {
            interimText.textContent = interim || 'Poslouchám...';
        }
        
        // Add listening animation
        circle.classList.add('listening');
    };
    
    speechManager.onError = (error) => {
        circle.classList.remove('listening');
        circle.classList.add('error');
        
        let errorMessage = 'Došlo k chybě při rozpoznávání řeči.';
        
        switch (error) {
            case 'not-allowed':
                errorMessage = 'Přístup k mikrofonu byl odmítnut.';
                break;
            case 'no-speech':
                errorMessage = 'Nebyl detekován žádný hlas.';
                break;
            case 'audio-capture':
                errorMessage = 'Nepodařilo se získat přístup k mikrofonu.';
                break;
            case 'network':
                errorMessage = 'Chyba síťového připojení.';
                break;
        }
        
        interimText.textContent = errorMessage;
        
        setTimeout(() => {
            closeSpeechModal();
        }, 2000);
    };
    
    speechManager.onEnd = () => {
        circle.classList.remove('listening');
        
        if (finalTranscript.trim()) {
            // Insert recognized text into chat input
            chatInput.value = finalTranscript.trim();
            chatInput.dispatchEvent(new Event('input')); // Trigger input event to update send button
            chatInput.focus();
        }
        
        closeSpeechModal();
    };
    
    // Close modal function
    function closeSpeechModal() {
        speechManager.stop();
        overlay.classList.remove('active');
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
    
    // Event listeners
    closeBtn.addEventListener('click', closeSpeechModal);
    stopBtn.addEventListener('click', () => {
        speechManager.stop();
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeSpeechModal();
        }
    });
    
    // Start speech recognition
    try {
        speechManager.start();
        interimText.textContent = 'Začněte mluvit...';
    } catch (error) {
        console.error('Failed to start speech recognition:', error);
        interimText.textContent = 'Nepodařilo se spustit rozpoznávání řeči.';
        circle.classList.add('error');
        
        setTimeout(() => {
            closeSpeechModal();
        }, 2000);
    }
}