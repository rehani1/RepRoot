let conversation = [];

export const getConversation = () => conversation;

export const initConversation = () => {
    addSystemMessage("You are an assistant for the mobile app RepRoot which helps users track gym progress, workouts, and nutrition.");
}

export const addUserMessage = (messageText) => {
    conversation.push({
        role: 'user',
        content: messageText,
    })
}

export const addAssistantMessage = (messageText) => {
    conversation.push({
        role: 'assistant',
        content: messageText,
    })
}

export const addSystemMessage = (messageText) => {
    conversation.push({
        role: 'system',
        content: messageText,
    })
}