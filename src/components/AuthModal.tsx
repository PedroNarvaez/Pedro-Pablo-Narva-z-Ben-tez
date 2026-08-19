import React, { useState } from 'react';
import {
  X,
  User,
  LogOut,
  Shield,
  CheckCircle2,
  Sparkles,
  Building,
  Key,
  Lock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
  onLogoutRequested: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onShowToast,
  onLogoutRequested,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const allUsers = AuthService.getAllUsers();

  if (!isOpen) return null;

  const handleSwitchToUser = (targetUsername: string, pass: string) => {
    const res = AuthService.validateAndLogin(targetUsername, pass);
    if (res.success && res.user) {
      onShowToast('success', `Sesión cambiada a: ${res.user.name} (${res.user.role.toUpperCase()})`);
      onClose();
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = AuthService.validateAndLogin(usernameInput, passwordInput);
    if (res.success && res.user) {
      onShowToast('success', `Bienvenido, ${res.user.name}`);
      onClose();
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    onShowToast('info', 'Sesión cerrada. Regresando a la pantalla de acceso...');
    onLogoutRequested();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#131826] border border-slate-200 dark:border-[#8b93a7]/20 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-[#e8e5df]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#8b93a7]/15 flex items-center justify-between bg-slate-50 dark:bg-[#0e121a]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7ba8b8]/15 text-[#7ba8b8] flex items-center justify-center font-bold border border-[#7ba8b8]/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Perfil de Usuario & Acceso</h2>
              <p className="text-xs text-slate-500 dark:text-[#8b93a7]">Control de Acceso B2B · Paraguay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-[#e8e5df] hover:bg-slate-100 dark:hover:bg-[#181e2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto">
          {user ? (
            /* User Profile View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181e2e]/60 border border-slate-200 dark:border-[#8b93a7]/20 flex items-center gap-3.5">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#c47046]/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate">{user.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-[#c47046]/20 text-[#c47046]">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-[#8b93a7] truncate">
                    Usuario: {user.username}
                  </div>
                  <div className="text-[10px] text-[#7ba8b8] mt-0.5 flex items-center gap-1 font-semibold truncate">
                    <Building className="w-3 h-3 shrink-0" /> {user.empresa || 'PYME Paraguay'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#8b93a7]/15 rounded-xl space-y-1.5 text-[11px] text-slate-600 dark:text-[#8b93a7]">
                <div className="flex justify-between">
                  <span>Usuario ID:</span> <span className="font-mono text-slate-900 dark:text-[#e8e5df]">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>País / Región:</span> <span className="text-slate-900 dark:text-[#e8e5df]">🇵🇾 {user.pais || 'Paraguay'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bancos Habilitados:</span> <span className="text-[#2d9e6e] font-semibold">Banco Itaú & ueno bank</span>
                </div>
              </div>

              {/* Fast switch between authorized users */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#8b93a7]/15 space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Cambiar Rápido de Cuenta
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allUsers.map((u) => {
                    const isCurrent = user.username === u.username;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSwitchToUser(u.username, u.passwordHash)}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isCurrent
                            ? 'bg-[#c47046]/15 border-[#c47046] text-[#c47046]'
                            : 'bg-slate-50 dark:bg-[#181e2e] border-slate-200 dark:border-[#8b93a7]/15 hover:border-[#c47046]/40'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="font-bold text-[11px] truncate">{u.username}</div>
                          <div className="text-[9.5px] text-slate-400 font-mono truncate">{u.role}</div>
                        </div>
                        {isCurrent ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#c47046] text-white font-bold">Activo</span>
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión (Ir a Pantalla de Bloqueo)
              </button>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleManualLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Usuario</label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="PedroNarvaez o ArielTorres"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#c47046] text-white font-bold text-xs hover:bg-[#b35e35] transition-all flex items-center justify-center gap-1.5"
              >
                <span>Acceder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
