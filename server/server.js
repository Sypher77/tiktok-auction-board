/**
 * TikTok Live Auction Server
 * Serves the overlay via HTTP and forwards TikTok Live events via WebSocket
 */

const express = require('express');
const http = require('http');
const path = require('path');
const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');

class TikTokAuctionServer {
    constructor(port = 8080) {
        this.port = port;
        this.tiktokConnection = null;
        this.wsServer = null;
        this.clients = new Set();
        this.currentUsername = null;

        // Statistics
        this.stats = {
            totalGifts: 0,
            totalCoins: 0,
            connectedClients: 0
        };

        this.init();
    }

    init() {
        // Create Express app
        const app = express();

        // Serve static files from parent directory
        const publicDir = path.join(__dirname, '..');
        app.use(express.static(publicDir));

        // Default route serves index.html
        app.get('/', (req, res) => {
            res.sendFile(path.join(publicDir, 'index.html'));
        });

        // Create HTTP server
        const httpServer = http.createServer(app);

        // Attach WebSocket server to HTTP server
        this.wsServer = new WebSocket.Server({ server: httpServer });

        this.wsServer.on('connection', (ws) => {
            console.log('✅ New client connected');
            this.clients.add(ws);
            this.stats.connectedClients = this.clients.size;

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleClientMessage(ws, data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            ws.on('close', () => {
                console.log('❌ Client disconnected');
                this.clients.delete(ws);
                this.stats.connectedClients = this.clients.size;
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        });

        // Start HTTP server
        httpServer.listen(this.port, '0.0.0.0', () => {
            console.log(`🚀 Server running on http://0.0.0.0:${this.port}`);
            console.log(`📡 WebSocket available on ws://0.0.0.0:${this.port}`);
            console.log(`💡 Local: http://localhost:${this.port}`);
            console.log(`\n💡 Open in browser: http://localhost:${this.port}`);
            console.log('📱 Waiting for connections...\n');
        });
    }


    handleClientMessage(ws, data) {
        switch (data.type) {
            case 'connect':
                this.connectToTikTok(ws, data.username);
                break;

            case 'disconnect':
                this.disconnectFromTikTok();
                break;

            default:
                console.log('Unknown message type:', data.type);
        }
    }

    async connectToTikTok(ws, username) {
        if (!username) {
            this.sendToClient(ws, {
                type: 'error',
                message: 'Username is required'
            });
            return;
        }

        // Disconnect existing connection
        if (this.tiktokConnection) {
            await this.disconnectFromTikTok();
        }

        console.log(`\n🔗 Connecting to TikTok: @${username}`);
        this.currentUsername = username;

        try {
            // Create TikTok connection
            this.tiktokConnection = new WebcastPushConnection(username);

            // Event: Connected
            this.tiktokConnection.on('connected', () => {
                console.log(`✅ Successfully connected to @${username}'s live stream`);
                this.broadcast({
                    type: 'connected',
                    username: username
                });
            });

            // Event: Disconnected
            this.tiktokConnection.on('disconnected', () => {
                console.log('❌ Disconnected from TikTok live');
                this.broadcast({
                    type: 'disconnected'
                });
            });

            // Event: Gift (THIS IS THE MAIN EVENT)
            this.tiktokConnection.on('gift', (data) => {
                this.handleGift(data);
            });

            // Event: Like
            this.tiktokConnection.on('like', (data) => {
                // Optional: Log likes but don't send to overlay
                console.log(`❤️ ${data.uniqueId} liked (${data.likeCount} likes)`);
            });

            // Event: Share
            this.tiktokConnection.on('share', (data) => {
                console.log(`🔄 ${data.uniqueId} shared the live`);
            });

            // Event: Follow
            this.tiktokConnection.on('follow', (data) => {
                console.log(`➕ ${data.uniqueId} followed`);
            });

            // Event: Chat
            this.tiktokConnection.on('chat', (data) => {
                // Optional: Log chat messages
                // console.log(`💬 ${data.uniqueId}: ${data.comment}`);
            });

            // Event: Viewer count update
            this.tiktokConnection.on('roomUser', (data) => {
                console.log(`👥 Viewers: ${data.viewerCount}`);
            });

            // Error handling
            this.tiktokConnection.on('error', (error) => {
                console.error('❌ TikTok connection error:', error);
                this.broadcast({
                    type: 'error',
                    message: error.message || 'Connection error'
                });
            });

            // Connect
            await this.tiktokConnection.connect();

        } catch (error) {
            console.error('❌ Failed to connect to TikTok:', error);

            let errorMessage = 'Connection failed';

            if (error.message.includes('LIVE has ended')) {
                errorMessage = 'Le live TikTok est terminé ou n\'existe pas';
            } else if (error.message.includes('Unable to retrieve room')) {
                errorMessage = 'Impossible de trouver le live. Vérifiez que @' + username + ' est bien en live';
            } else {
                errorMessage = error.message;
            }

            this.sendToClient(ws, {
                type: 'error',
                message: errorMessage
            });
        }
    }

    handleGift(data) {
        const giftName = data.giftName;
        const giftCoins = data.diamondCount || 1; // Coin value of the gift
        const repeatCount = data.repeatCount || 1; // How many times sent
        const totalCoins = giftCoins * repeatCount;

        const userInfo = {
            userId: data.userId,
            uniqueId: data.uniqueId,
            username: data.nickname || data.uniqueId,
            profilePictureUrl: data.profilePictureUrl
        };

        console.log(`\n🎁 GIFT RECEIVED:`);
        console.log(`   User: ${userInfo.username} (@${userInfo.uniqueId})`);
        console.log(`   Gift: ${giftName} x${repeatCount}`);
        console.log(`   Coins: ${totalCoins} 🪙`);

        // Update statistics
        this.stats.totalGifts += repeatCount;
        this.stats.totalCoins += totalCoins;

        // Broadcast to all connected clients
        this.broadcast({
            type: 'gift',
            user: userInfo,
            giftName: giftName,
            giftCoins: totalCoins,
            repeatCount: repeatCount,
            timestamp: Date.now()
        });
    }

    async disconnectFromTikTok() {
        if (this.tiktokConnection) {
            console.log('🔌 Disconnecting from TikTok...');
            await this.tiktokConnection.disconnect();
            this.tiktokConnection = null;
            this.currentUsername = null;
        }
    }

    broadcast(data) {
        const message = JSON.stringify(data);
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    sendToClient(client, data) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    }

    printStats() {
        console.log('\n📊 STATISTICS:');
        console.log(`   Total Gifts: ${this.stats.totalGifts}`);
        console.log(`   Total Coins: ${this.stats.totalCoins} 🪙`);
        console.log(`   Connected Clients: ${this.stats.connectedClients}`);
        console.log(`   Current Live: ${this.currentUsername || 'None'}`);
    }
}

// Start server
const PORT = process.env.PORT || 8080;
const server = new TikTokAuctionServer(PORT);

// Print stats every 30 seconds
setInterval(() => {
    if (server.currentUsername) {
        server.printStats();
    }
}, 30000);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down server...');
    server.printStats();
    await server.disconnectFromTikTok();
    process.exit(0);
});

console.log('\n=================================');
console.log('  TikTok Auction Server Ready!');
console.log('=================================');
console.log('\n💡 Instructions:');
console.log('1. Ouvrez http://localhost:8080 dans votre navigateur');
console.log('2. Entrez le @username d\'un live TikTok actif');
console.log('3. Cliquez sur "Se connecter"');
console.log('4. Les donations apparaîtront en temps réel!\n');
