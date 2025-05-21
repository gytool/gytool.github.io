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
	
	// Global variable to track pending uploads
	window.pendingUploads = [];

	if (!chatForm) {
		 return;
	}

	createApiKeyModal(headerApi);
	createModelSettingsModal(headerModel);
	updateWelcomeScreen(messageSpace);
	setupCodeBlockHandlers();
	
	// Initialize plus menu functionality
	setupPlusMenu(plusButton);
	
	const voiceIconHTML = `<img src="./assets/vectors/voice.svg" alt="Voice" class='panel-send'>`;
	const sendIconHTML = `<img src="./assets/vectors/send.svg" alt="Send" class='panel-send'>`;
	
	chatForm.addEventListener('submit', async (event) => {
		 event.preventDefault();
		 
		 // Handle both text and files
		 await handleCombinedSubmission(chatForm, chatInput, messageSpace, sendButton, sendIconHTML);
	});

	if (chatInput && sendButton) {
		 chatInput.addEventListener('input', () => {
			  const isEmpty = chatInput.value.trim() === '';
			  sendButton.disabled = isEmpty;
			  sendButton.innerHTML = isEmpty ? voiceIconHTML : sendIconHTML;
		 });
		 
		 // Set initial icon state on page load
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
			  
			  updateWelcomeScreen(messageSpace);

			  if (chatInput) {
					chatInput.value = '';
					chatInput.focus();
			  }

			  if (sendButton) {
					sendButton.disabled = true;
			  }
		 });
	}
});

