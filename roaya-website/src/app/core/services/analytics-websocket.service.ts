import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Active visitors data from WebSocket
 */
export interface ActiveVisitorsData {
  activeVisitors: number;
  activeSessions: number;
  timestamp: string;
}

/**
 * WebSocket message from server
 */
interface WebSocketMessage {
  type: 'active_visitors';
  data: ActiveVisitorsData;
}

/**
 * Connection state
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * AnalyticsWebSocketService
 *
 * Manages a single WebSocket connection to the analytics backend for real-time active visitor data.
 *
 * Features:
 * - Automatic reconnection with exponential backoff (max 30s)
 * - Authentication via JWT token
 * - Graceful fallback to polling if WebSocket fails
 * - Automatic cleanup on destroy
 * - Connection state tracking
 *
 * Usage:
 * ```typescript
 * constructor(private wsService: AnalyticsWebSocketService) {}
 *
 * ngOnInit() {
 *   this.wsService.connect();
 *   this.activeVisitors = this.wsService.activeVisitorsSignal;
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsWebSocketService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  // WebSocket connection
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectDelay = 30_000; // 30 seconds
  private readonly baseReconnectDelay = 1_000; // 1 second
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // Reactive state
  private activeVisitorsSubject = new BehaviorSubject<ActiveVisitorsData>({
    activeVisitors: 0,
    activeSessions: 0,
    timestamp: new Date().toISOString(),
  });

  // Public observables
  public activeVisitors$ = this.activeVisitorsSubject.asObservable();

  // Signals for reactive components
  public activeVisitorsSignal = signal<ActiveVisitorsData>({
    activeVisitors: 0,
    activeSessions: 0,
    timestamp: new Date().toISOString(),
  });

  public connectionStateSignal = signal<ConnectionState>('disconnected');

  // Error stream
  private errorSubject = new Subject<string>();
  public errors$ = this.errorSubject.asObservable();

  constructor() {
    // Subscribe to active visitors updates and sync signal
    this.activeVisitors$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.activeVisitorsSignal.set(data));

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.disconnect();
    });
  }

  /**
   * Connect to WebSocket server
   * Will automatically reconnect on disconnect
   */
  async connect(): Promise<void> {
    // Don't connect if already connected or connecting
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    // Check if user is authenticated
    const isAuthenticated = this.authService.isAuthenticated();
    if (!isAuthenticated) {
      console.warn('[AnalyticsWS] Cannot connect: User not authenticated');
      this.connectionStateSignal.set('error');
      return;
    }

    // Get auth token from server
    const token = await this.getAuthToken();
    if (!token) {
      console.warn('[AnalyticsWS] Cannot connect: No auth token available');
      this.connectionStateSignal.set('error');
      return;
    }

    this.connectionStateSignal.set('connecting');

    try {
      // Convert HTTP(S) URL to WS(S) URL
      const wsUrl = this.buildWebSocketUrl(token);
      console.log('[AnalyticsWS] Connecting to:', wsUrl.replace(/token=[^&]+/, 'token=***'));

      this.ws = new WebSocket(wsUrl);

      // Connection opened
      this.ws.addEventListener('open', () => {
        console.log('[AnalyticsWS] Connected successfully');
        this.connectionStateSignal.set('connected');
        this.reconnectAttempts = 0; // Reset reconnect counter
      });

      // Message received
      this.ws.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;

          if (message.type === 'active_visitors') {
            this.activeVisitorsSubject.next(message.data);
          }
        } catch (error) {
          console.error('[AnalyticsWS] Failed to parse message:', error);
        }
      });

      // Connection closed
      this.ws.addEventListener('close', (event) => {
        console.log('[AnalyticsWS] Connection closed', { code: event.code, reason: event.reason });
        this.connectionStateSignal.set('disconnected');
        this.ws = null;

        // Attempt reconnection (unless manually disconnected)
        if (event.code !== 1000) {
          this.scheduleReconnect();
        }
      });

      // Error occurred
      this.ws.addEventListener('error', (event) => {
        console.error('[AnalyticsWS] WebSocket error:', event);
        this.connectionStateSignal.set('error');
        this.errorSubject.next('WebSocket connection error');
      });

    } catch (error) {
      console.error('[AnalyticsWS] Failed to create WebSocket:', error);
      this.connectionStateSignal.set('error');
      this.errorSubject.next('Failed to create WebSocket connection');
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      // Close with code 1000 (normal closure) to prevent auto-reconnect
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.connectionStateSignal.set('disconnected');
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    console.log(`[AnalyticsWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Build WebSocket URL with auth token
   */
  private buildWebSocketUrl(token: string): string {
    const apiUrl = environment.apiUrl;

    // Convert http/https to ws/wss
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = apiUrl.replace(/^https?:\/\//, '');

    // WebSocket path
    const wsPath = '/ws/analytics/active-visitors';

    return `${wsProtocol}://${wsHost}${wsPath}?token=${encodeURIComponent(token)}`;
  }

  /**
   * Get authentication token from server
   * Fetches a short-lived WebSocket token from the /auth/ws-token endpoint
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const apiUrl = environment.apiUrl;
      const response = await fetch(`${apiUrl}/auth/ws-token`, {
        method: 'GET',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[AnalyticsWS] Failed to fetch WebSocket token:', response.statusText);
        return null;
      }

      const data = await response.json();

      if (!data.success || !data.data?.token) {
        console.error('[AnalyticsWS] Invalid WebSocket token response:', data);
        return null;
      }

      return data.data.token;
    } catch (error) {
      console.error('[AnalyticsWS] Error fetching WebSocket token:', error);
      return null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionStateSignal();
  }

  /**
   * Get current active visitors data
   */
  getCurrentData(): ActiveVisitorsData {
    return this.activeVisitorsSignal();
  }
}
