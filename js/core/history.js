let currentConversationHistory = [];

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