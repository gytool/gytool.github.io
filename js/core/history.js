let currentConversationHistory = [];
let savedChats = JSON.parse(localStorage.getItem('chat_history') || '[]');

export function addToHistory(role, content) {
    if (!content || content.trim() === '') return;
    
    currentConversationHistory.push({
        role: role,
        content: content
    });
}

export function getHistory() {
    return [...currentConversationHistory];
}

export function clearHistory() {
    currentConversationHistory = [];
}

export function saveCurrentChat() {
    if (currentConversationHistory.length === 0) return null;
    
    // Find the first user message for preview
    const firstUserMessage = currentConversationHistory.find(msg => msg.role === 'user');
    const preview = firstUserMessage ? firstUserMessage.content.substring(0, 50) : 'New Chat';
    
    const chatData = {
        id: Date.now(),
        preview: preview,
        date: new Date().toLocaleString('cs-CZ'),
        messages: [...currentConversationHistory]
    };
    
    savedChats.unshift(chatData);
    
    // Keep only last 50 chats
    if (savedChats.length > 50) {
        savedChats = savedChats.slice(0, 50);
    }
    
    localStorage.setItem('chat_history', JSON.stringify(savedChats));
    return chatData.id;
}

export function loadChat(chatId) {
    const chat = savedChats.find(c => c.id === chatId);
    if (chat) {
        currentConversationHistory = [...chat.messages];
        return chat;
    }
    return null;
}

export function deleteChat(chatId) {
    savedChats = savedChats.filter(c => c.id !== chatId);
    localStorage.setItem('chat_history', JSON.stringify(savedChats));
}

export function getSavedChats() {
    return [...savedChats];
}

export function clearAllChats() {
    savedChats = [];
    localStorage.setItem('chat_history', JSON.stringify(savedChats));
}