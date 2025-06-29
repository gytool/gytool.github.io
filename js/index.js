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
	setupCodeBlockHandlers
} from './utils/syntax.js';

import { clearHistory } from './core/history.js';

document.addEventListener('DOMContentLoaded', () => {
	const chatForm = document.getElementById('chat-form');
	const chatInput = document.getElementById('chat-input');
	const messageSpace = document.getElementById('message-space');
	const sendButton = document.querySelector('.panel-block[type="submit"]');
	const headerNew = document.querySelector('.header-new');
	const headerApi = document.querySelector('.header-api');
	const headerModel = document.querySelector('.header-model');
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
		 
		 
		 await handleCombinedSubmission(chatForm, chatInput, messageSpace, sendButton, sendIconHTML);
	});

	if (chatInput && sendButton) {
		 chatInput.addEventListener('input', () => {
			  const isEmpty = chatInput.value.trim() === '';
			  sendButton.disabled = isEmpty;
			  sendButton.innerHTML = isEmpty ? voiceIconHTML : sendIconHTML;
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

	if (headerNew && messageSpace) {
		 headerNew.addEventListener('click', () => {
			  
			  while (messageSpace.firstChild) {
					messageSpace.removeChild(messageSpace.firstChild);
			  }
			  
			  
			  clearHistory();
			  
			  
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
			  
			  
			  updateWelcomeScreen(messageSpace);

			  if (chatInput) {
					chatInput.value = '';
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
        captureButton.addEventListener('click', capturePhoto);
        
        const switchButton = document.createElement('button');
        switchButton.className = 'camera-switch';
        switchButton.innerHTML = '🔄';
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