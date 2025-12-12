import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

export const API_URL = 'http://192.168.100.4:3000';
const SOCKET_URL = 'http://192.168.100.4:3000';

export interface Message {
  _id: string;
  threadId: string;
  sender: {
    userId: any;
    role: string;
  };
  type: 'text' | 'image' | 'file' | 'system';
  content: {
    text?: string;
    mediaUrl?: string;
    fileName?: string;
  };
  status: 'sent' | 'delivered' | 'read' | 'failed';
  readBy?: { userId: string; readAt: Date }[];
  isEdited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  _id: string;
  participants: {
    userId: any;
    role: string;
  }[];
  type: string;
  status: 'active' | 'closed' | 'archived';
  category?: string;
  priority?: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
    type: string;
  };
  unreadCount: number;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

class ChatService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private listeners: Map<string, Function[]> = new Map();

  async initialize() {
    this.token = await AsyncStorage.getItem('auth_token');
    if (!this.token) {
      throw new Error('No auth token found');
    }

    // Initialize socket connection
    this.socket = io(SOCKET_URL, {
      auth: { token: this.token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to chat server');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
      this.emit('disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });

    // Message events
    this.socket.on('message:new', (data) => {
      console.log('📨 New message:', data);
      this.emit('message:new', data);
    });

    this.socket.on('message:edited', (data) => {
      this.emit('message:edited', data);
    });

    this.socket.on('message:deleted', (data) => {
      this.emit('message:deleted', data);
    });

    // Typing events
    this.socket.on('typing:user', (data) => {
      this.emit('typing:user', data);
    });

    // Read receipts
    this.socket.on('messages:read', (data) => {
      this.emit('messages:read', data);
    });

    // Thread events
    this.socket.on('thread:status:changed', (data) => {
      this.emit('thread:status:changed', data);
    });

    return this;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // API Methods
  async getOrCreateSupportThread(): Promise<Thread> {
    try {
      const response = await fetch(`${API_URL}/api/client/messages/support/thread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ category: 'general' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('getOrCreateSupportThread failed:', response.status, errorText);
        throw new Error(`Failed to get support thread: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error in getOrCreateSupportThread:', error);
      throw error;
    }
  }

  async getMessages(threadId: string, limit = 50): Promise<Message[]> {
    const response = await fetch(`${API_URL}/api/client/messages/threads/${threadId}/messages?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get messages');
    }

    const data = await response.json();
    return data.data;
  }

  async sendMessage(threadId: string, text: string): Promise<Message> {
    const response = await fetch(`${API_URL}/api/client/messages/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        type: 'text',
        content: { text },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data.data;
  }

  async sendImage(threadId: string, imageUri: string, caption?: string): Promise<Message> {
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    if (caption) {
      formData.append('caption', caption);
    }

    const response = await fetch(`${API_URL}/api/client/messages/threads/${threadId}/messages/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to send image');
    }

    const data = await response.json();
    return data.data;
  }

  // Socket methods
  joinThread(threadId: string) {
    if (this.socket) {
      this.socket.emit('thread:join', { threadId });
    }
  }

  leaveThread(threadId: string) {
    if (this.socket) {
      this.socket.emit('thread:leave', { threadId });
    }
  }

  startTyping(threadId: string) {
    if (this.socket) {
      this.socket.emit('typing:start', { threadId });
    }
  }

  stopTyping(threadId: string) {
    if (this.socket) {
      this.socket.emit('typing:stop', { threadId });
    }
  }

  markAsRead(threadId: string) {
    if (this.socket) {
      this.socket.emit('message:read', { threadId });
    }
  }
}

export const chatService = new ChatService();
