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
	
	
	if (hasFiles) {
		
		addFilesToChat(window.pendingUploads, messageSpace);
		
		
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
	
	
	if (userMessage) {
		await handleChatSubmission(chatForm, chatInput, messageSpace, sendButton, sendIconHTML);
	} else if (hasFiles) {
		
		sendButton.innerHTML = userMessage ? sendIconHTML : voiceIconHTML;
		sendButton.disabled = !userMessage;
	}
}


function addFilesToChat(files, messageSpace) {
	if (!messageSpace || !files.length) return;
	
	files.forEach(file => {
		
		const uploadContainer = document.createElement('div');
		uploadContainer.className = 'space-request';
		
		const fileBlock = document.createElement('div');
		fileBlock.className = 'space-request-block';
		
		if (file.type.startsWith('image/')) {
			
			const chatImg = document.createElement('img');
			chatImg.className = 'uploaded-image';
			chatImg.alt = file.name;
			
			
			let imgSrc = file.previewUrl || URL.createObjectURL(file);
			chatImg.src = imgSrc;
			fileBlock.appendChild(chatImg);
		} else {
			
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
	
	
	messageSpace.scrollTop = messageSpace.scrollHeight;
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
}


function formatFileSize(bytes) {
	if (bytes < 1024) return bytes + ' B';
	else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
	else return (bytes / 1048576).toFixed(1) + ' MB';
}