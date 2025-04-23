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

document.addEventListener('DOMContentLoaded', () => {
	// Get DOM elements
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

	// Initialize components
	createApiKeyModal(headerApi);
	createModelSettingsModal(headerSettings);
	updateWelcomeScreen(messageSpace);
	setupCodeBlockHandlers();
	
	// Store original send button HTML
	const originalSendHTML = sendButton?.innerHTML || '';
	
	// Form submission handler
	chatForm.addEventListener('submit', async (event) => {
		 event.preventDefault();
		 await handleChatSubmission(chatForm, chatInput, messageSpace, sendButton, originalSendHTML);
	});

	// Input event listeners for enabling/disabling send button
	if (chatInput && sendButton) {
		 chatInput.addEventListener('input', () => {
			  sendButton.disabled = chatInput.value.trim() === '';
		 });
		 sendButton.disabled = chatInput.value.trim() === '';
	}

	// Shift+Enter handling for multiline input
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

	// New chat button handler
	if (headerNew && messageSpace) {
		 headerNew.addEventListener('click', () => {
			  // Clear all messages
			  while (messageSpace.firstChild) {
					messageSpace.removeChild(messageSpace.firstChild);
			  }
			  
			  // Show welcome screen
			  updateWelcomeScreen(messageSpace);

			  // Reset input field
			  if (chatInput) {
					chatInput.value = '';
					chatInput.focus();
			  }

			  // Disable send button
			  if (sendButton) {
					sendButton.disabled = true;
			  }
		 });
	}
});