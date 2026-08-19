import { AnalyticsConfig } from '../types';

const GA_STORAGE_KEY = 'conciliapyme_ga_config';
const GA_LOGS_KEY = 'conciliapyme_ga_event_logs';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface AnalyticsEventLog {
  id: string;
  timestamp: string;
  eventName: string;
  params: Record<string, any>;
  sentToGA: boolean;
}

export class AnalyticsService {
  private static config: AnalyticsConfig = {
    gaMeasurementId: '',
    enabled: true,
    debugMode: true,
  };
  private static isInitialized = false;
  private static eventLogs: AnalyticsEventLog[] = [];

  public static getConfig(): AnalyticsConfig {
    try {
      const stored = localStorage.getItem(GA_STORAGE_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      } else {
        const envId = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || '';
        this.config.gaMeasurementId = envId;
      }
    } catch {
      // ignore
    }
    return this.config;
  }

  public static saveConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(GA_STORAGE_KEY, JSON.stringify(this.config));
    if (this.config.gaMeasurementId && this.config.enabled) {
      this.initGA(this.config.gaMeasurementId);
    }
  }

  public static initGA(measurementId?: string): void {
    const id = measurementId || this.getConfig().gaMeasurementId;
    if (!id || typeof window === 'undefined') return;

    // Check if script already injected
    const existingScript = document.getElementById('ga4-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', id, {
        page_title: 'ConciliaPyme - Visor CAMT',
        anonymize_ip: true,
      });

      this.isInitialized = true;
      console.log(`[Google Analytics] Inicializado con ID: ${id}`);
    }
  }

  public static trackEvent(eventName: string, params: Record<string, any> = {}): void {
    const config = this.getConfig();
    const sentToGA = !!(config.enabled && config.gaMeasurementId && typeof window !== 'undefined' && window.gtag);

    if (sentToGA && window.gtag) {
      try {
        window.gtag('event', eventName, params);
      } catch (err) {
        console.warn('[Google Analytics] Error sending event:', err);
      }
    }

    const logEntry: AnalyticsEventLog = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      eventName,
      params,
      sentToGA,
    };

    this.eventLogs.unshift(logEntry);
    if (this.eventLogs.length > 50) this.eventLogs.pop();

    try {
      localStorage.setItem(GA_LOGS_KEY, JSON.stringify(this.eventLogs.slice(0, 20)));
    } catch {}

    if (config.debugMode) {
      console.log(`📊 [Analytics Event] ${eventName}`, params, sentToGA ? '(Enviado a GA4)' : '(Solo Local/Simulado)');
    }
  }

  public static getLogs(): AnalyticsEventLog[] {
    if (this.eventLogs.length === 0) {
      try {
        const stored = localStorage.getItem(GA_LOGS_KEY);
        if (stored) this.eventLogs = JSON.parse(stored);
      } catch {}
    }
    return this.eventLogs;
  }

  public static clearLogs(): void {
    this.eventLogs = [];
    localStorage.removeItem(GA_LOGS_KEY);
  }
}
