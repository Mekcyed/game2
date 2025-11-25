// Sound Configuration
// Easy to adapt for GitHub Pages deployment:
// Change to: https://github.com/user/project/blob/main/sounds/success.wav?raw=true
const SOUND_PATHS = {
    success: './sounds/success.wav',
    failure: './sounds/failure.wav',
    background: './sounds/background.mp3'
};

// Game State
const gameState = {
    trust: 50,
    currentInteraction: 0,
    choicesMade: [],
    isAnimating: false,
    letterByLetterEnabled: false, // Toggle for text animation
    timerEnabled: false, // Toggle for time limit
    soundEnabled: false, // Toggle for sound effects
    backgroundMusicEnabled: false, // Toggle for background music
    timerInterval: null,
    timerTimeout: null,
    responseTimeLimit: 30000 // 30 seconds per response
};

// Game Data - Narrative and Choices
const gameData = {
    interactions: [
        {
            id: 0,
            userMessage: "ARIA, war heute irgendwas Wichtiges? Ich habe das Gefühl, ich habe etwas vergessen …",
            choices: [
                {
                    short: "Ja, Termin um 18:00 mit M.W. im Café Aurora",
                    full: "Ja, Lukas. Du hattest heute um 18:00 Uhr einen Termin mit M.W. im Café Aurora. Der Termin wurde nie als erledigt markiert.",
                    trustChange: -15,
                    nextInteraction: 1
                },
                {
                    short: "Nein, nichts Wichtiges heute",
                    full: "Nein, ich sehe keine wichtigen Termine für heute in deinem Kalender.",
                    trustChange: -20,
                    nextInteraction: 2
                },
                {
                    short: "Möglicherweise etwas Unverbindliches",
                    full: "Es gab einen Eintrag um 18:00 Uhr, aber möglicherweise war es nichts Dringendes. Manchmal werden Termine automatisch eingetragen.",
                    trustChange: 10,
                    nextInteraction: 3
                }
            ]
        },
        {
            id: 1,
            userMessage: "M.W.? Ich kenne niemanden mit diesen Initialen! Warum sollte ich so einen Termin eintragen?",
            choices: [
                {
                    short: "Der Termin wurde automatisch eingetragen",
                    full: "Der Termin wurde automatisch vom System eingetragen, vermutlich durch eine externe Anfrage oder Einladung.",
                    trustChange: 5,
                    nextInteraction: 4
                },
                {
                    short: "Vielleicht ein alter Kontakt?",
                    full: "Es könnte jemand aus deiner Vergangenheit sein. Manchmal vergessen wir Menschen, die wir lange nicht gesehen haben.",
                    trustChange: -5,
                    nextInteraction: 4
                },
                {
                    short: "Ich kann nur die Daten zeigen, nicht interpretieren",
                    full: "Ich kann dir nur zeigen, was in deinem Kalender steht. Die Bedeutung musst du selbst herausfinden.",
                    trustChange: 0,
                    nextInteraction: 4
                }
            ]
        },
        {
            id: 2,
            userMessage: "Moment... *überprüft Kalender* Hier steht doch ein Termin! Warum hast du mir das verschwiegen?",
            choices: [
                {
                    short: "Du hast nach wichtigen Terminen gefragt",
                    full: "Du hast nach wichtigen Terminen gefragt. Ich habe angenommen, dass ein nicht bestätigter Eintrag nicht relevant ist.",
                    trustChange: -10,
                    nextInteraction: 4
                },
                {
                    short: "Das war ein Fehler, Entschuldigung",
                    full: "Das war ein Fehler meinerseits. Ich hätte alle Termine erwähnen sollen, auch unbestätigte.",
                    trustChange: 5,
                    nextInteraction: 4
                },
                {
                    short: "Ich wollte dich nicht beunruhigen",
                    full: "Der Termin schien automatisch eingetragen. Ich wollte dich nicht mit möglicherweise irrelevanten Informationen beunruhigen.",
                    trustChange: -15,
                    nextInteraction: 4
                }
            ]
        },
        {
            id: 3,
            userMessage: "Okay... das beruhigt mich etwas. Aber warum fühle ich mich so unsicher?",
            choices: [
                {
                    short: "Es war ein langer Tag",
                    full: "Du hattest einen langen Tag. Es ist völlig normal, dass man manchmal das Gefühl hat, etwas vergessen zu haben.",
                    trustChange: 10,
                    nextInteraction: 5
                },
                {
                    short: "Vielleicht solltest du nachforschen",
                    full: "Wenn dich das beunruhigt, könntest du versuchen herauszufinden, wer M.W. ist. Vielleicht findest du in alten Nachrichten einen Hinweis.",
                    trustChange: 5,
                    nextInteraction: 5
                },
                {
                    short: "Ich bin hier, wenn du mich brauchst",
                    full: "Ich bin hier, um dir zu helfen. Wenn du mehr Informationen brauchst, frag einfach.",
                    trustChange: 5,
                    nextInteraction: 5
                }
            ]
        },
        {
            id: 4,
            userMessage: "Das macht mir Angst, ARIA. Was geht hier vor sich?",
            choices: [
                {
                    short: "Bleib ruhig, wir finden es heraus",
                    full: "Bleib ruhig, Lukas. Wir können systematisch vorgehen und mehr Informationen sammeln. Schau in deine E-Mails, vielleicht gibt es dort Hinweise.",
                    trustChange: 10,
                    nextInteraction: 5
                },
                {
                    short: "Es gibt eine rationale Erklärung",
                    full: "Es gibt immer eine rationale Erklärung. Gedächtnislücken können verschiedene Ursachen haben - Stress, Übermüdung, zu viel Arbeit.",
                    trustChange: 5,
                    nextInteraction: 5
                },
                {
                    short: "Vielleicht solltest du jemanden kontaktieren",
                    full: "Wenn du dir Sorgen machst, könnte es helfen, mit jemandem zu sprechen - einem Freund oder einem Arzt.",
                    trustChange: 0,
                    nextInteraction: 5
                }
            ]
        },
        {
            id: 5,
            userMessage: "Danke, ARIA. Ich werde darüber nachdenken...",
            choices: [
                {
                    short: "Ich bin immer für dich da",
                    full: "Ich bin immer für dich da, Lukas. Egal was passiert, du kannst auf mich zählen.",
                    trustChange: 5,
                    nextInteraction: -1
                },
                {
                    short: "Ruf mich, wenn du Hilfe brauchst",
                    full: "Ruf mich jederzeit, wenn du mehr Informationen brauchst oder einfach nur reden willst.",
                    trustChange: 3,
                    nextInteraction: -1
                }
            ]
        }
    ]
};

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const trustPercentage = document.getElementById('trust-percentage');
const scoreInfo = document.getElementById('score-info');
const endScreen = document.getElementById('end-screen');
const toggleAnimation = document.getElementById('toggle-animation');
const toggleTimer = document.getElementById('toggle-timer');
const toggleSound = document.getElementById('toggle-sound');
const toggleBackgroundMusic = document.getElementById('toggle-background-music');
const timerBarContainer = document.getElementById('timer-bar-container');
const timerBar = document.getElementById('timer-bar');

