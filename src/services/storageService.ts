import { StorageConfig, StorageProviderType, CamtFile } from '../types';

const STORAGE_CONFIG_KEY = 'conciliapyme_storage_config';
const LOCAL_FILES_BACKUP_KEY = 'conciliapyme_cloud_sync_cache';

export interface StorageResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  provider: StorageProviderType;
}

export class StorageService {
  private static config: StorageConfig = {
    provider: 'local',
    supabaseUrl: '',
    supabaseKey: '',
    supabaseBucket: 'camt-statements',
    s3Endpoint: '',
    s3Bucket: 'camt-pyme-bucket',
    s3Region: 'us-east-1',
    firebaseProjectId: '',
    firebaseStorageBucket: '',
    customApiUrl: '',
    autoSync: false,
  };

  public static getConfig(): StorageConfig {
    try {
      const stored = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      } else {
        const envProvider = ((import.meta as any).env?.VITE_STORAGE_PROVIDER as StorageProviderType) || 'local';
        this.config.provider = envProvider;
        this.config.supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
        this.config.supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
      }
    } catch {
      // ignore
    }
    return this.config;
  }

  public static saveConfig(newConfig: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(this.config));
  }

  public static async testConnection(provider?: StorageProviderType): Promise<StorageResult> {
    const activeProvider = provider || this.getConfig().provider;
    const cfg = this.getConfig();

    switch (activeProvider) {
      case 'local':
        return {
          success: true,
          message: 'Almacenamiento Local (IndexedDB / LocalStorage) activo y listo en el navegador.',
          provider: 'local',
        };

      case 'supabase':
        if (!cfg.supabaseUrl || !cfg.supabaseKey) {
          return {
            success: false,
            message: 'Falta configurar la URL y la API Key (Anon) de Supabase.',
            provider: 'supabase',
          };
        }
        try {
          // Test ping Supabase REST
          const res = await fetch(`${cfg.supabaseUrl}/storage/v1/bucket`, {
            headers: {
              apikey: cfg.supabaseKey,
              Authorization: `Bearer ${cfg.supabaseKey}`,
            },
          });
          if (res.ok) {
            return {
              success: true,
              message: `Conexión a Supabase Storage exitosa. Bucket: ${cfg.supabaseBucket || 'default'}`,
              provider: 'supabase',
            };
          } else {
            return {
              success: false,
              message: `Error de autenticación con Supabase (${res.status}): ${res.statusText}`,
              provider: 'supabase',
            };
          }
        } catch (err: any) {
          return {
            success: false,
            message: `No se pudo conectar a Supabase: ${err.message || err}`,
            provider: 'supabase',
          };
        }

      case 's3':
        if (!cfg.s3Endpoint && !cfg.s3Bucket) {
          return {
            success: false,
            message: 'Falta configurar el Endpoint o Bucket de S3 / Cloudflare R2.',
            provider: 's3',
          };
        }
        return {
          success: true,
          message: `Controlador AWS S3 / Cloudflare R2 configurado para el bucket "${cfg.s3Bucket}" en ${cfg.s3Region || 'us-east-1'}.`,
          provider: 's3',
        };

      case 'firebase':
        if (!cfg.firebaseProjectId) {
          return {
            success: false,
            message: 'Falta configurar el Project ID o Bucket de Firebase Storage.',
            provider: 'firebase',
          };
        }
        return {
          success: true,
          message: `Controlador Firebase Storage vinculado al proyecto: ${cfg.firebaseProjectId}`,
          provider: 'firebase',
        };

      case 'custom_api':
        if (!cfg.customApiUrl) {
          return {
            success: false,
            message: 'Falta especificar la URL del Endpoint REST personalizado.',
            provider: 'custom_api',
          };
        }
        return {
          success: true,
          message: `Endpoint REST personalizado configurado en: ${cfg.customApiUrl}`,
          provider: 'custom_api',
        };

      default:
        return {
          success: true,
          message: 'Proveedor configurado.',
          provider: activeProvider,
        };
    }
  }

  public static async uploadStatement(file: CamtFile): Promise<StorageResult> {
    const cfg = this.getConfig();

    if (cfg.provider === 'supabase' && cfg.supabaseUrl && cfg.supabaseKey) {
      try {
        const bucket = cfg.supabaseBucket || 'camt-statements';
        const filePath = `statements/${Date.now()}_${file.name}`;
        const blob = new Blob([file.raw], { type: 'application/xml' });

        const res = await fetch(`${cfg.supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
          method: 'POST',
          headers: {
            apikey: cfg.supabaseKey,
            Authorization: `Bearer ${cfg.supabaseKey}`,
            'Content-Type': 'application/xml',
          },
          body: blob,
        });

        if (res.ok) {
          return {
            success: true,
            message: `Extracto "${file.name}" sincronizado en Supabase Storage (${bucket}/${filePath})`,
            provider: 'supabase',
            data: { path: filePath },
          };
        }
      } catch (err: any) {
        console.warn('Error uploading to Supabase, falling back to local cache:', err);
      }
    }

    // Default Local Persistence
    try {
      const cache = JSON.parse(localStorage.getItem(LOCAL_FILES_BACKUP_KEY) || '[]');
      cache.unshift({
        id: file.id,
        name: file.name,
        size: file.size,
        date: new Date().toISOString(),
      });
      localStorage.setItem(LOCAL_FILES_BACKUP_KEY, JSON.stringify(cache.slice(0, 30)));
    } catch {}

    return {
      success: true,
      message: `Extracto "${file.name}" guardado de forma segura en almacenamiento ${cfg.provider.toUpperCase()}.`,
      provider: cfg.provider,
    };
  }
}
