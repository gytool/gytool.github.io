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
	const chatForm = document.getElementById('chat-form');
	const chatInput = document.getElementById('chat-input');
	const messageSpace = document.getElementById('message-space');
	const sendButton = document.querySelector('.panel-send');
	const headerNew = document.querySelector('.header-new');
	const headerApi = document.querySelector('.header-api');
	const headerMenu = document.querySelector('.header-menu');

	if (!chatForm) {
		 return;
	}

	createApiKeyModal(headerApi);
	createModelSettingsModal(headerMenu);
	updateWelcomeScreen(messageSpace);
	setupCodeBlockHandlers();
	
	const originalSendHTML = sendButton?.innerHTML || '';
	
	chatForm.addEventListener('submit', async (event) => {
		 event.preventDefault();
		 await handleChatSubmission(chatForm, chatInput, messageSpace, sendButton, originalSendHTML);
	});

	if (chatInput && sendButton) {
		 chatInput.addEventListener('input', () => {
			  sendButton.disabled = chatInput.value.trim() === '';
		 });
		 sendButton.disabled = chatInput.value.trim() === '';
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