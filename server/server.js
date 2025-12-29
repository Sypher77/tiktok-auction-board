const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ========================================
// GLOBAL STATE - SINGLE SOURCE OF TRUTH
// ========================================
const globalState = {
    // Timer state
    timerRemaining: 60,  // seconds
    timerTotal: 60,
    timerRunning: false,
    timerFrozen: false,
    timerInterval: null,

    // Leaderboard state
    users: new Map(),  // userId -> {userId, username, avatar, coins, rank}

    // TikTok connection
    tiktokConnected: false,
    tiktokUsername: null
};

// TikTok Live Connection
let tiktokConnection = null;

// servir les fichiers du dossier parent (index.html + admin.html)
app.use(express.static(path.join(__dirname, '..')));

// ========================================
// TIMER LOGIC (SERVER-SIDE)
// ========================================

function startTimer() {
    if (globalState.timerFrozen) {
        console.log('⚠️ Timer is frozen, cannot start');
        return;
    }

    if (globalState.timerRunning) {
        console.log('⚠️ Timer already running');
        return;
    }

    if (globalState.timerRemaining <= 0) {
        globalState.timerRemaining = globalState.timerTotal;
    }

    globalState.timerRunning = true;
    console.log('▶️ Timer started');

    globalState.timerInterval = setInterval(() => {
        globalState.timerRemaining--;

        // Broadcast timer update to all clients
        broadcastTimerUpdate();

        if (globalState.timerRemaining <= 0) {
            freezeTimer();
        }
    }, 1000);

    // Send immediate update to all clients
    broadcastTimerUpdate();
}

function pauseTimer() {
    if (!globalState.timerRunning) {
        return;
    }

    globalState.timerRunning = false;
    clearInterval(globalState.timerInterval);
    globalState.timerInterval = null;
    console.log('⏸️ Timer paused');

    broadcastTimerUpdate();
}

function resetTimer() {
    pauseTimer();
    globalState.timerRemaining = globalState.timerTotal;
    globalState.timerFrozen = false;
    console.log('🔄 Timer reset');

    broadcastTimerUpdate();
}

function freezeTimer() {
    pauseTimer();
    globalState.timerFrozen = true;
    console.log('❄️ Timer frozen at 0:00');

    broadcastTimerUpdate();
    logFinalRankings();
}

function setTimerDuration(seconds) {
    if (globalState.timerRunning) {
        pauseTimer();
    }

    globalState.timerTotal = seconds;
    globalState.timerRemaining = seconds;
    globalState.timerFrozen = false;
    console.log(`⏱️ Timer set to ${seconds}s`);

    broadcastTimerUpdate();
}

// ========================================
// LEADERBOARD LOGIC
// ========================================

function handleGift(userInfo, coins) {
    if (globalState.timerFrozen) {
        console.log('⚠️ Timer frozen, ignoring gift');
        return;
    }

    const userId = userInfo.userId || userInfo.uniqueId;

    if (globalState.users.has(userId)) {
        // Update existing user
        const user = globalState.users.get(userId);
        user.coins += coins;
        console.log(`💰 ${user.username}: +${coins} coins (total: ${user.coins})`);
    } else {
        // Add new user
        globalState.users.set(userId, {
            userId: userId,
            username: userInfo.username || userInfo.uniqueId,
            avatar: userInfo.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            coins: coins,
            rank: 0
        });
        console.log(`✨ New user: ${userInfo.username || userInfo.uniqueId} with ${coins} coins`);
    }

    updateRankings();
    broadcastLeaderboardUpdate();
}

function updateRankings() {
    const sortedUsers = Array.from(globalState.users.values())
        .sort((a, b) => b.coins - a.coins);

    sortedUsers.forEach((user, index) => {
        user.rank = index + 1;
    });
}

function logFinalRankings() {
    console.log('🏆 FINAL RANKINGS:');
    const rankings = Array.from(globalState.users.values())
        .sort((a, b) => b.coins - a.coins);

    rankings.forEach((user, index) => {
        console.log(`  #${index + 1} - ${user.username}: ${user.coins} coins`);
    });
}

function clearLeaderboard() {
    globalState.users.clear();
    console.log('🗑️ Leaderboard cleared');
    broadcastLeaderboardUpdate();
}

// ========================================
// WEBSOCKET BROADCASTING
// ========================================

function broadcastTimerUpdate() {
    const message = {
        type: 'timer:update',
        timerRemaining: globalState.timerRemaining,
        timerTotal: globalState.timerTotal,
        timerRunning: globalState.timerRunning,
        timerFrozen: globalState.timerFrozen
    };

    broadcast(message);
}

function broadcastLeaderboardUpdate() {
    const users = Array.from(globalState.users.values())
        .sort((a, b) => b.coins - a.coins);

    const message = {
        type: 'leaderboard:update',
        users: users
    };

    broadcast(message);
}