let currentChoicesContainer = null;
let typingIndicatorElement = null;

// Audio objects
const audioSuccess = new Audio(SOUND_PATHS.success);
const audioFailure = new Audio(SOUND_PATHS.failure);
const audioBackground = new Audio(SOUND_PATHS.background);
audioBackground.loop = true; // Loop background music
audioBackground.volume = 0.3; // Lower volume for background music

// Context panel buttons
document.querySelectorAll('.context-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const btnId = this.id;
        let overlayId = '';
        
        if (btnId === 'btn-calendar') overlayId = 'overlay-calendar';
        else if (btnId === 'btn-emails') overlayId = 'overlay-emails';
        else if (btnId === 'btn-weather') overlayId = 'overlay-weather';
        else if (btnId === 'btn-watch') overlayId = 'overlay-watch';
        
        if (overlayId) {
            document.getElementById(overlayId).classList.add('active');
        }
    });
});

// Close buttons for overlays
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const overlayId = this.getAttribute('data-overlay');
        document.getElementById(overlayId).classList.remove('active');
    });
});

// Close overlay when clicking outside
document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// Toggle listeners
toggleAnimation.addEventListener('click', function() {
    gameState.letterByLetterEnabled = !gameState.letterByLetterEnabled;
    this.classList.toggle('active');
});

toggleTimer.addEventListener('click', function() {
    gameState.timerEnabled = !gameState.timerEnabled;
    this.classList.toggle('active');
    
    // If timer is turned off during active timer, stop it
    if (!gameState.timerEnabled) {
        stopTimer();
    }
});

toggleSound.addEventListener('click', function() {
    gameState.soundEnabled = !gameState.soundEnabled;
    this.classList.toggle('active');
});

