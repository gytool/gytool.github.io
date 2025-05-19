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

	if (!chatForm) {
		 return;
	}

	createApiKeyModal(headerApi);
	createModelSettingsModal(headerModel);
	updateWelcomeScreen(messageSpace);
	setupCodeBlockHandlers();
	
	const voiceIconHTML = `<img src="./assets/vectors/voice.svg" alt="Voice" class='panel-send'>`;
	const sendIconHTML = `<img src="./assets/vectors/send.svg" alt="Send" class='panel-send'>`;
	
	chatForm.addEventListener('submit', async (event) => {
		 event.preventDefault();
		 await handleChatSubmission(chatForm, chatInput, messageSpace, sendButton, sendIconHTML);
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
			  
			  // Clear conversation history when starting a new chat
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