/**
 * TikTok Live Auction Board - Main Application
 * WebSocket-driven UI - All state managed server-side
 */

class AuctionBoard {
    constructor() {
        // Configuration
        this.config = {
            wsUrl: this.getWebSocketUrl(),
            maxDisplay: 5,
            autoStart: false,
        };

        // Local UI state only (NO business logic state)
        this.state = {
            connected: false,
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
        this.checkURLParams();
        this.loadPreferences();

        // Auto-connect WebSocket on page load
        this.connectWebSocket();
    }

    getWebSocketUrl() {
        // Detect if running on Render (HTTPS) or localhost
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;

        // If localhost, use port 8080
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
            return 'ws://localhost:8080';
        }

        // Otherwise use same host (Render deployment)
        return `${protocol}//${host}`;
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

        // Timer controls - NOW SEND WEBSOCKET COMMANDS
        this.elements.startTimer.addEventListener('click', () => this.sendCommand('timer:start'));
        this.elements.pauseTimer.addEventListener('click', () => this.sendCommand('timer:pause'));
        this.elements.resetTimer.addEventListener('click', () => {
            if (confirm('Voulez-vous réinitialiser le timer ?')) {
                this.sendCommand('timer:reset');
            }
        });

        // Options
        this.elements.autoStart.addEventListener('change', (e) => {
            this.config.autoStart = e.target.checked;
            this.savePreferences();
        });

        this.elements.maxDisplay.addEventListener('change', (e) => {
            this.config.maxDisplay = parseInt(e.target.value) || 5;
            this.renderLeaderboard([]); // Re-render with current data
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
                // Toggle timer (send command to server)
                this.sendCommand('timer:start'); // Server will ignore if already running
            }
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.sendCommand('timer:reset');
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

    connectWebSocket() {
        console.log(`🔌 Connecting to WebSocket: ${this.config.wsUrl}`);

        try {
            this.ws = new WebSocket(this.config.wsUrl);

            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.state.connected = true;
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected. Reconnecting in 3s...');
                this.state.connected = false;

                // Auto-reconnect
                setTimeout(() => this.connectWebSocket(), 3000);
            };

        } catch (error) {
            console.error('❌ Connection error:', error);
            setTimeout(() => this.connectWebSocket(), 3000);
        }
    }

    sendCommand(type, data = {}) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ WebSocket not connected');
            return;
        }

        const message = { type, ...data };
        this.ws.send(JSON.stringify(message));
        console.log(`📤 Sent: ${type}`);
    }

    handleWebSocketMessage(data) {
        console.log(`📥 Received: ${data.type}`);

        switch (data.type) {
            case 'state:init':
                // Complete state received (new connection)
                this.handleStateInit(data);
                break;

            case 'timer:update':
                // Timer state changed
                this.handleTimerUpdate(data);
                break;

            case 'leaderboard:update':
                // Leaderboard changed
                this.handleLeaderboardUpdate(data);
                break;

            case 'connected':
                // TikTok connection confirmed
                this.updateConnectionStatus('connected');
                this.elements.connectBtn.textContent = 'Connecté ✓';
                break;

            case 'error':
                console.error('Server error:', data.message);
                alert('Erreur: ' + data.message);
                break;

            default:
                console.log('Unknown message type:', data.type);
        }
    }

    // ========================================
    // State Update Handlers
    // ========================================

    handleStateInit(data) {
        console.log('📊 Received complete state from server');

        // Update timer display
        this.updateTimerDisplay(data.timerRemaining, data.timerTotal, data.timerRunning, data.timerFrozen);

        // Update leaderboard
        this.renderLeaderboard(data.users || []);

        // Update connection status
        if (data.tiktokConnected) {
            this.updateConnectionStatus('connected');
        }
    }

    handleTimerUpdate(data) {
        this.updateTimerDisplay(data.timerRemaining, data.timerTotal, data.timerRunning, data.timerFrozen);
    }

    handleLeaderboardUpdate(data) {
        this.renderLeaderboard(data.users || []);
    }

    updateTimerDisplay(remaining, total, running, frozen) {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.elements.timerDisplay.textContent = display;

        // Update timer classes
        if (frozen) {
            this.elements.timerDisplay.classList.add('frozen');
        } else {
            this.elements.timerDisplay.classList.remove('frozen');
        }

        // Update button states
        this.elements.startTimer.disabled = running || frozen;
        this.elements.pauseTimer.disabled = !running;
    }

    // ========================================
    // TikTok Connection (keeps existing logic)
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

        // Send connection request to server
        this.sendCommand('connect', { username: username });

        // Auto-start timer if enabled
        if (this.config.autoStart) {
            setTimeout(() => this.sendCommand('timer:start'), 1000);
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
    // Timer Controls (now sends commands to server)
    // ========================================

    setTimerDuration(seconds) {
        this.sendCommand('timer:setDuration', { seconds: seconds });
    }

    updatePresetButtons(activeBtn) {
        this.elements.presetBtns.forEach(btn => btn.classList.remove('active'));
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // ========================================
    // Leaderboard Rendering (reads from server data)
    // ========================================

    renderLeaderboard(users) {
        const displayUsers = users.slice(0, this.config.maxDisplay);

        // Clear existing cards
        this.elements.leaderboard.innerHTML = '';

        // Render new cards
        displayUsers.forEach((user, index) => {
            const card = this.createLeaderboardCard(user, index + 1);
            this.elements.leaderboard.appendChild(card);
        });

        // Show empty state if no users
        if (displayUsers.length === 0) {
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

                // Update UI
                this.elements.autoStart.checked = this.config.autoStart;
                this.elements.maxDisplay.value = this.config.maxDisplay;
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
    console.log('💡 WebSocket-driven mode: all state managed server-side');
});
