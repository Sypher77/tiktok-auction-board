/**
 * TikTok Live Auction Board - Main Application
 * Handles UI, timer logic, and WebSocket connection to TikTok server
 */

class AuctionBoard {
    constructor() {
        // Configuration
        this.config = {
            wsUrl: 'ws://localhost:8080',
            maxDisplay: 5,
            autoStart: false,
            timerDuration: 60, // seconds
        };

        // State
        this.state = {
            users: new Map(), // userId -> {username, avatar, coins, rank}
            timerRemaining: 0,
            timerTotal: 60,
            timerRunning: false,
            timerFrozen: false,
            connected: false,
            timerInterval: null,
        };

        // WebSocket
        this.ws = null;

        // DOM Elements
        this.elements = {
            // Control Panel
            tiktokUsername: document.getElementById('tiktokUsername'),
            connectBtn: document.getElementById('connectBtn'),
            connectionStatus: document.getElementById('connectionStatus'),
            statusText: document.querySelector('.status-text'),
            
            // Timer Controls
            presetBtns: document.querySelectorAll('.preset-btn'),
            customTimer: document.getElementById('customTimer'),
            setCustomTimer: document.getElementById('setCustomTimer'),
            startTimer: document.getElementById('startTimer'),
            pauseTimer: document.getElementById('pauseTimer'),
            resetTimer: document.getElementById('resetTimer'),
            
            // Options
            autoStart: document.getElementById('autoStart'),
            maxDisplay: document.getElementById('maxDisplay'),
            toggleOBS: document.getElementById('toggleOBS'),
            
            // Overlay
            timerDisplay: document.getElementById('timerDisplay'),
            leaderboard: document.getElementById('leaderboard'),
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTimerDisplay();
        this.checkURLParams();
        
        // Load saved preferences
        this.loadPreferences();
    }

    setupEventListeners() {
        // Connection
        this.elements.connectBtn.addEventListener('click', () => this.connectToTikTok());

        // Timer presets
        this.elements.presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seconds = parseInt(e.target.dataset.seconds);
                this.setTimerDuration(seconds);
                this.updatePresetButtons(e.target);
            });
        });

        // Custom timer
        this.elements.setCustomTimer.addEventListener('click', () => {
            const seconds = parseInt(this.elements.customTimer.value);
            if (seconds && seconds > 0) {
                this.setTimerDuration(seconds);
                this.updatePresetButtons(null);
            }
        });

        // Timer controls
        this.elements.startTimer.addEventListener('click', () => this.startTimer());
        this.elements.pauseTimer.addEventListener('click', () => this.pauseTimer());
        this.elements.resetTimer.addEventListener('click', () => this.resetTimer());

        // Options
        this.elements.autoStart.addEventListener('change', (e) => {
            this.config.autoStart = e.target.checked;
            this.savePreferences();
        });

        this.elements.maxDisplay.addEventListener('change', (e) => {
            this.config.maxDisplay = parseInt(e.target.value) || 5;
            this.renderLeaderboard();
            this.savePreferences();
        });

        // OBS Mode Toggle
        this.elements.toggleOBS.addEventListener('click', () => {
            document.body.classList.toggle('obs-mode');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (this.state.timerRunning) {
                    this.pauseTimer();
                } else if (!this.state.timerFrozen) {
                    this.startTimer();
                }
            }
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.resetTimer();
            }
        });
    }

    checkURLParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('obs') === 'true') {
            document.body.classList.add('obs-mode');
        }
    }

    // ========================================
    // WebSocket Connection
    // ========================================

    connectToTikTok() {
        const username = this.elements.tiktokUsername.value.trim().replace('@', '');
        
        if (!username) {
            alert('Veuillez entrer un nom d\'utilisateur TikTok');
            return;
        }

        this.updateConnectionStatus('connecting');
        this.elements.connectBtn.disabled = true;
        this.elements.connectBtn.textContent = 'Connexion...';

        // Close existing connection
        if (this.ws) {
            this.ws.close();
        }

        // Connect to WebSocket server
        try {
            this.ws = new WebSocket(this.config.wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                // Send username to server
                this.ws.send(JSON.stringify({
                    type: 'connect',
                    username: username
                }));
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('disconnected');
                this.elements.connectBtn.disabled = false;
                this.elements.connectBtn.textContent = 'Se connecter';
                alert('Erreur de connexion. Vérifiez que le serveur est démarré.');
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.updateConnectionStatus('disconnected');
                this.elements.connectBtn.disabled = false;
                this.elements.connectBtn.textContent = 'Se connecter';
                this.state.connected = false;
            };

        } catch (error) {
            console.error('Connection error:', error);
            this.updateConnectionStatus('disconnected');
            this.elements.connectBtn.disabled = false;
            this.elements.connectBtn.textContent = 'Se connecter';
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'connected':
                this.updateConnectionStatus('connected');
                this.elements.connectBtn.textContent = 'Connecté ✓';
                this.state.connected = true;
                
                // Auto-start timer if enabled
                if (this.config.autoStart && !this.state.timerRunning) {
                    setTimeout(() => this.startTimer(), 1000);
                }
                break;

            case 'gift':
                this.handleGift(data.user, data.giftCoins);
                break;

            case 'error':
                console.error('Server error:', data.message);
                alert('Erreur: ' + data.message);
                break;

            default:
                console.log('Unknown message type:', data.type);
        }
    }

    updateConnectionStatus(status) {
        this.elements.connectionStatus.className = `status ${status}`;
        
        const statusTexts = {
            disconnected: 'Déconnecté',
            connecting: 'Connexion...',
            connected: 'Connecté au live'
        };
        
        this.elements.statusText.textContent = statusTexts[status] || status;
    }

    // ========================================
    // Gift Handling
    // ========================================

    handleGift(userInfo, coins) {
        // Don't update if timer is frozen
        if (this.state.timerFrozen) {
            return;
        }

        const userId = userInfo.userId || userInfo.uniqueId;
        
        if (this.state.users.has(userId)) {
            // Update existing user
            const user = this.state.users.get(userId);
            user.coins += coins;
        } else {
            // Add new user
            this.state.users.set(userId, {
                userId: userId,
                username: userInfo.username || userInfo.uniqueId,
                avatar: userInfo.profilePictureUrl || this.getDefaultAvatar(),
                coins: coins,
                rank: 0
            });
        }

        // Update rankings and render
        this.updateRankings();
        this.renderLeaderboard();
    }

    getDefaultAvatar() {
        // Generate a colorful default avatar using DiceBear API
        const seed = Math.random().toString(36).substring(7);
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    }

    updateRankings() {
        // Sort users by coins (descending)
        const sortedUsers = Array.from(this.state.users.values())
            .sort((a, b) => b.coins - a.coins);

        // Update ranks
        sortedUsers.forEach((user, index) => {
            user.rank = index + 1;
        });
    }

    // ========================================
    // Timer Logic
    // ========================================

    setTimerDuration(seconds) {
        if (this.state.timerRunning) {
            if (!confirm('Le timer est en cours. Voulez-vous le réinitialiser ?')) {
                return;
            }
            this.pauseTimer();
        }

        this.config.timerDuration = seconds;
        this.state.timerTotal = seconds;
        this.state.timerRemaining = seconds;
        this.state.timerFrozen = false;
        this.updateTimerDisplay();
    }

    startTimer() {
        if (this.state.timerFrozen) {
            alert('Le timer est gelé. Cliquez sur Reset pour recommencer.');
            return;
        }

        if (this.state.timerRemaining <= 0) {
            this.state.timerRemaining = this.state.timerTotal;
        }

        this.state.timerRunning = true;
        this.elements.startTimer.disabled = true;
        this.elements.pauseTimer.disabled = false;

        this.state.timerInterval = setInterval(() => {
            this.state.timerRemaining--;
            this.updateTimerDisplay();

            if (this.state.timerRemaining <= 0) {
                this.freezeTimer();
            }
        }, 1000);
    }

    pauseTimer() {
        this.state.timerRunning = false;
        clearInterval(this.state.timerInterval);
        this.elements.startTimer.disabled = false;
        this.elements.pauseTimer.disabled = true;
    }

    resetTimer() {
        this.pauseTimer();
        this.state.timerRemaining = this.state.timerTotal;
        this.state.timerFrozen = false;
        this.elements.timerDisplay.classList.remove('frozen');
        
        // Clear all users data
        if (confirm('Voulez-vous également effacer le classement ?')) {
            this.state.users.clear();
            this.renderLeaderboard();
        }
        
        this.updateTimerDisplay();
    }

    freezeTimer() {
        this.pauseTimer();
        this.state.timerFrozen = true;
        this.elements.timerDisplay.classList.add('frozen');
        this.elements.startTimer.disabled = true;
        
        console.log('⏱️ Timer gelé ! Classement final :');
        this.logFinalRankings();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.state.timerRemaining / 60);
        const seconds = this.state.timerRemaining % 60;
        const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.elements.timerDisplay.textContent = display;
    }

    logFinalRankings() {
        const rankings = Array.from(this.state.users.values())
            .sort((a, b) => b.coins - a.coins);
        
        rankings.forEach((user, index) => {
            console.log(`#${index + 1} - ${user.username}: ${user.coins} pièces`);
        });
    }

    updatePresetButtons(activeBtn) {
        this.elements.presetBtns.forEach(btn => btn.classList.remove('active'));
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // ========================================
    // Leaderboard Rendering
    // ========================================

    renderLeaderboard() {
        const sortedUsers = Array.from(this.state.users.values())
            .sort((a, b) => b.coins - a.coins)
            .slice(0, this.config.maxDisplay);

        // Clear existing cards
        this.elements.leaderboard.innerHTML = '';

        // Render new cards
        sortedUsers.forEach((user, index) => {
            const card = this.createLeaderboardCard(user, index + 1);
            this.elements.leaderboard.appendChild(card);
        });

        // Show empty state if no users
        if (sortedUsers.length === 0) {
            this.elements.leaderboard.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">En attente de donations...</p>
                    <p style="font-size: 0.9rem;">Le classement s'affichera ici</p>
                </div>
            `;
        }
    }

    createLeaderboardCard(user, rank) {
        const card = document.createElement('div');
        card.className = `leaderboard-card rank-${rank <= 3 ? rank : 'other'}`;
        
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
        
        card.innerHTML = `
            <div class="rank-badge ${rankClass}">
                ${rank <= 3 ? '' : rank}
            </div>
            <img src="${user.avatar}" alt="${user.username}" class="user-avatar" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}'">
            <div class="user-info">
                <div class="username">${this.escapeHtml(user.username)}</div>
                <div class="coin-count">
                    <span class="coin-icon">🪙</span>
                    <span>${user.coins}</span>
                </div>
            </div>
        `;

        return card;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // Preferences
    // ========================================

    savePreferences() {
        const prefs = {
            autoStart: this.config.autoStart,
            maxDisplay: this.config.maxDisplay,
            timerDuration: this.config.timerDuration,
        };
        localStorage.setItem('auctionBoardPrefs', JSON.stringify(prefs));
    }

    loadPreferences() {
        const saved = localStorage.getItem('auctionBoardPrefs');
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                this.config.autoStart = prefs.autoStart || false;
                this.config.maxDisplay = prefs.maxDisplay || 5;
                this.config.timerDuration = prefs.timerDuration || 60;

                // Update UI
                this.elements.autoStart.checked = this.config.autoStart;
                this.elements.maxDisplay.value = this.config.maxDisplay;
                this.state.timerTotal = this.config.timerDuration;
                this.state.timerRemaining = this.config.timerDuration;
                this.updateTimerDisplay();
            } catch (e) {
                console.error('Error loading preferences:', e);
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.auctionBoard = new AuctionBoard();
    console.log('🎯 TikTok Auction Board initialized');
    console.log('💡 Tip: Press SPACE to start/pause timer, CTRL+R to reset');
});
