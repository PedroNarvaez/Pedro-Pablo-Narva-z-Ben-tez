import { AppUserAccount, UserProfile, UserRole } from '../types';

const AUTH_USER_KEY = 'conciliapyme_auth_session_user';
const USERS_DB_KEY = 'conciliapyme_registered_users_accounts';
const GOOGLE_CLIENT_ID_KEY = 'conciliapyme_google_client_id';

// Default corporate users required by specification
export const DEFAULT_APP_USERS: AppUserAccount[] = [
  {
    id: 'usr_pedro_narvaez',
    username: 'PedroNarvaez',
    passwordHash: '3cd492123',
    name: 'Ing. Pedro Narváez',
    email: 'pedronarvaezghost@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: 'credentials',
    role: 'superadmin',
    empresa: 'Agroservicios del Este S.R.L.',
    empresaId: 'empresa_1_agro',
    pais: 'Paraguay',
    active: true,
    createdAt: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'usr_ariel_torres',
    username: 'ArielTorres',
    passwordHash: '15$25%61',
    name: 'Lic. Ariel Torres',
    email: 'arieltorres@pyme.com.py',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    provider: 'credentials',
    role: 'admin',
    empresa: 'Comercial & Distribuidora Asunción S.A.',
    empresaId: 'empresa_2_distribuidora',
    pais: 'Paraguay',
    active: true,
    createdAt: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'usr_roberto',
    username: 'Roberto',
    passwordHash: 'T$%toXtesis',
    name: 'Roberto',
    email: 'roberto@pyme.com.py',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    provider: 'credentials',
    role: 'admin',
    empresa: 'Agroservicios del Este S.R.L.',
    empresaId: 'empresa_1_agro',
    pais: 'Paraguay',
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z',
  },
];

export class AuthService {
  private static currentUser: UserProfile | null = null;
  private static usersList: AppUserAccount[] = [];
  private static listeners: ((user: UserProfile | null) => void)[] = [];
  private static userListListeners: ((users: AppUserAccount[]) => void)[] = [];

  public static init(): void {
    // Load registered accounts
    try {
      const storedUsers = localStorage.getItem(USERS_DB_KEY);
      if (storedUsers) {
        this.usersList = JSON.parse(storedUsers);
        // Ensure default accounts exist and are updated
        DEFAULT_APP_USERS.forEach((defUser) => {
          const existingIdx = this.usersList.findIndex((u) => u.username.toLowerCase() === defUser.username.toLowerCase());
          if (existingIdx === -1) {
            this.usersList.push(defUser);
          } else {
            // Keep default credentials synchronized
            this.usersList[existingIdx] = {
              ...this.usersList[existingIdx],
              passwordHash: defUser.passwordHash,
              active: true,
            };
          }
        });
        this.persistUsers();
      } else {
        this.usersList = [...DEFAULT_APP_USERS];
        this.persistUsers();
      }
    } catch {
      this.usersList = [...DEFAULT_APP_USERS];
    }

    // Load active session
    try {
      const storedSession = localStorage.getItem(AUTH_USER_KEY);
      if (storedSession) {
        this.currentUser = JSON.parse(storedSession);
      } else {
        this.currentUser = null;
      }
    } catch {
      this.currentUser = null;
    }

    this.notify();
  }

  public static getUser(): UserProfile | null {
    if (!this.currentUser) {
      try {
        const stored = localStorage.getItem(AUTH_USER_KEY);
        if (stored) {
          this.currentUser = JSON.parse(stored);
        }
      } catch {
        this.currentUser = null;
      }
    }
    return this.currentUser;
  }

  public static isAuthenticated(): boolean {
    return this.getUser() !== null;
  }

  public static getAllUsers(): AppUserAccount[] {
    if (this.usersList.length === 0) this.init();
    return this.usersList;
  }

  public static validateAndLogin(username: string, password: string): { success: boolean; message: string; user?: UserProfile } {
    if (this.usersList.length === 0) this.init();

    const trimmedUser = username.trim();
    const found = this.usersList.find(
      (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
    );

    if (!found) {
      return { success: false, message: 'Usuario no registrado en el sistema' };
    }

    if (!found.active) {
      return { success: false, message: 'La cuenta se encuentra desactivada por el Administrador' };
    }

    if (found.passwordHash !== password) {
      return { success: false, message: 'Contraseña incorrecta para el usuario' };
    }

    const profile: UserProfile = {
      id: found.id,
      username: found.username,
      name: found.name,
      email: found.email,
      avatar: found.avatar,
      provider: found.provider,
      role: found.role,
      empresaId: found.empresaId,
      empresa: found.empresa,
      pais: found.pais || 'Paraguay',
      active: found.active,
      createdAt: found.createdAt,
    };

    this.setUser(profile);
    return { success: true, message: `Bienvenido, ${profile.name}`, user: profile };
  }

  public static registerOrUpdateUser(account: AppUserAccount): { success: boolean; message: string } {
    if (this.usersList.length === 0) this.init();

    const idx = this.usersList.findIndex((u) => u.id === account.id || u.username.toLowerCase() === account.username.toLowerCase());
    if (idx >= 0) {
      this.usersList[idx] = { ...this.usersList[idx], ...account };
    } else {
      this.usersList.push(account);
    }
    this.persistUsers();
    this.notifyUserList();
    return { success: true, message: 'Usuario guardado correctamente' };
  }

  public static deleteUser(id: string): { success: boolean; message: string } {
    if (this.usersList.length <= 1) {
      return { success: false, message: 'No puedes eliminar todos los usuarios del sistema' };
    }

    // Protect superadmin accounts from accidental deletion
    const target = this.usersList.find((u) => u.id === id);
    if (target?.username === 'PedroNarvaez') {
      return { success: false, message: 'El usuario PedroNarvaez es la cuenta raíz y no puede eliminarse' };
    }

    this.usersList = this.usersList.filter((u) => u.id !== id);
    this.persistUsers();
    this.notifyUserList();
    return { success: true, message: 'Usuario eliminado' };
  }

  public static toggleUserStatus(id: string): void {
    const user = this.usersList.find((u) => u.id === id);
    if (user && user.username !== 'PedroNarvaez') {
      user.active = !user.active;
      this.persistUsers();
      this.notifyUserList();
    }
  }

  public static setUser(user: UserProfile | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    this.notify();
  }

  public static logout(): void {
    this.setUser(null);
  }

  public static getGoogleClientId(): string {
    const fromEnv = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    const fromStorage = localStorage.getItem(GOOGLE_CLIENT_ID_KEY);
    return fromStorage || fromEnv || '';
  }

  public static setGoogleClientId(clientId: string): void {
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
  }

  public static subscribe(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.getUser());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public static subscribeUsersList(listener: (users: AppUserAccount[]) => void): () => void {
    this.userListListeners.push(listener);
    listener(this.getAllUsers());
    return () => {
      this.userListListeners = this.userListListeners.filter((l) => l !== listener);
    };
  }

  private static persistUsers(): void {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(this.usersList));
  }

  private static notify(): void {
    const user = this.getUser();
    this.listeners.forEach((l) => l(user));
  }

  private static notifyUserList(): void {
    const users = this.getAllUsers();
    this.userListListeners.forEach((l) => l(users));
  }
}
