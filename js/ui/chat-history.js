import { getSavedChats, deleteChat, clearAllChats, loadChat, saveCurrentChat, clearHistory } from '../core/history.js';
import { updateWelcomeScreen } from './welcome.js';

let currentChatId = null;

export function createChatHistoryModal() {
    const overlay = document.createElement('div');
    overlay.className = 'chat-history-overlay';
    
    const sidebar = document.createElement('div');
    sidebar.className = 'chat-history-sidebar';
    
    const header = document.createElement('div');
    header.className = 'chat-history-header';
    
    const title = document.createElement('h3');
    title.className = 'chat-history-title';
    title.textContent = 'Historie';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'chat-history-close';
    closeButton.innerHTML = `
	 	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none">
			<path d="M4.47304 0.736342L15 11.2633L25.4724 0.790886C25.7037 0.544668 25.9824 0.347702 26.2917 0.2118C26.601 0.0758973 26.9346 0.00385719 27.2724 0C27.9957 0 28.6893 0.287328 29.2008 0.798776C29.7122 1.31022 29.9996 2.0039 29.9996 2.72719C30.0059 3.06155 29.9439 3.39368 29.8173 3.7032C29.6906 4.01272 29.5021 4.29311 29.2632 4.52714L18.6544 14.9996L29.2632 25.6083C29.7127 26.0481 29.9763 26.6435 29.9996 27.2719C29.9996 27.9952 29.7122 28.6889 29.2008 29.2003C28.6893 29.7118 27.9957 29.9991 27.2724 29.9991C26.9248 30.0135 26.578 29.9555 26.2541 29.8288C25.9301 29.702 25.6361 29.5093 25.3906 29.2628L15 18.7358L4.50031 29.2355C4.26988 29.4735 3.99459 29.6635 3.69034 29.7946C3.38609 29.9257 3.05889 29.9952 2.72764 29.9991C2.00434 29.9991 1.31067 29.7118 0.79922 29.2003C0.287772 28.6889 0.000443732 27.9952 0.000443732 27.2719C-0.0059147 26.9376 0.0561205 26.6054 0.182743 26.2959C0.309365 25.9864 0.497903 25.706 0.736786 25.472L11.3456 14.9996L0.736786 4.39078C0.287303 3.95104 0.0237329 3.35557 0.000443732 2.72719C0.000443732 2.0039 0.287772 1.31022 0.79922 0.798776C1.31067 0.287328 2.00434 0 2.72764 0C3.38216 0.00818158 4.00942 0.272719 4.47304 0.736342Z" fill="#666666"/>
		</svg>
	 `;
    closeButton.addEventListener('click', closeChatHistory);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    const content = document.createElement('div');
    content.className = 'chat-history-content';
    
    const chatList = document.createElement('ul');
    chatList.className = 'chat-history-list';
    
    refreshChatList(chatList);
    
    content.appendChild(chatList);
    
    const footer = document.createElement('div');
    footer.className = 'chat-history-footer';
    
		const clearAllButton = document.createElement('button');
		clearAllButton.className = 'chat-history-clear-all';
		clearAllButton.textContent = 'Smazat vše';
		clearAllButton.addEventListener('click', () => {
			clearAllChats();
			refreshChatList(chatList);
		});
		
		footer.appendChild(clearAllButton);
		
		sidebar.appendChild(header);
		sidebar.appendChild(content);
		sidebar.appendChild(footer);
		overlay.appendChild(sidebar);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeChatHistory();
        }
    });
    
    // Close on escape key
    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            closeChatHistory();
        }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    function closeChatHistory() {
        overlay.classList.remove('active');
        document.removeEventListener('keydown', handleKeyPress);
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300);
    }
    
    document.body.appendChild(overlay);
    
    // Show with animation
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
    
    return overlay;
}

