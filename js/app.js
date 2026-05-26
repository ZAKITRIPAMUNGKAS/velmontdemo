const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
// Elements
const body = document.body;
const cursorGlow = document.querySelector('.cursor-glow');
const interactiveStage = document.getElementById('interactive-stage');
const character = document.getElementById('character');
const charImg = document.getElementById('char-img');
const charBubble = document.getElementById('char-bubble');
const cashierZone = document.getElementById('cashier-zone');
const cashierShortcutBtn = document.getElementById('cashier-shortcut-btn');

// Info Panel Elements (Whiteboard)
const infoPeekingChar = document.getElementById('info-peeking-char');
const infoWhiteboardContainer = document.getElementById('info-whiteboard-container');
const whiteboardCloseBtn = document.getElementById('whiteboard-close-btn');

// State variables
let lastMouseX = window.innerWidth / 2;
let targetCharacterX = 50; // percentage (10 to 68)
let currentCharacterX = 50; // percentage
let isMoving = false;
let bubbleTimeout;

// Character Assets Paths
const CHAR_IMGS = {
    stand: basePath + 'assets/karakter/hay.png',
    walkLeft: basePath + 'assets/karakter/lefttwalk.png',
    walkRight: basePath + 'assets/karakter/rightwalk.png',
    noted: basePath + 'assets/karakter/noted.png'
};

// 1. Mouse coordinates & Custom Cursor Glow
document.addEventListener('mousemove', (e) => {
    // Custom cursor glow position
    if (cursorGlow) {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    }

    // Track horizontal position relative to screen for character movement
    if (interactiveStage) {
        const stageRect = interactiveStage.getBoundingClientRect();
        
        // Calculate percentage position of cursor on screen
        let relativeX = ((e.clientX - stageRect.left) / stageRect.width) * 100;
        // Clamp between 10% (cash register on left) and 68% (lockers on right)
        targetCharacterX = Math.max(10, Math.min(68, relativeX));
    }
});

// Smooth easing animation loop for character following cursor
function animateCharacter() {
    // Easing formula: current = current + (target - current) * easeRate
    const easeRate = 0.08;
    const diff = targetCharacterX - currentCharacterX;
    
    currentCharacterX += diff * easeRate;
    character.style.left = `${currentCharacterX}%`;

    // Cashier zone range check: if on the far left near the register
    if (currentCharacterX < 21) {
        charImg.src = CHAR_IMGS.noted;
        showBubble("Mencatat pesanan... Silakan pilih menu Anda!");
    } else {
        // Check if character is moving based on distance to target
        if (Math.abs(diff) > 0.8) {
            if (diff > 0) {
                charImg.src = CHAR_IMGS.walkRight;
            } else {
                charImg.src = CHAR_IMGS.walkLeft;
            }
            hideBubble();
        } else {
            // Standing idle
            charImg.src = CHAR_IMGS.stand;
        }
    }

    requestAnimationFrame(animateCharacter);
}

// Start the animation loop
animateCharacter();

// Cashier Shortcut Button
if (cashierShortcutBtn) {
    cashierShortcutBtn.addEventListener('click', () => {
        // Trigger auto-move to Cashier Zone (14%)
        targetCharacterX = 14;
    });
}

// Bubble helper functions
function showBubble(text) {
    clearTimeout(bubbleTimeout);
    charBubble.textContent = text;
    charBubble.classList.add('visible');
}

function hideBubble() {
    bubbleTimeout = setTimeout(() => {
        charBubble.classList.remove('visible');
    }, 1500);
}

// 3. Info Toggle Whiteboard Sliding Animation
const openInfo = () => {
    // Hide the peeking character
    infoPeekingChar.classList.add('hidden');
    
    // Slide in the whiteboard
    infoWhiteboardContainer.classList.add('active');
};

const closeInfo = () => {
    // Hide the whiteboard
    infoWhiteboardContainer.classList.remove('active');
    
    // Show the peeking character again
    infoPeekingChar.classList.remove('hidden');
};