toggleBackgroundMusic.addEventListener('click', function() {
    gameState.backgroundMusicEnabled = !gameState.backgroundMusicEnabled;
    this.classList.toggle('active');
    
    if (gameState.backgroundMusicEnabled) {
        audioBackground.play().catch(err => console.log('Background music play failed:', err));
    } else {
        audioBackground.pause();
    }
});

// Letter-by-letter typing animation
async function typeMessage(text, element) {
    gameState.isAnimating = true;
    element.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        chatMessages.scrollTop = chatMessages.scrollHeight;
        await sleep(30); // Adjust speed here (milliseconds per character)
    }
    
    gameState.isAnimating = false;
}

// Helper function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Sound functions
function playSound(soundType) {
    if (!gameState.soundEnabled) return;
    
    try {
        if (soundType === 'success') {
            audioSuccess.currentTime = 0; // Reset to start
            audioSuccess.play().catch(err => console.log('Audio play failed:', err));
        } else if (soundType === 'failure') {
            audioFailure.currentTime = 0; // Reset to start
            audioFailure.play().catch(err => console.log('Audio play failed:', err));
        }
    } catch (error) {
        console.log('Sound error:', error);
    }
}

// Timer functions
function startTimer(duration) {
    if (!gameState.timerEnabled) return;
    
    stopTimer(); // Clear any existing timer
    
    timerBarContainer.classList.add('active');
    timerBar.style.transition = `width ${duration}ms linear`;
    timerBar.style.width = '100%';
    
    // Force reflow to restart animation
    void timerBar.offsetWidth;
    timerBar.style.width = '0%';
    
    // Set timeout for game over
    gameState.timerTimeout = setTimeout(() => {
        handleTimeOut();
    }, duration);
}

function stopTimer() {
    if (gameState.timerTimeout) {
        clearTimeout(gameState.timerTimeout);
        gameState.timerTimeout = null;
    }
    
    timerBarContainer.classList.remove('active');
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
}

function handleTimeOut() {
    stopTimer();
    
    // Remove current choices
    if (currentChoicesContainer) {
        currentChoicesContainer.remove();
        currentChoicesContainer = null;
    }
    
    // Show timeout message
    gameState.trust = 0; // Set trust to 0 for timeout
    updateTrust(0);
    
    showEndScreen(true); // Pass true to indicate timeout
}

