let displayedImages = {};  // To store which queries have already displayed images
let idleTimeout;  // Variable to track the idle timeout

// Function to trigger a reminder message when the user is idle
function sendReminderMessage() {
    let chatLog = document.getElementById('chat-log');
    
    let reminderMessage = document.createElement('div');
    reminderMessage.classList.add('chat-message', 'bot');
    reminderMessage.innerHTML = `<img src="static/images/logo.jpg" alt="Logo" class="simad-logo">
                                 <div class="chat-bubble bot">You can ask me anything about Simad University, such as its history, rectors, or programs!</div>`;
    chatLog.appendChild(reminderMessage);
    chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the bottom
}

// Function to reset the idle timer
function resetIdleTimer() {
    // Clear the existing timeout (if any)
    clearTimeout(idleTimeout);

    // Set a new timeout for 1 minute (60000 ms)
    idleTimeout = setTimeout(sendReminderMessage, 60000);
}

// Start the idle timer when the page loads
resetIdleTimer();

document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Reset the idle timer on user interaction
    resetIdleTimer();

    let query = document.getElementById('query').value.toLowerCase().trim();  // Normalize to lowercase and trim

    // Add the user's message to the chat log
    let chatLog = document.getElementById('chat-log');
    let userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.innerHTML = `<div class="chat-bubble user">${query}</div>`;
    chatLog.appendChild(userMessage);

    // Clear the input field
    document.getElementById('query').value = '';

    // Show typing indicator before SIMAD starts responding
    let typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-message', 'bot');
    typingIndicator.innerHTML = `<img src="static/images/logo.jpg" alt="Logo" class="simad-logo"> <div class="typing-indicator">...</div>`;
    chatLog.appendChild(typingIndicator);

    // Scroll to the bottom of the chat log
    chatLog.scrollTop = chatLog.scrollHeight;

    // Simulate a delay (to mimic actual processing time)
    setTimeout(() => {
        // Check if the query is about general knowledge (use Wikipedia API as an example)
        if (query.includes("general knowledge") || query.includes("tell me about")) {
            fetchGeneralKnowledge(query).then(data => {
                // Remove typing indicator
                chatLog.removeChild(typingIndicator);

                // Display the response
                let simadMessage = document.createElement('div');
                simadMessage.classList.add('chat-message', 'bot');
                simadMessage.innerHTML = `<img src="static/images/logo.jpg" alt="Logo" class="simad-logo"> 
                                          <div class="chat-bubble bot">${data}</div>`;
                chatLog.appendChild(simadMessage);
                chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the bottom
            }).catch(() => {
                chatLog.removeChild(typingIndicator);

                let simadMessage = document.createElement('div');
                simadMessage.classList.add('chat-message', 'bot');
                simadMessage.innerHTML = `<img src="static/images/logo.jpg" alt="Logo" class="simad-logo"> 
                                          <div class="chat-bubble bot">Sorry, I couldn't find the information you were looking for.</div>`;
                chatLog.appendChild(simadMessage);
                chatLog.scrollTop = chatLog.scrollHeight;
            });
        } else {
            // Otherwise, proceed with Simad-specific responses
            fetch('/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `query=${query}`
            })
            .then(response => response.json())
            .then(data => {
                // Remove typing indicator
                chatLog.removeChild(typingIndicator);

                // Create a new element for SIMAD's response
                let simadMessage = document.createElement('div');
                simadMessage.classList.add('chat-message', 'bot');
                simadMessage.innerHTML = `<img src="static/images/logo.jpg" alt="Logo" class="simad-logo"> 
                                          <div class="chat-bubble bot"></div>`;
                chatLog.appendChild(simadMessage);

                let simadText = simadMessage.querySelector('.chat-bubble.bot');
                let index = 0;

                // Typing animation (reveals text letter by letter)
                function typeText() {
                    if (index < data.text.length) {
                        simadText.innerHTML += data.text.charAt(index);
                        index++;
                        setTimeout(typeText, 50);  // Typing speed
                    } else {
                        // After text has been fully typed, show images (if available) but prevent duplicates
                        if (Array.isArray(data.image) && !(query in displayedImages)) {
                            data.image.forEach(img => {
                                let imgTag = document.createElement('img');
                                imgTag.src = img;
                                imgTag.style.maxWidth = "700px";
                                imgTag.style.maxHeight = "700px";
                                imgTag.style.borderRadius = "7px";  // Add border-radius to the images
                                imgTag.style.marginBottom = "20px";  // Add space between the image and the next input
                                chatLog.appendChild(imgTag);
                            });
                            displayedImages[query] = true;  // Mark this query as having displayed images
                        } else if (data.image && !(query in displayedImages)) {
                            let imgTag = document.createElement('img');
                            imgTag.src = data.image;
                            imgTag.style.maxWidth = "170px";
                            imgTag.style.maxHeight = "170px";
                            imgTag.style.borderRadius = "7px";  // Add border-radius to the image
                            imgTag.style.marginBottom = "20px";  // Add space between the image and the next input
                            chatLog.appendChild(imgTag);

                            displayedImages[query] = true;  // Mark this query as having displayed images
                        }

                        // Scroll to the bottom of the chat log after adding images
                        chatLog.scrollTop = chatLog.scrollHeight;
                    }
                }

                // Start typing out the text
                typeText();
            });
        }
    }, 1000);  // Simulated delay before fetching the response (1 second)
});

// Fetch general knowledge from Wikipedia API (for example)
async function fetchGeneralKnowledge(query) {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.extract || "No information found.";
}