// New function to handle combined submission of text and files
async function handleCombinedSubmission(chatForm, chatInput, messageSpace, sendButton, sendIconHTML) {
	const userMessage = chatInput.value.trim();
	const hasFiles = window.pendingUploads && window.pendingUploads.length > 0;
	
	// If there's no message and no files, do nothing
	if (!userMessage && !hasFiles) return;
	
	// Handle files first if we have them
	if (hasFiles) {
		// Add files to chat
		addFilesToChat(window.pendingUploads, messageSpace);
		
		// Clear the pending uploads
		window.pendingUploads = [];
		
		// Close the upload preview if it's open
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
	
	// Then handle text message if we have one
	if (userMessage) {
		await handleChatSubmission(chatForm, chatInput, messageSpace, sendButton, sendIconHTML);
	} else if (hasFiles) {
		// If we only had files and no text, reset the send button
		sendButton.innerHTML = userMessage ? sendIconHTML : voiceIconHTML;
		sendButton.disabled = !userMessage;
	}
}

// Helper function to add files to chat
function addFilesToChat(files, messageSpace) {
	if (!messageSpace || !files.length) return;
	
	files.forEach(file => {
		// Create container for file
		const uploadContainer = document.createElement('div');
		uploadContainer.className = 'space-request';
		
		const fileBlock = document.createElement('div');
		fileBlock.className = 'space-request-block';
		
		if (file.type.startsWith('image/')) {
			// Handle image
			const chatImg = document.createElement('img');
			chatImg.className = 'uploaded-image';
			chatImg.alt = file.name;
			
			// Use stored URL or create a new one
			let imgSrc = file.previewUrl || URL.createObjectURL(file);
			chatImg.src = imgSrc;
			fileBlock.appendChild(chatImg);
		} else {
			// Handle other file
			const chatFileInfo = document.createElement('div');
			chatFileInfo.className = 'file-attachment';
			
			const chatFileIcon = document.createElement('img');
			chatFileIcon.src = './assets/vectors/file.svg';
			chatFileIcon.alt = 'File';
			chatFileIcon.className = 'file-attachment-icon';
			
			const chatFileName = document.createElement('span');
			chatFileName.textContent = file.name;
			chatFileName.className = 'file-attachment-name';
			
			const chatFileSize = document.createElement('span');
			chatFileSize.textContent = formatFileSize(file.size);
			chatFileSize.className = 'file-attachment-size';
			
			chatFileInfo.appendChild(chatFileIcon);
			chatFileInfo.appendChild(chatFileName);
			chatFileInfo.appendChild(chatFileSize);
			fileBlock.appendChild(chatFileInfo);
		}
		
		uploadContainer.appendChild(fileBlock);
		messageSpace.appendChild(uploadContainer);
	});
	
	// Scroll to bottom
	messageSpace.scrollTop = messageSpace.scrollHeight;
}

// Update the setupPlusMenu function to track files globally
function setupPlusMenu(plusButton) {
	// Create container for plus menu
	const plusMenuContainer = document.createElement('div');
	plusMenuContainer.id = 'plus-menu-container';
	document.body.appendChild(plusMenuContainer);
	
	let isMenuOpen = false;
	
	const template = document.getElementById('plusMenuTemplate');
	if (template && plusButton) {
		plusButton.addEventListener('click', (e) => {
			e.stopPropagation();
			
			 // Check if menu is already open
			const existingMenu = plusMenuContainer.querySelector('.plus-menu');
			if (existingMenu && isMenuOpen) {
				// Close the menu if it's already open
				existingMenu.classList.remove('active');
				isMenuOpen = false;
				
				// Remove click event listener
				document.removeEventListener('click', closeMenu);
				return;
			}
			
			// Remove any existing menu
			while (plusMenuContainer.firstChild) {
				plusMenuContainer.removeChild(plusMenuContainer.firstChild);
			}
			
			// Create new menu
			const menuClone = template.content.cloneNode(true);
			plusMenuContainer.appendChild(menuClone);
			
			// Position menu
			const plusRect = plusButton.getBoundingClientRect();
			const menu = plusMenuContainer.querySelector('.plus-menu');
			menu.style.left = `${plusRect.left}px`;
			menu.style.bottom = `${window.innerHeight - plusRect.top + 10}px`;
			
			// Show menu with animation
			setTimeout(() => {
				menu.classList.add('active');
				isMenuOpen = true;
			}, 10);
			
			// Add click listeners to menu items
			const menuItems = plusMenuContainer.querySelectorAll('.plus-menu-item');
			menuItems.forEach(item => {
				item.addEventListener('click', () => {
					// Handle menu item click
					const itemText = item.querySelector('span').textContent;
					console.log(`Selected: ${itemText}`);
					
					if (itemText === 'Fotografie' || itemText === 'Soubory') {
						const fileInput = document.createElement('input');
						fileInput.type = 'file';
						fileInput.multiple = true; // Allow multiple files
						fileInput.accept = itemText === 'Fotografie' ? 'image/*' : '*/*';
						
						// Add event listener for when files are selected
						fileInput.addEventListener('change', (event) => {
							if (event.target.files && event.target.files.length > 0) {
								// Process all selected files
								const files = Array.from(event.target.files);
								displayUploadedFiles(files, itemText === 'Fotografie');
							}
						});
						
						fileInput.click();
					} else if (itemText === 'Kamera') {
						// Add camera functionality here
					}
					
					// Close menu
					menu.classList.remove('active');
					isMenuOpen = false;
				});
			});
			
			// Close menu when clicking outside
			document.addEventListener('click', closeMenu);
		});
	}
	
	function closeMenu() {
		const menu = plusMenuContainer.querySelector('.plus-menu');
		if (menu) {
			menu.classList.remove('active');
			isMenuOpen = false;
			
			// Remove event listener after animation completes
			setTimeout(() => {
				document.removeEventListener('click', closeMenu);
			}, 200);
		}
	}
	
	// Function to handle multiple files
	function displayUploadedFiles(files, isImageUpload) {
		// Create container for uploads if it doesn't exist
		let uploadedContainer = document.querySelector('.uploaded-container');
		let isNewContainer = false;
		
		if (!uploadedContainer) {
			uploadedContainer = document.createElement('div');
			uploadedContainer.className = 'uploaded-container';
			document.body.appendChild(uploadedContainer);
			isNewContainer = true;
			
			// Create files container
			const filesContainer = document.createElement('div');
			filesContainer.className = 'files-container';
			uploadedContainer.appendChild(filesContainer);
			
			// Create action bar
			const actionBar = document.createElement('div');
			actionBar.className = 'upload-actions';
			uploadedContainer.appendChild(actionBar);
			
			// Position container
			const plusRect = plusButton.getBoundingClientRect();
			uploadedContainer.style.left = `${plusRect.left}px`;
			uploadedContainer.style.bottom = `${window.innerHeight - plusRect.top + 10}px`;
			
			// Add close listener
			document.addEventListener('click', closeUploadPreviewOutside);
		}
		
		const filesContainer = uploadedContainer.querySelector('.files-container');
		const actionBar = uploadedContainer.querySelector('.upload-actions');
		
		// Process each file
		files.forEach(file => {
			// Add file to global pending uploads with additional data
			if (isImageUpload && file.type.startsWith('image/')) {
				const objectURL = URL.createObjectURL(file);
				file.previewUrl = objectURL; // Store URL with the file
			}
			
			window.pendingUploads.push(file);
			
			// Create file preview element
			const filePreview = document.createElement('div');
			filePreview.className = 'file-preview';
			
			if (isImageUpload && file.type.startsWith('image/')) {
				// Image preview
				const img = document.createElement('img');
				img.className = 'uploaded-image';
				img.alt = file.name;
				
				const objectURL = URL.createObjectURL(file);
				img.src = objectURL;
				img.dataset.src = objectURL; // Store for later use
				
				img.onload = () => {
					URL.revokeObjectURL(objectURL);
				};
				
				filePreview.appendChild(img);
			} else {
				// File preview
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
			
			// Add to files container
			filesContainer.appendChild(filePreview);
		});
		
		// Update action bar
		updateActionBar(actionBar);
		
		// Show the container if it's new
		if (isNewContainer) {
			setTimeout(() => {
				uploadedContainer.classList.add('active');
			}, 10);
		}
		
		function updateActionBar(actionBar) {
			// Clear existing buttons
			actionBar.innerHTML = '';
			
			// Just show a close button regardless of files
			const closeButton = document.createElement('button');
			closeButton.className = 'upload-close-button';
			closeButton.innerHTML = '✕';
			closeButton.addEventListener('click', closeUploadPreview);
			actionBar.appendChild(closeButton);
		}
		
		function closeUploadPreview() {
			uploadedContainer.classList.remove('active');
			setTimeout(() => {
				document.body.removeChild(uploadedContainer);
				// Don't clear uploads when closing - they remain pending until sent or canceled
			}, 200);
			document.removeEventListener('click', closeUploadPreviewOutside);
		}
		
		function closeUploadPreviewOutside(e) {
			if (!uploadedContainer.contains(e.target) && e.target !== plusButton) {
				closeUploadPreview();
			}
		}
	}
}

// Helper function for file size formatting
function formatFileSize(bytes) {
	if (bytes < 1024) return bytes + ' B';
	else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
	else return (bytes / 1048576).toFixed(1) + ' MB';
}