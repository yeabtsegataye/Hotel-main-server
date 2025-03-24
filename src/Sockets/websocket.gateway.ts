import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  interface MenuUser {
    userId: string;
    hotelId: string;
    socketId: string;
  }
  
  interface DashboardUser {
    hotelId: string;
    socketId: string;
  }
  
  @WebSocketGateway({
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://hotel-main-dashboard.onrender.com',
        'https://landing-agay.onrender.com',
        'https://hotel-menu-s71q.onrender.com',
      ], // Allow the specific origin
      credentials: true, // Allow cookies and authentication credentials
    },
  }) // Enable CORS for WebSocket
  export class WebSocketGateways
    implements OnGatewayConnection, OnGatewayDisconnect
  {
    constructor() {
      console.log('WebSocket Gateway initialized');
    }
  
    @WebSocketServer()
    server: Server;
  
    // Store menu users by user ID
    private menuUsers = new Map<string, MenuUser>();
  
    // Store dashboard users by hotel ID (multiple dashboards per hotel)
    private dashboardUsers = new Map<string, DashboardUser[]>();
  
    handleConnection(client: Socket) {
      console.log(`New client connected: ${client.id}`);
      console.log('Handshake:', client.handshake);
  
      const hotelId = client.handshake.query.hotelId as string;
      const userId = client.handshake.query.userId as string;
      const type = client.handshake.query.type as string;
  
      console.log(`hotelId: ${hotelId}, userId: ${userId}, type: ${type}`);
  
      if (!hotelId) {
        console.log('No hotelId provided, disconnecting client...');
        client.disconnect(true);
        return;
      }
  
      if (type === 'menu' && userId) {
        this.menuUsers.set(userId, { userId, hotelId, socketId: client.id });
        console.log(`Menu user connected: ${userId} (Hotel: ${hotelId})`);
      } else if (type === 'dashboard') {
        if (!this.dashboardUsers.has(hotelId)) {
          this.dashboardUsers.set(hotelId, []);
        }
        this.dashboardUsers.get(hotelId).push({ hotelId, socketId: client.id });
        console.log(`Dashboard user connected for Hotel: ${hotelId}`);
      }
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
  
      // Remove from menu users
      for (const [userId, user] of this.menuUsers.entries()) {
        if (user.socketId === client.id) {
          this.menuUsers.delete(userId);
          console.log(`Menu user ${userId} disconnected`);
          break;
        }
      }
  
      // Remove from dashboard users
      for (const [hotelId, dashboardClients] of this.dashboardUsers.entries()) {
        this.dashboardUsers.set(
          hotelId,
          dashboardClients.filter((user) => user.socketId !== client.id),
        );
      }
    }
  
    @SubscribeMessage('newOrder')
    handleNewOrder(client: Socket, order: { hotelId: any; orderDetails: any }) {
      const { hotelId, orderDetails } = order;
    
      // Convert hotelId to string (if it's not already)
      const hotelIdStr = String(hotelId);
    
      console.log('New order received:', this.dashboardUsers);
      console.log('hotelId type:', typeof hotelId, 'value:', hotelId);
      console.log('Converted hotelId:', hotelIdStr);
    
      // Send order notification to all dashboards under the given hotel ID
      if (this.dashboardUsers.has(hotelIdStr)) {
        const dashboardClients = this.dashboardUsers.get(hotelIdStr);
        dashboardClients.forEach((dashboardClient) => {
          this.server
            .to(dashboardClient.socketId)
            .emit('newOrder', orderDetails);
          console.log(`New order notification sent to dashboard: ${dashboardClient.socketId}`);
        });
      } else {
        console.log(`No dashboard users found for hotel ${hotelIdStr}`);
      }
    }
  
    @SubscribeMessage('acceptOrder')
    handleAcceptOrder(client: Socket, payload: { userId: string; message: any }) {
      const { userId, message } = payload;
  
      if (this.menuUsers.has(userId)) {
        const menuClient = this.menuUsers.get(userId);
        this.server.to(menuClient.socketId).emit('orderAccepted', message);
        console.log(`Order accepted notification sent to user ${userId}`);
      } else {
        console.log(`Menu user ${userId} not found.`);
      }
    }
  }