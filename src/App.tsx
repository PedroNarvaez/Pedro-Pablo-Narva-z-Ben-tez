import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KpiGrid } from './components/KpiGrid';
import { AccountInfoCard } from './components/AccountInfoCard';
import { ChartsSection } from './components/ChartsSection';
import { TopCounterparties } from './components/TopCounterparties';
import { TransactionsTable } from './components/TransactionsTable';
import { ReportView } from './components/ReportView';
import { ReconciliationMatcher } from './components/ReconciliationMatcher';
import { InternationalStandardsView } from './components/InternationalStandardsView';
import { XmlPreviewModal } from './components/XmlPreviewModal';
import { ValidationReportModal } from './components/ValidationReportModal';
import { SettingsModal } from './components/SettingsModal';
import { ThesisModal } from './components/ThesisModal';
import { ZipExporterModal } from './components/ZipExporterModal';
import { AuthModal } from './components/AuthModal';
import { LoginGate } from './components/LoginGate';
import { CompanyModal } from './components/CompanyModal';
import { UserManagerModal } from './components/UserManagerModal';
import { SystemInfoModal } from './components/SystemInfoModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { CamtFile, UserProfile, AppTheme, CompanyProfile } from './types';
import { parseCAMTXML } from './utils/camtParser';
import { SAMPLE_CAMT_ITAU_PARAGUAY } from './utils/paraguayBanking';
import { exportTransactionsToCSV, exportReportToCSV, downloadFile } from './utils/exportUtils';
import { generateSingleHtmlFile } from './utils/generateSingleHtml';
import { AuthService } from './services/authService';
import { AnalyticsService } from './services/analyticsService';
import { StorageService } from './services/storageService';
import { ThemeService } from './services/themeService';
import { CompanyService } from './services/companyService';
import { Sparkles, GraduationCap, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<CamtFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'visor' | 'informe' | 'conciliar' | 'estandares'>('visor');
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isThesisModalOpen, setIsThesisModalOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isUserManagerModalOpen, setIsUserManagerModalOpen] = useState(false);
  const [isSystemInfoModalOpen, setIsSystemInfoModalOpen] = useState(false);
  const [counterpartyFilter, setCounterpartyFilter] = useState<string | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // User Auth & Theme State
  const [user, setUser] = useState<UserProfile | null>(AuthService.getUser());
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(ThemeService.getTheme());
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(CompanyService.getActiveCompany());
  const [selectedCurrency, setSelectedCurrency] = useState<string>('PYG');

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Init Theme, Auth and GA4
  useEffect(() => {
    ThemeService.initTheme();
    const unsubscribeTheme = ThemeService.subscribe((t) => {
      setCurrentTheme(t);
    });

    const unsubscribeAuth = AuthService.subscribe((u) => {
      setUser(u);
    });

    const unsubscribeCompany = CompanyService.subscribe((c) => {
      setActiveCompany(c);
    });

    AnalyticsService.initGA();
    AnalyticsService.trackEvent('app_session_start', {
      timestamp: new Date().toISOString(),
      country: 'Paraguay',
    });

    return () => {
      unsubscribeTheme();
      unsubscribeAuth();
      unsubscribeCompany();
    };
  }, []);

  // Load initial sample for Banco Itaú Paraguay
  useEffect(() => {
    try {
      const sample = {
        name: 'Extracto_Itau_Paraguay_SIPAP_CAMT053.xml',
        xml: SAMPLE_CAMT_ITAU_PARAGUAY,
      };
      const parsedData = parseCAMTXML(sample.xml);
      const initialFile: CamtFile = {
        id: `file-sample-py`,
        name: sample.name,
        size: sample.xml.length,
        raw: sample.xml,
        data: parsedData,
        uploadDate: new Date().toISOString(),
      };
      setFiles([initialFile]);
      setActiveFileId(initialFile.id);
      setSelectedCurrency(parsedData.moneda || 'PYG');
    } catch (e) {
      console.error('Error loading initial sample:', e);
    }
  }, []);

  const handleLoadFiles = async (fileList: FileList | File[]) => {
    let loadedCount = 0;
    let errorCount = 0;

    const newFiles: CamtFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.name.toLowerCase().endsWith('.xml')) {
        errorCount++;
        continue;
      }

      try {
        const text = await file.text();
        const parsed = parseCAMTXML(text);

        const newCamtFile: CamtFile = {
          id: `file-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          raw: text,
          data: parsed,
          uploadDate: new Date().toISOString(),
        };

        newFiles.push(newCamtFile);
        loadedCount++;
      } catch (err: any) {
        console.error(`Error parsing file ${file.name}:`, err);
        errorCount++;
      }
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...newFiles, ...prev]);
      setActiveFileId(newFiles[0].id);
      setSelectedCurrency(newFiles[0].data.moneda || 'PYG');

      AnalyticsService.trackEvent('xml_files_uploaded', {
        count: newFiles.length,
        first_bank: newFiles[0].data.banco,
      });

      // Validation feedback toast
      const firstValid = newFiles[0].data.validation;
      if (firstValid && firstValid.errorCount > 0) {
        addToast(
          'error',
          `⚠️ ${newFiles[0].name}: ${firstValid.errorCount} error(es) en esquema ISO 20022 XSD.`
        );
      } else if (firstValid && firstValid.warningCount > 0) {
        addToast(
          'info',
          `ℹ️ ${newFiles[0].name}: Conforme XSD con ${firstValid.warningCount} aviso(s) de formato.`
        );
      } else {
        addToast(
          'success',
          `✅ Se cargaron ${loadedCount} extracto(s) con validación 100% conforme ISO 20022.`
        );
      }
    }

    if (errorCount > 0) {
      addToast('error', `${errorCount} archivo(s) no pudieron ser procesados como XML CAMT`);
    }
  };

  const handleLoadSampleXml = (xmlString: string, sampleName: string) => {
    try {
      const parsed = parseCAMTXML(xmlString);
      const newFile: CamtFile = {
        id: `sample-${Date.now()}`,
        name: sampleName,
        size: xmlString.length,
        raw: xmlString,
        data: parsed,
        uploadDate: new Date().toISOString(),
      };
      setFiles((prev) => [newFile, ...prev]);
      setActiveFileId(newFile.id);
      setSelectedCurrency(parsed.moneda || 'PYG');
      addToast('info', `Extracto de muestra "${sampleName}" cargado`);
    } catch (err: any) {
      addToast('error', `Error al cargar ejemplo: ${err.message}`);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      if (activeFileId === id) {
        setActiveFileId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
    addToast('info', 'Extracto eliminado de la sesión');
  };

  const handleExportCSV = () => {
    if (!activeFile) return;
    exportTransactionsToCSV(activeFile);
    addToast('success', 'Descarga de CSV iniciada');
  };

  const handleExportReport = () => {
    if (!activeFile) return;
    exportReportToCSV(activeFile);
    addToast('success', 'Informe financiero exportado a CSV');
  };

  const handleDownloadSingleHtml = () => {
    const html = generateSingleHtmlFile();
    downloadFile(html, 'conciliapyme_offline_app.html', 'text/html;charset=utf-8;');
    addToast('success', 'Archivo HTML autónomo descargado exitosamente');
  };

  const handleSelectCounterparty = (name: string) => {
    setCounterpartyFilter(name);
    setCurrentTab('visor');
    addToast('info', `Filtrando transacciones por: ${name}`);
  };

  const activeFile = files.find((f) => f.id === activeFileId) || null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080808] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#146ef5] selection:text-white transition-colors">
      {/* Obligatory Initial Login Gate */}
      <LoginGate
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          addToast('success', `¡Bienvenido ${loggedInUser.name}! Acceso verificado`);
        }}
      />

      {/* Top Navbar Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeFile={activeFile}
        user={user}
        selectedCurrency={selectedCurrency}
        currentTheme={currentTheme}
        onThemeChange={(t) => ThemeService.setTheme(t)}
        onExportCSV={handleExportCSV}
        onExportReport={handleExportReport}
        onOpenXmlModal={() => setIsXmlModalOpen(true)}
        onOpenValidationModal={() => setIsValidationModalOpen(true)}
        onLoadSample={() =>
          handleLoadSampleXml(
            SAMPLE_CAMT_ITAU_PARAGUAY,
            'Extracto_Itau_Paraguay_SIPAP_CAMT053.xml'
          )
        }
        onDownloadSingleHtml={handleDownloadSingleHtml}
        onOpenThesis={() => setIsThesisModalOpen(true)}
        onOpenZipExporter={() => setIsZipModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCompanyManager={() => setIsCompanyModalOpen(true)}
        onOpenUserManager={() => setIsUserManagerModalOpen(true)}
        onOpenSystemInfo={() => setIsSystemInfoModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          files={files}
          activeFileId={activeFileId}
          onSelectFile={(id) => {
            setActiveFileId(id);
            setCounterpartyFilter(undefined);
            const selected = files.find((f) => f.id === id);
            if (selected) {
              setSelectedCurrency(selected.data.moneda || 'PYG');
            }
          }}
          onRemoveFile={handleRemoveFile}
          onLoadFiles={handleLoadFiles}
          onLoadSampleXml={handleLoadSampleXml}
        />

        {/* Center/Right Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Active Company Banner (Blockchain X Card Style) */}
          <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#146ef5]/10 text-[#146ef5] flex items-center justify-center border border-[#146ef5]/20 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Empresa Activa: {activeCompany.name} ({activeCompany.ruc})
                  </h3>
                  <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    {activeCompany.industry}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-1">
                  Banco Vinculado: <span className="font-semibold text-[#146ef5]">{activeCompany.bank}</span> · Cuenta: <span className="font-mono text-slate-700 dark:text-slate-300">{activeCompany.accountNumber}</span> · Ciudad: {activeCompany.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#222733] text-slate-700 dark:text-slate-300 hover:border-[#146ef5]/50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-[#146ef5]" />
                <span>Gestionar las 4 Empresas</span>
              </button>
              <button
                type="button"
                onClick={() => setIsThesisModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#146ef5] text-white hover:bg-[#0f55d9] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#146ef5]/25"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Memoria de Tesis</span>
              </button>
            </div>
          </div>

          {!activeFile ? (
            /* Empty State */
            <div className="max-w-xl mx-auto my-16 text-center bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-3xl p-8 sm:p-10 shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#146ef5] via-[#4353ff] to-[#00d2ff] flex items-center justify-center mx-auto mb-4 text-white font-extrabold text-2xl shadow-xl shadow-[#146ef5]/25 border border-white/20">
                CP
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                ConciliaPyme · Visor CAMT Profesional
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-2 leading-relaxed max-w-md mx-auto">
                Carga un extracto bancario en formato XML estándar ISO 20022 (Banco Itaú Paraguay o ueno bank) para analizar transacciones, saldos y flujo de tesorería.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleLoadSampleXml(
                      SAMPLE_CAMT_ITAU_PARAGUAY,
                      'Extracto_Itau_Paraguay_SIPAP_CAMT053.xml'
                    )
                  }
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#146ef5] hover:bg-[#0f55d9] text-white transition-all shadow-md shadow-[#146ef5]/25 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Probar con Itaú Paraguay (SIPAP)</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab 1: Visor Principal */}
              {currentTab === 'visor' && (
                <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in duration-200">
                  {/* KPI Cards Grid */}
                  <KpiGrid data={activeFile.data} />

                  {/* Account Information Card */}
                  <AccountInfoCard
                    data={activeFile.data}
                    filename={activeFile.name}
                    onOpenValidationModal={() => setIsValidationModalOpen(true)}
                  />

                  {/* Visual Analytics Charts */}
                  <ChartsSection data={activeFile.data} />

                  {/* Top Counterparties ranking */}
                  <TopCounterparties
                    counterparties={activeFile.data.topContrapartes}
                    currency={activeFile.data.moneda}
                    onSelectCounterparty={handleSelectCounterparty}
                  />

                  {/* Full sortable and filterable transactions table */}
                  <TransactionsTable
                    transactions={activeFile.data.movimientos}
                    currency={activeFile.data.moneda}
                    onFilterCounterparty={counterpartyFilter}
                    onClearCounterpartyFilter={() => setCounterpartyFilter(undefined)}
                  />
                </div>
              )}

              {/* Tab 2: Executive Cash Flow Report */}
              {currentTab === 'informe' && (
                <ReportView
                  file={activeFile}
                  onExportReport={handleExportReport}
                  onExportCSV={handleExportCSV}
                  onSwitchToVisor={() => setCurrentTab('visor')}
                />
              )}

              {/* Tab 3: Reconciliation Matcher */}
              {currentTab === 'conciliar' && (
                <ReconciliationMatcher
                  transactions={activeFile.data.movimientos}
                  currency={activeFile.data.moneda}
                  activeFile={activeFile}
                  activeCompany={activeCompany}
                  user={user}
                  onShowToast={addToast}
                />
              )}

              {/* Tab 4: International Standards & Global Financial Audit */}
              {currentTab === 'estandares' && (
                <InternationalStandardsView
                  file={activeFile}
                  currency={activeFile.data.moneda}
                  activeCompany={activeCompany}
                  user={user}
                  onShowToast={addToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Raw XML Inspector Modal */}
      {activeFile && (
        <XmlPreviewModal
          isOpen={isXmlModalOpen}
          onClose={() => setIsXmlModalOpen(false)}
          xmlContent={activeFile.raw}
          fileName={activeFile.name}
        />
      )}

      {/* ISO 20022 XSD Validation Audit Report Modal */}
      {activeFile && (
        <ValidationReportModal
          isOpen={isValidationModalOpen}
          onClose={() => setIsValidationModalOpen(false)}
          report={activeFile.data.validation}
          fileName={activeFile.name}
          onOpenXmlViewer={() => setIsXmlModalOpen(true)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onShowToast={addToast}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={(c) => setSelectedCurrency(c)}
        currentTheme={currentTheme}
        onThemeChange={(t) => ThemeService.setTheme(t)}
        onOpenCompanyManager={() => setIsCompanyModalOpen(true)}
        onOpenUserManager={() => setIsUserManagerModalOpen(true)}
      />

      {/* Academic Thesis Modal */}
      <ThesisModal
        isOpen={isThesisModalOpen}
        onClose={() => setIsThesisModalOpen(false)}
        onShowToast={addToast}
      />

      {/* ZIP Exporter Modal */}
      <ZipExporterModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
        onShowToast={addToast}
      />

      {/* Google Auth & User Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onShowToast={addToast}
        onLogoutRequested={() => {
          setUser(null);
        }}
      />

      {/* Company Manager Modal (4 Paraguayan Companies) */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onShowToast={addToast}
      />

      {/* Commercial User & Client Accounts Manager */}
      <UserManagerModal
        isOpen={isUserManagerModalOpen}
        onClose={() => setIsUserManagerModalOpen(false)}
        onShowToast={addToast}
      />

      {/* System Information & Editable Improvement Changelog */}
      <SystemInfoModal
        isOpen={isSystemInfoModalOpen}
        onClose={() => setIsSystemInfoModalOpen(false)}
        onShowToast={addToast}
      />

      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
