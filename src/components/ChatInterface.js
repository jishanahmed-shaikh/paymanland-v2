import React, { useState, useEffect, useRef } from 'react';
import { agentInfo } from '../utils/langchainConfig';

function ChatInterface({ npcName, onClose, autoFocus }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        let greeting = "";
        if (npcName === "Wise Trekker") {
            greeting = "Greetings, fellow traveler! From this vantage point near the Payman Land sign, I can share some wisdom about life's journey. What's on your mind?";
        } else if (npcName === "Sheriff John") {
            greeting = "Welcome! I'm here to help ensure your shopping experience is safe and authentic.";
        } else if (npcName === "Priya Sharma") {
            greeting = "Namaste! I'm here to help you discover your perfect style.";
        }
        
        setMessages([{
            type: 'ai',
            content: greeting
        }]);

        // Focus the input when chat opens
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [npcName, autoFocus]);

    const handleInputChange = (e) => {
        // Allow spaces and all characters
        setInputMessage(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Store the message text before clearing input
        const messageText = inputMessage.trim();
        setInputMessage('');
        
        // Add user message to chat
        setMessages(prev => [...prev, {
            type: 'human',
            content: messageText
        }]);

        setIsTyping(true);

        try {
            const chat = agentInfo[npcName].chat;
            // Send the exact message text to the chat model
            const result = await chat.sendMessage(messageText);
            const response = await result.response.text();
            
            setMessages(prev => [...prev, {
                type: 'ai',
                content: response
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                type: 'ai',
                content: "Sorry, I couldn't process that message."
            }]);
        }
        
        setIsTyping(false);

        // Refocus the input after sending message
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyDown = (e) => {
        // Stop propagation of all keyboard events
        e.stopPropagation();
    };

    return (
        <div 
            style={{
                width: '80%',
                maxWidth: '600px',
                height: '80vh',
                backgroundColor: '#fff',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'relative'
            }}
            onKeyDown={handleKeyDown}
        >
            <div style={{
                padding: '15px',
                borderBottom: '2px solid #dedede',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <img 
                    src={agentInfo[npcName].avatar} 
                    alt={npcName} 
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%'
                    }}
                />
                <h2 style={{ margin: 0 }}>{npcName}</h2>
                <button 
                    onClick={onClose}
                    style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '0 8px'
                    }}
                >×</button>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: msg.type === 'human' ? 'flex-end' : 'flex-start'
                    }}>
                        <div style={{
                            maxWidth: '70%',
                            padding: '10px 15px',
                            borderRadius: '15px',
                            backgroundColor: msg.type === 'human' ? '#007bff' : '#f1f1f1',
                            color: msg.type === 'human' ? 'white' : 'black',
                            wordBreak: 'break-word'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ color: '#666', fontStyle: 'italic' }}>
                        {npcName} is typing...
                    </div>
                )}
            </div>

            <form 
                onSubmit={handleSubmit} 
                style={{
                    padding: '15px',
                    borderTop: '2px solid #dedede',
                    display: 'flex',
                    gap: '10px'
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        padding: '10px 15px',
                        border: '2px solid #dedede',
                        borderRadius: '20px',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                />
                <button 
                    type="submit" 
                    disabled={!inputMessage.trim() || isTyping}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: !inputMessage.trim() || isTyping ? '#cccccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: !inputMessage.trim() || isTyping ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default ChatInterface; 