function refreshChatList(chatList) {
    chatList.innerHTML = '';
    
    const savedChats = getSavedChats();
    
    if (savedChats.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'chat-history-empty';
        emptyItem.textContent = 'Zatím žádné uložené chaty';
        chatList.appendChild(emptyItem);
        return;
    }
    
    savedChats.forEach(chat => {
        const listItem = document.createElement('li');
        listItem.className = 'chat-history-item';
        if (chat.id === currentChatId) {
            listItem.classList.add('active');
        }
        
        const preview = document.createElement('div');
        preview.className = 'chat-history-preview';
        preview.textContent = chat.preview;
        
        const date = document.createElement('div');
        date.className = 'chat-history-date';
        const chatDate = new Date(chat.date);
        date.textContent = chatDate.toLocaleString('cs-CZ', {
            day: 'numeric',    // This removes leading zeros from day
            month: 'numeric',  // This removes leading zeros from month  
            year: '2-digit',   // This shows only 2-digit year (25 instead of 2025)
            hour: '2-digit',
            minute: '2-digit'
        });

        const actions = document.createElement('div');
        actions.className = 'chat-history-actions';

			const deleteButton = document.createElement('button');
			deleteButton.className = 'chat-history-delete';
			deleteButton.innerHTML = `
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 40" fill="none">
					<path d="M34 6C34.5304 6 35.0391 6.21071 35.4142 6.58579C35.7893 6.96086 36 7.46957 36 8C36 8.53043 35.7893 9.03914 35.4142 9.41421C35.0391 9.78929 34.5304 10 34 10H32L31.994 10.142L30.128 36.284C30.0562 37.2932 29.6046 38.2376 28.8642 38.9271C28.1239 39.6167 27.1497 40 26.138 40H9.86C8.84828 40 7.87413 39.6167 7.13377 38.9271C6.39341 38.2376 5.94183 37.2932 5.87 36.284L4.004 10.144L4 10H2C1.46957 10 0.960859 9.78929 0.585786 9.41421C0.210714 9.03914 0 8.53043 0 8C0 7.46957 0.210714 6.96086 0.585786 6.58579C0.960859 6.21071 1.46957 6 2 6H34ZM27.994 10H8.006L9.862 36H26.138L27.994 10ZM22 0C22.5304 0 23.0391 0.210714 23.4142 0.585786C23.7893 0.960859 24 1.46957 24 2C24 2.53043 23.7893 3.03914 23.4142 3.41421C23.0391 3.78929 22.5304 4 22 4H14C13.4696 4 12.9609 3.78929 12.5858 3.41421C12.2107 3.03914 12 2.53043 12 2C12 1.46957 12.2107 0.960859 12.5858 0.585786C12.9609 0.210714 13.4696 0 14 0H22Z" fill="#666666"/>
				</svg>`
			;
			deleteButton.addEventListener('click', (e) => {
					e.stopPropagation();
					deleteChat(chat.id);
						if (currentChatId === chat.id) {
							currentChatId = null;
						}
						refreshChatList(chatList);
			});
        
        actions.appendChild(deleteButton);
        
        listItem.appendChild(preview);
        listItem.appendChild(date);
        listItem.appendChild(actions);
        
        // Load chat on click
        listItem.addEventListener('click', () => {
            loadSelectedChat(chat.id);
            const overlay = document.querySelector('.chat-history-overlay');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                }, 300);
            }
        });
        
        chatList.appendChild(listItem);
    });
}

function loadSelectedChat(chatId) {
    const chat = loadChat(chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    
    // Clear current message space
    const messageSpace = document.getElementById('message-space');
    if (messageSpace) {
        while (messageSpace.firstChild) {
            messageSpace.removeChild(messageSpace.firstChild);
        }
        
        // Recreate messages from history
        recreateMessagesFromHistory(chat.messages, messageSpace);
    }
    
    // Clear input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = '';
        chatInput.focus();
    }
}

function recreateMessagesFromHistory(messages, messageSpace) {
    import('./chat.js').then(module => {
        const { createRequestMessageElement, createResponseMessageElement } = module;
        
        for (let i = 0; i < messages.length; i += 2) {
            const userMessage = messages[i];
            const assistantMessage = messages[i + 1];
            
            if (userMessage && userMessage.role === 'user') {
                const messageContainer = document.createElement('div');
                messageContainer.classList.add('message-container');
                
                const requestElement = createRequestMessageElement(userMessage.content);
                messageContainer.appendChild(requestElement);
                
                if (assistantMessage && assistantMessage.role === 'assistant') {
                    const responseElement = createResponseMessageElement(
                        assistantMessage.content, 
                        userMessage.content, 
                        true
                    );
                    messageContainer.appendChild(responseElement);
                }
                
                messageSpace.appendChild(messageContainer);
            }
        }
        
        messageSpace.scrollTop = messageSpace.scrollHeight;
    });
}

export function startNewChat() {
    if (currentChatId === null) {
        currentChatId = saveCurrentChat();
    }
    
    clearHistory();
    currentChatId = null;
    
    const messageSpace = document.getElementById('message-space');
    if (messageSpace) {
        while (messageSpace.firstChild) {
            messageSpace.removeChild(messageSpace.firstChild);
        }
        updateWelcomeScreen(messageSpace);
    }
    
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

export function saveCurrentChatIfNeeded() {
    if (currentChatId === null) {
        currentChatId = saveCurrentChat();
    }
}