document.addEventListener('DOMContentLoaded', () => {
    const messageContainer = document.getElementById('messageContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const emojiButton = document.getElementById('emojiButton');
    const emojiPicker = document.getElementById('emojiPicker');
    const imageUpload = document.getElementById('imageUpload');
    const thinkingIndicator = document.getElementById('thinkingIndicator');

    const API_URL = document.querySelector('meta[name="api-url"]').getAttribute('content');
    const API_KEY = document.querySelector('meta[name="api-key"]').getAttribute('content');

    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'];

    let conversationHistory = [
        { role: "system", content: "你是一个名为FQD Nem的AI助手,由智谱AI公司开发。请以友好、专业的态度回答用户的问题。" }
    ];

    function addMessage(content, isUser = false, isImage = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user-message' : 'message ai-message';
        
        if (isImage) {
            const img = document.createElement('img');
            img.src = content;
            img.alt = 'Uploaded image';
            img.className = 'uploaded-image';
            messageDiv.appendChild(img);
            content = "用户上传了一张图片。"; // 为图片添加文字描述
        } else {
            messageDiv.textContent = content;
        }
        
        messageContainer.appendChild(messageDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;

        // 添加消息到对话历史
        conversationHistory.push({ role: isUser ? 'user' : 'assistant', content: content });
    }

    function showThinkingIndicator() {
        thinkingIndicator.style.display = 'flex';
    }

    function hideThinkingIndicator() {
        thinkingIndicator.style.display = 'none';
    }

    async function getAIResponse(userMessage) {
        showThinkingIndicator();
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "glm-3-turbo",
                    messages: conversationHistory,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API错误:', errorText);
                throw new Error(`AI响应失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } finally {
            hideThinkingIndicator();
        }
    }

    async function handleUserInput() {
        const userMessage = userInput.value.trim();
        if (userMessage) {
            addMessage(userMessage, true);
            userInput.value = '';
            
            try {
                const aiResponse = await getAIResponse(userMessage);
                addMessage(aiResponse);
            } catch (error) {
                console.error('Error:', error);
                addMessage('抱歉,我现在无法回答。请稍后再试。');
            }
        }
    }

    function createEmojiPicker() {
        emojis.forEach(emoji => {
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = emoji;
            emojiSpan.addEventListener('click', () => {
                userInput.value += emoji;
                emojiPicker.style.display = 'none';
            });
            emojiPicker.appendChild(emojiSpan);
        });
    }

    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });

    emojiButton.addEventListener('click', () => {
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'flex' : 'none';
    });

    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiButton) {
            emojiPicker.style.display = 'none';
        }
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function(event) {
                addMessage(event.target.result, true, true);
                
                try {
                    const aiResponse = await getAIResponse("用户上传了一张图片。请对此作出回应。");
                    addMessage(aiResponse);
                } catch (error) {
                    console.error('Error:', error);
                    addMessage('抱歉,我现在无法处理这张图片。请稍后再试。');
                }
            };
            reader.readAsDataURL(file);
        }
    });

    createEmojiPicker();

    // 添加初始AI消息
    addMessage("您好！我是FQD Nem AI，有什么我可以帮助您的吗？");
});