function broadcast(message) {
    const payload = JSON.stringify(message);
    let sentCount = 0;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
            sentCount++;
        }
    });

    // console.log(`📡 Broadcast: ${message.type} to ${sentCount} client(s)`);
}

function sendCompleteState(ws) {
    const users = Array.from(globalState.users.values())
        .sort((a, b) => b.coins - a.coins);

    const message = {
        type: 'state:init',
        timerRemaining: globalState.timerRemaining,
        timerTotal: globalState.timerTotal,
        timerRunning: globalState.timerRunning,
        timerFrozen: globalState.timerFrozen,
        users: users,
        tiktokConnected: globalState.tiktokConnected
    };

    ws.send(JSON.stringify(message));
    console.log('📤 Sent complete state to new client');
}

// ========================================
// WEBSOCKET CONNECTION HANDLING
// ========================================

wss.on('connection', (ws) => {
    console.log('✅ Client connected');

    // Send complete state to new client
    sendCompleteState(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleClientMessage(ws, data);
        } catch (error) {
            console.error('❌ Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('👋 Client disconnected');
    });
});

function handleClientMessage(ws, data) {
    console.log(`📥 Received: ${data.type}`);

    switch (data.type) {
        // Timer commands
        case 'timer:start':
            startTimer();
            break;

        case 'timer:pause':
            pauseTimer();
            break;

        case 'timer:reset':
            resetTimer();
            break;

        case 'timer:setDuration':
            if (data.seconds && data.seconds > 0) {
                setTimerDuration(data.seconds);
            }
            break;

        // TikTok connection - SERVER-SIDE ONLY
        case 'connect':
            if (data.username) {
                connectToTikTokLive(data.username, ws);
            }
            break;

        // Gift simulation (for testing)
        case 'gift':
            handleGift(data.user, data.giftCoins);
            break;

        // Leaderboard management
        case 'leaderboard:clear':
            clearLeaderboard();
            break;

        default:
            console.log(`⚠️ Unknown message type: ${data.type}`);
    }
}

// ========================================
// TIKTOK LIVE CONNECTION (SERVER-SIDE)
// ========================================

function connectToTikTokLive(username, ws) {
    console.log(`🔗 Connecting to TikTok Live: @${username}`);

    // Close existing connection if any
    if (tiktokConnection) {
        console.log('🔌 Closing previous TikTok connection');
        tiktokConnection.disconnect();
        tiktokConnection = null;
    }

    try {
        // Create new TikTok Live connection
        tiktokConnection = new WebcastPushConnection(username, {
            processInitialData: true,
            enableExtendedGiftInfo: true,
            enableWebsocketUpgrade: true,
            requestPollingIntervalMs: 1000,
        });

        // Connection established
        tiktokConnection.connect().then(state => {
            console.log(`✅ Connected to TikTok Live: @${state.roomInfo.owner.uniqueId}`);

            globalState.tiktokConnected = true;
            globalState.tiktokUsername = username;

            // Send confirmation to all clients
            broadcast({
                type: 'connected',
                username: username
            });

        }).catch(err => {
            console.error('❌ Failed to connect to TikTok Live:', err);

            globalState.tiktokConnected = false;
            globalState.tiktokUsername = null;

            // Send error to requesting client
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: `Impossible de se connecter au live de @${username}`
                }));
            }
        });

        // Listen for gifts
        tiktokConnection.on('gift', data => {
            console.log(`🎁 Gift received: ${data.giftName} x${data.repeatCount} from @${data.uniqueId}`);

            // Calculate coins value
            const giftCoins = (data.diamondCount || 1) * (data.repeatCount || 1);

            const userInfo = {
                userId: data.userId,
                uniqueId: data.uniqueId,
                username: data.nickname || data.uniqueId,
                profilePictureUrl: data.profilePictureUrl
            };

            // Update server-side leaderboard
            handleGift(userInfo, giftCoins);
        });

        // Listen for connection state changes
        tiktokConnection.on('disconnected', () => {
            console.log('🔌 TikTok connection disconnected');
            globalState.tiktokConnected = false;

            broadcast({
                type: 'tiktok:disconnected'
            });
        });

        // Listen for errors
        tiktokConnection.on('error', err => {
            console.error('❌ TikTok connection error:', err);
        });

    } catch (error) {
        console.error('❌ Error creating TikTok connection:', error);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Erreur lors de la création de la connexion TikTok'
            }));
        }
    }
}

// ========================================
// SERVER STARTUP
// ========================================

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 ========================================');
    console.log('🚀 TikTok Auction Board Server');
    console.log('🚀 ========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🚀 Local: http://localhost:${PORT}`);
    console.log('🚀 ========================================');
    console.log('');
    console.log('📊 Global State initialized:');
    console.log(`   Timer: ${globalState.timerTotal}s`);
    console.log(`   Users: ${globalState.users.size}`);
    console.log('');
});
