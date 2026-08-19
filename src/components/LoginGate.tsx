import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { UserProfile } from '../types';

interface LoginGateProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(AuthService.getUser());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsub = AuthService.subscribe((u) => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);

  if (currentUser) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErrorMessage('Ingresa tu nombre de usuario');
      return;
    }

    if (!password) {
      setErrorMessage('Ingresa tu contraseña');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = AuthService.validateAndLogin(trimmedUser, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message || 'Credenciales incorrectas. Verifica tu usuario y contraseña.');
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/95 backdrop-blur-xl font-sans text-slate-100 selection:bg-[#146ef5] selection:text-white overflow-y-auto">
      {/* Ambient background glow effects (Blockchain X style) */}
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-[#146ef5]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-[#4353ff]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-[430px] relative z-10 my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#146ef5] via-[#4353ff] to-[#00d2ff] text-white font-extrabold text-2xl shadow-xl shadow-[#146ef5]/30 mb-3 border border-white/20">
            CP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            ConciliaPyme <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#146ef5]/15 text-[#146ef5] border border-[#146ef5]/30">ISO 20022</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Plataforma de Conciliación Bancaria · PYMEs Paraguay
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-[#11141a]/95 border border-[#222733] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-[#222733] pb-3.5 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Lock className="w-4 h-4 text-[#146ef5]" />
              <span>Acceso al Sistema</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Conexión Segura</span>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/40 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nombre de usuario"
                  autoComplete="username"
                  autoFocus
                  className="w-full bg-[#080808] border border-[#30363d] rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#146ef5] focus:ring-2 focus:ring-[#146ef5]/25 transition-all font-mono"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#080808] border border-[#30363d] rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#146ef5] focus:ring-2 focus:ring-[#146ef5]/25 transition-all font-mono"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA (Blockchain X / Webflow Primary Button Style) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#146ef5] text-white font-bold text-xs hover:bg-[#0f55d9] transition-all shadow-lg shadow-[#146ef5]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Institutional footer */}
          <div className="mt-6 pt-4 text-center text-[11px] text-slate-500 border-t border-[#222733] flex items-center justify-center gap-2">
            <span>🇵🇾 Paraguay</span>
            <span>•</span>
            <span className="text-[#146ef5] font-semibold">Itaú & ueno bank</span>
            <span>•</span>
            <span>SIPAP ISO 20022</span>
          </div>
        </div>
      </div>
    </div>
  );
};