const peekingTrigger = document.getElementById('peeking-trigger');
if (peekingTrigger) {
    peekingTrigger.addEventListener('click', openInfo);
}
if (whiteboardCloseBtn) {
    whiteboardCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeInfo();
    });
}

// Click on whiteboard image (the pushing character) to close/hide it again
const whiteboardBgImg = document.querySelector('.whiteboard-bg-img');
if (whiteboardBgImg) {
    whiteboardBgImg.addEventListener('click', closeInfo);
}

// Stop click propagation inside the text whiteboard area to prevent closing it
const whiteboardOverlayContent = document.querySelector('.whiteboard-overlay-content');
if (whiteboardOverlayContent) {
    whiteboardOverlayContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// 4. Interactive Object Triggers Clicking Actions
const triggerKasir = document.querySelector('#obj-kasir .object-trigger');
const triggerBell = document.querySelector('#obj-bell .object-trigger');
const triggerMenu = document.querySelector('#obj-menu .object-trigger');
const triggerBooking = document.querySelector('#obj-booking .object-trigger');
const triggerClockin = document.querySelector('#obj-clockin .object-trigger');

if (triggerKasir) {
    triggerKasir.addEventListener('click', () => {
        window.location.href = basePath + 'pages/booking.html';
    });
}

const bellSound = new Audio(basePath + 'assets/freesound_community-door-bell-sound-99933.mp3');

if (triggerBell) {
    triggerBell.addEventListener('click', () => {
        targetCharacterX = 53; // Walk directly to the bell
        
        // Play bell SFX
        bellSound.currentTime = 0; // Reset audio to start for overlapping clicks
        bellSound.play().catch(err => {
            console.log("Audio play prevented by browser autocomplete/interaction policy:", err);
        });

        setTimeout(() => {
            showBubble("Ting! *Bel Berdering* Ada yang bisa saya bantu?");
        }, 600);
    });
}

if (triggerMenu) {
    triggerMenu.addEventListener('click', () => {
        window.location.href = basePath + 'pages/menu.html';
    });
}
if (triggerBooking) {
    triggerBooking.addEventListener('click', () => {
        window.location.href = basePath + 'pages/booking-list.html';
    });
}
if (triggerClockin) {
    triggerClockin.addEventListener('click', () => {
        window.location.href = basePath + 'pages/login.html';
    });
}

// Smooth Scroll Helper
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

// 5. A4 Poster Zoom Interaction for Multiple Posters (Text + JPG)
const miniPosters = document.querySelectorAll('.a4-poster:not(.large-version)');
const posterZoomOverlay = document.getElementById('poster-zoom-overlay');
const zoomedPosterContainer = document.querySelector('.zoomed-poster-container');
const closeZoomBtn = document.querySelector('.close-zoom-btn');

miniPosters.forEach(poster => {
    poster.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid event bubbling
        
        // Extract content and class metadata from the clicked poster
        const contentHtml = poster.innerHTML;
        const targetZoomedPoster = zoomedPosterContainer.querySelector('.a4-poster.large-version');
        
        if (targetZoomedPoster) {
            // Apply matching classes (e.g. including .image-poster if it's the JPG) and copy HTML content
            targetZoomedPoster.className = poster.className + ' large-version';
            targetZoomedPoster.innerHTML = contentHtml;
        }
        
        // Slide in/Fade in modal
        posterZoomOverlay.classList.add('active');
    });
});

if (posterZoomOverlay) {
    posterZoomOverlay.addEventListener('click', () => {
        posterZoomOverlay.classList.remove('active');
    });
}

if (closeZoomBtn) {
    closeZoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        posterZoomOverlay.classList.remove('active');
    });
}

// 6. Live Clock Logic for Header
function updateLiveClock() {
    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
        clockElement.textContent = timeString;
    }
}
setInterval(updateLiveClock, 1000);
updateLiveClock();