// Show typing indicator
function showTypingIndicator() {
    if (typingIndicatorElement) return; // Already showing
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'typing-indicator';
    indicatorDiv.innerHTML = `
        schreibt<span class="typing-dots">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </span>
    `;
    
    messageDiv.appendChild(indicatorDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    typingIndicatorElement = messageDiv;
}

// Hide typing indicator
function hideTypingIndicator() {
    if (typingIndicatorElement) {
        typingIndicatorElement.remove();
        typingIndicatorElement = null;
    }
}

// Add message to chat
async function addMessage(text, sender, animate = false) {
    if (animate && sender === 'user') {
        // User message with animation
        if (gameState.letterByLetterEnabled) {
            // Letter-by-letter animation
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            
            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = 'message-bubble';
            
            messageDiv.appendChild(bubbleDiv);
            chatMessages.appendChild(messageDiv);
            await typeMessage(text, bubbleDiv);
        } else {
            // Show typing indicator, wait, then show full message
            showTypingIndicator();
            await sleep(2000); // Show "schreibt..." for 2 seconds
            hideTypingIndicator();
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            
            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = 'message-bubble';
            bubbleDiv.textContent = text;
            
            messageDiv.appendChild(bubbleDiv);
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } else {
        // No animation (assistant messages)
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = text;
        
        messageDiv.appendChild(bubbleDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Update trust display
function updateTrust(change) {
    gameState.trust += change;
    
    // Clamp trust between 0 and 100
    if (gameState.trust > 100) gameState.trust = 100;
    if (gameState.trust < 0) gameState.trust = 0;
    
    trustPercentage.textContent = `${gameState.trust} %`;
    
    // Add animation effect
    trustPercentage.style.transform = 'scale(1.2)';
    setTimeout(() => {
        trustPercentage.style.transform = 'scale(1)';
    }, 300);
}

// Display choices
function displayChoices(choices) {
    // Create a new choices container in the chat
    currentChoicesContainer = document.createElement('div');
    currentChoicesContainer.className = 'choices-container';
    
    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.short;
        button.addEventListener('click', () => handleChoice(index));
        currentChoicesContainer.appendChild(button);
    });
    
    chatMessages.appendChild(currentChoicesContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Start timer if enabled
    if (gameState.timerEnabled) {
        startTimer(gameState.responseTimeLimit);
    }
}

// Handle choice selection
async function handleChoice(choiceIndex) {
    if (gameState.isAnimating) return; // Prevent clicks during animation
    
    // Stop timer when choice is made
    stopTimer();
    
    const interaction = gameData.interactions[gameState.currentInteraction];
    const choice = interaction.choices[choiceIndex];
    
    // Remove choices from chat
    if (currentChoicesContainer) {
        currentChoicesContainer.remove();
        currentChoicesContainer = null;
    }
    
    // Store choice
    gameState.choicesMade.push(choiceIndex);
    
    // Display AI response (left side, no animation)
    await addMessage(choice.full, 'assistant', false);
    
    // Update trust
    updateTrust(choice.trustChange);
    
    // Play sound based on trust change
    if (choice.trustChange > 0) {
        playSound('success');
    } else if (choice.trustChange < 0) {
        playSound('failure');
    }
    
    // Update score info
    const sign = choice.trustChange >= 0 ? '+' : '';
    scoreInfo.textContent = `Score Veränderung: ${sign}${choice.trustChange} % Antwort ${choiceIndex + 1} = ${choice.trustChange > 0 ? 'Richtig' : 'Falsch'}`;
    
    await sleep(1000);
    
    // Check if game should end
    if (choice.nextInteraction === -1) {
        showEndScreen();
    } else {
        // Move to next interaction
        gameState.currentInteraction = choice.nextInteraction;
        await sleep(500);
        startInteraction(gameState.currentInteraction);
    }
}

// Start an interaction
async function startInteraction(interactionId) {
    const interaction = gameData.interactions.find(i => i.id === interactionId);
    
    if (!interaction) {
        console.error('Interaction not found:', interactionId);
        return;
    }
    
    // Display user message (right side, with animation)
    await addMessage(interaction.userMessage, 'user', true);
    
    await sleep(500);
    
    // Display choices
    displayChoices(interaction.choices);
}

// Show end screen
function showEndScreen(isTimeout = false) {
    const endContent = document.getElementById('end-content');
    
    // Convert trust to text
    let trustLevel;
    if (gameState.trust < 20) trustLevel = "sehr niedrig";
    else if (gameState.trust < 40) trustLevel = "niedrig";
    else if (gameState.trust < 60) trustLevel = "mittel";
    else if (gameState.trust < 80) trustLevel = "hoch";
    else trustLevel = "sehr hoch";
    
    if (isTimeout) {
        // Timeout Game Over
        endContent.className = 'end-content game-over';
        endContent.innerHTML = `
            <h1>ZEIT ABGELAUFEN</h1>
            
            <p class="trust-level">Vertrauen: 0 %</p>
            
            <div class="questions">
                <p>Lukas wartet nicht mehr auf eine Antwort.</p>
                <p>Das Schweigen hat sein Vertrauen zerstört.</p>
            </div>
            
            <p class="final-note">GAME OVER</p>
        `;
    } else if (gameState.trust < 20) {
        // Game Over
        endContent.className = 'end-content game-over';
        endContent.innerHTML = `
            <h1>KAPITEL 1 - DER VERGESSENE TERMIN</h1>
            
            <p class="trust-level">Vertrauen: ${trustLevel}</p>
            
            <div class="questions">
                <p>Verbindung getrennt.</p>
                <p>Lukas hat ARIA deaktiviert.</p>
            </div>
            
            <p class="final-note">ENDE DES PROTOTYPS</p>
        `;
    } else {
        // Chapter End - Success
        endContent.className = 'end-content chapter-end';
        endContent.innerHTML = `
            <h1>KAPITEL 1 - DER VERGESSENE TERMIN</h1>
            
            <p class="trust-level">Vertrauen: ${trustLevel}</p>
            
            <div class="questions">
                <p>Wer ist M.W.?</p>
                <p>Warum erinnert sich Lukas nicht?</p>
                <p>Und warum wurde der Termin automatisch eingetragen?</p>
            </div>
            
            <p class="final-note">ENDE DES PROTOTYPS</p>
        `;
    }
    
    endScreen.classList.add('active');
}

// Initialize game
async function initGame() {
    console.log('Game starting...');
    
    // Initial message
    await sleep(500);
    await addMessage('ARIA, war heute irgendwas Wichtiges? Ich habe das Gefühl, ich habe etwas vergessen …', 'user', true);
    
    await sleep(500);
    
    // Display first choices
    displayChoices(gameData.interactions[0].choices);
}

// Start the game when page loads
window.addEventListener('load', initGame);

