import { getSavedChats, deleteChat, clearAllChats, loadChat, saveCurrentChat, clearHistory } from '../core/history.js';
import { updateWelcomeScreen } from './welcome.js';

let currentChatId = null;

export function createChatHistoryModal() {
    const overlay = document.createElement('div');
    overlay.className = 'chat-history-overlay';
    
    const sidebar = document.createElement('div');
    sidebar.className = 'chat-history-sidebar';
    
    // Header
    const header = document.createElement('div');
    header.className = 'chat-history-header';
    
    const title = document.createElement('h3');
    title.className = 'chat-history-title';
    title.textContent = 'Historie chatů';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'chat-history-close';
    closeButton.innerHTML = '✕';
    closeButton.addEventListener('click', closeChatHistory);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Content
    const content = document.createElement('div');
    content.className = 'chat-history-content';
    
    const chatList = document.createElement('ul');
    chatList.className = 'chat-history-list';
    
    // Load and display chats
    refreshChatList(chatList);
    
    content.appendChild(chatList);
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'chat-history-footer';
    
    const clearAllButton = document.createElement('button');
    clearAllButton.className = 'chat-history-clear-all';
    clearAllButton.textContent = 'Smazat vše';
    clearAllButton.addEventListener('click', () => {
        if (confirm('Opravdu chcete smazat všechny chaty?')) {
            clearAllChats();
            refreshChatList(chatList);
        }
    });
    
    footer.appendChild(clearAllButton);
    
    sidebar.appendChild(header);
    sidebar.appendChild(content);
    sidebar.appendChild(footer);
    overlay.appendChild(sidebar);
    
    // Close on overlay click
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
        date.textContent = chat.date;
        
        const actions = document.createElement('div');
        actions.className = 'chat-history-actions';
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'chat-history-delete';
        deleteButton.innerHTML = '🗑️';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Opravdu chcete smazat tento chat?')) {
                deleteChat(chat.id);
                if (currentChatId === chat.id) {
                    currentChatId = null;
                }
                refreshChatList(chatList);
            }
        });
        
        actions.appendChild(deleteButton);
        
        listItem.appendChild(preview);
        listItem.appendChild(date);
        listItem.appendChild(actions);
        
        // Load chat on click
        listItem.addEventListener('click', () => {
            loadSelectedChat(chat.id);
            // Close the modal
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
    // Import required functions
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
    // Save current chat if it has messages
    if (currentChatId === null) {
        currentChatId = saveCurrentChat();
    }
    
    // Clear current conversation
    clearHistory();
    currentChatId = null;
    
    // Clear message space
    const messageSpace = document.getElementById('message-space');
    if (messageSpace) {
        while (messageSpace.firstChild) {
            messageSpace.removeChild(messageSpace.firstChild);
        }
        updateWelcomeScreen(messageSpace);
    }
    
    // Clear uploads
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