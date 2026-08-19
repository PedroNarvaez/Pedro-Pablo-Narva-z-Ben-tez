import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserPlus,
  ShieldCheck,
  Building,
  Key,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Download,
  Copy,
  Check,
  Sparkles,
  Award,
  CircleDollarSign,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppUserAccount, UserRole } from '../types';
import { AuthService, DEFAULT_APP_USERS } from '../services/authService';
import { CompanyService } from '../services/companyService';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [users, setUsers] = useState<AppUserAccount[]>(AuthService.getAllUsers());
  const [companies] = useState(CompanyService.getCompanies());
  const [editingUser, setEditingUser] = useState<AppUserAccount | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedUser, setCopiedUser] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (isOpen) {
      setUsers(AuthService.getAllUsers());
      setEditingUser(null);
      setIsCreating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingUser({
      id: `usr_${Date.now()}`,
      username: '',
      passwordHash: '',
      name: '',
      email: '',
      provider: 'credentials',
      role: 'admin',
      empresa: companies[0]?.nombre || 'Agroservicios del Este S.R.L.',
      empresaId: companies[0]?.id || 'empresa_1_agro',
      pais: 'Paraguay',
      active: true,
      createdAt: new Date().toISOString(),
    });
    setIsCreating(true);
  };

  const handleStartEdit = (user: AppUserAccount) => {
    setEditingUser({ ...user });
    setIsCreating(false);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editingUser.username.trim() || !editingUser.name.trim() || !editingUser.passwordHash.trim()) {
      onShowToast('error', 'Completa los campos obligatorios (Usuario, Nombre, Contraseña)');
      return;
    }

    const res = AuthService.registerOrUpdateUser(editingUser);
    if (res.success) {
      setUsers(AuthService.getAllUsers());
      onShowToast('success', isCreating ? `Usuario "${editingUser.username}" creado exitosamente` : `Usuario "${editingUser.username}" actualizado`);
      setEditingUser(null);
      setIsCreating(false);
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleDeleteUser = (id: string) => {
    const res = AuthService.deleteUser(id);
    if (res.success) {
      setUsers(AuthService.getAllUsers());
      onShowToast('info', 'Usuario eliminado');
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleToggleStatus = (id: string) => {
    AuthService.toggleUserStatus(id);
    setUsers(AuthService.getAllUsers());
    onShowToast('info', 'Estado de acceso actualizado');
  };

  const handleCopyCredentials = (user: AppUserAccount) => {
    const text = `Acceso ConciliaPyme:\nURL: ${window.location.origin}\nUsuario: ${user.username}\nContraseña: ${user.passwordHash}\nEmpresa: ${user.empresa}`;
    navigator.clipboard.writeText(text);
    setCopiedUser(user.id);
    onShowToast('success', 'Credenciales copiadas al portapapeles para enviar al cliente');
    setTimeout(() => setCopiedUser(null), 2500);
  };

  const handleToggleShowPassword = (userId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleExportUsersList = () => {
    const csvHeader = 'Usuario,Nombre,Rol,Empresa,Email,Estado,Fecha Alta\n';
    const csvRows = users
      .map(
        (u) =>
          `"${u.username}","${u.name}","${u.role}","${u.empresa}","${u.email}","${u.active ? 'Activo' : 'Inactivo'}","${u.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ConciliaPyme_Usuarios_Comercial_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('success', 'Listado de usuarios exportado a CSV');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c47046] to-[#7ba8b8] text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Gestión Comercial de Usuarios & Licencias</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                  Operativo para Venta B2B
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Habilita accesos, configura contraseñas y asigna empresas para múltiples clientes y contadores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportUsersList}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Commercial Banner */}
        <div className="bg-[#c47046]/10 border-b border-[#c47046]/20 px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#c47046] font-bold">
            <Award className="w-4 h-4 shrink-0" />
            <span>Módulo Comercial ConciliaPyme Paraguay · Listo para Entrega a Clientes</span>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
            {users.length} Cuentas Registradas
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {editingUser ? (
            /* Editing / Creating Form */
            <form onSubmit={handleSaveUser} className="space-y-4 bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c47046]">
                  {isCreating ? 'Crear Nuevo Usuario para Cliente' : `Editar Usuario: ${editingUser.username}`}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-xs text-slate-500 hover:underline cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Nombre de Usuario (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046] font-mono"
                    placeholder="Ej: JuanPerez o EmpresaPY"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Contraseña de Acceso *
                  </label>
                  <input
                    type="password"
                    required
                    value={editingUser.passwordHash}
                    onChange={(e) => setEditingUser({ ...editingUser, passwordHash: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046] font-mono"
                    placeholder="Contraseña del usuario"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Nombre Completo / Titular *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    placeholder="Ej: Lic. Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    placeholder="juan@empresa.com.py"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Rol en la Plataforma
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                  >
                    <option value="superadmin">Super Administrador (Acceso Total)</option>
                    <option value="admin">Administrador de Empresa</option>
                    <option value="auditor">Auditor Contable (Lectura & Conciliación)</option>
                    <option value="tesorero">Tesorero / Finanzas</option>
                    <option value="operador">Operador de Carga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Empresa Asignada (de las 4 Empresas)
                  </label>
                  <select
                    value={editingUser.empresaId || ''}
                    onChange={(e) => {
                      const id = e.target.value;
                      const f = companies.find((c) => c.id === id);
                      setEditingUser({
                        ...editingUser,
                        empresaId: id,
                        empresa: f?.nombre || 'Empresa PYME',
                      });
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.ruc})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#c47046] text-white hover:bg-[#b35e35] shadow-md shadow-[#c47046]/20 cursor-pointer"
                >
                  Guardar Cuenta de Usuario
                </button>
              </div>
            </form>
          ) : null}

          {/* Users List Table */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Usuarios Registrados en el Sistema
              </span>
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#c47046] text-white hover:bg-[#b35e35] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Nuevo Usuario</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10.5px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Usuario / Nombre</th>
                    <th className="p-3">Contraseña</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3">Empresa Asignada</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {users.map((u) => {
                    const isVisible = !!showPasswordMap[u.id];
                    return (
                      <tr key={u.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{u.username}</div>
                          <div className="text-[11px] text-slate-500">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                              {isVisible ? u.passwordHash : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleShowPassword(u.id)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title={isVisible ? 'Ocultar' : 'Mostrar'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#7ba8b8]/15 text-[#7ba8b8] font-bold text-[10px] uppercase">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          <div className="font-semibold truncate max-w-xs">{u.empresa}</div>
                          <div className="text-[10px] text-slate-400">Paraguay</div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.active
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/15 text-red-500'
                            }`}
                          >
                            {u.active ? 'Habilitado' : 'Desactivado'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(u)}
                            title="Copiar credenciales para enviar al cliente"
                            className="p-1.5 text-slate-500 hover:text-[#c47046] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            {copiedUser === u.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id)}
                            title={u.active ? 'Desactivar usuario' : 'Habilitar usuario'}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            {u.active ? <Unlock className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5 text-red-400" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(u)}
                            title="Editar usuario"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {u.username !== 'PedroNarvaez' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id)}
                              title="Eliminar usuario"
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="text-[11px] text-slate-500">
            Administración Comercial B2B · PYMEs Paraguay
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c47046] text-white hover:bg-[#b35e35] transition-colors cursor-pointer"
          >
            Cerrar Administrador
          </button>
        </div>
      </div>
    </div>
  );
};
