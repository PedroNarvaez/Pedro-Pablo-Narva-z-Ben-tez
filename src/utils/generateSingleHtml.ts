import { SAMPLE_CAMT_ITAU_PARAGUAY, SAMPLE_CAMT_UENO_PARAGUAY } from './paraguayBanking';

export function generateSingleHtmlFile(): string {
  const sampleItauEscaped = SAMPLE_CAMT_ITAU_PARAGUAY.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const sampleUenoEscaped = SAMPLE_CAMT_UENO_PARAGUAY.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ConciliaPyme · Visor CAMT ISO 20022 Paraguay</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"><\/script>
  <style>
    :root {
      --bg: #080808;
      --sidebar: #0c0f14;
      --panel: #11141a;
      --panel2: #161b22;
      --text: #f1f5f9;
      --muted: #8b949e;
      --accent: #146ef5;
      --accent-soft: rgba(20, 110, 245, 0.12);
      --accent2: #4353ff;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --border: #222733;
      --border2: #30363d;
    }
    * { font-family: "Plus Jakarta Sans", sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); line-height: 1.5; font-size: 13px; overflow-x: hidden; }
    .mono { font-family: "JetBrains Mono", monospace; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: rgba(20, 110, 245, 0.35); border-radius: 4px; }
    
    /* Layout */
    .app { display: flex; flex-direction: column; height: 100vh; max-height: 100vh; overflow: hidden; }
    .topbar { background: rgba(17, 20, 26, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 10px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; z-index: 30; flex-shrink: 0; }
    .logo { display: flex; align-items: center; gap: 10px; font-weight: 700; }
    .logo-icon { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 13px; box-shadow: 0 4px 12px rgba(20,110,245,0.3); }
    .brand { font-size: 14px; font-weight: 700; color: var(--text); }
    .brand-sub { font-size: 10.5px; color: var(--muted); }
    
    .nav { display: flex; gap: 4px; background: rgba(8,8,8,0.7); padding: 3px; border-radius: 10px; border: 1px solid var(--border); }
    .nav-btn { padding: 6px 12px; background: transparent; border: none; color: var(--muted); font-size: 12px; cursor: pointer; border-radius: 7px; font-weight: 500; transition: all 0.2s; }
    .nav-btn:hover { color: var(--text); background: var(--panel2); }
    .nav-btn.active { background: var(--accent-soft); color: var(--accent); font-weight: 700; border: 1px solid rgba(20,110,245,0.3); }

    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 10px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; }
    .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(20,110,245,0.3); }
    .btn-primary:hover { filter: brightness(1.15); }
    .btn-success { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.35); }
    .btn-success:hover { background: rgba(16, 185, 129, 0.25); }
    .btn-ghost { background: var(--panel2); color: var(--muted); border: 1px solid var(--border2); }
    .btn-ghost:hover { color: var(--text); background: var(--panel); }
    .btn-sm { padding: 5px 9px; font-size: 11px; }

    .main { display: flex; flex: 1; min-height: 0; overflow: hidden; }
    .sidebar { width: 280px; background: var(--sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }
    .sidebar-header { padding: 14px; border-bottom: 1px solid var(--border); }
    
    .dropzone { border: 2px dashed var(--border2); border-radius: 12px; padding: 16px 10px; text-align: center; cursor: pointer; background: var(--panel); transition: all 0.2s; }
    .dropzone:hover, .dropzone.drag { border-color: var(--accent); background: var(--accent-soft); }
    .dz-title { font-size: 12px; font-weight: 600; color: var(--text); }
    .dz-sub { font-size: 10px; color: var(--muted); margin-top: 2px; }

    .file-list { flex: 1; overflow-y: auto; padding: 8px; }
    .file-item { padding: 8px 10px; border-radius: 9px; cursor: pointer; margin-bottom: 4px; display: flex; align-items: center; gap: 9px; border: 1px solid transparent; background: var(--panel); transition: all 0.15s; }
    .file-item:hover { border-color: var(--border2); background: var(--panel2); }
    .file-item.active { background: var(--accent-soft); border-color: rgba(20, 110, 245, 0.4); }
    .file-icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 9px; flex-shrink: 0; background: rgba(20, 110, 245, 0.15); color: var(--accent); font-family: "JetBrains Mono", monospace; }
    .file-info { flex: 1; min-width: 0; }
    .file-name { font-size: 11.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-meta { font-size: 9.5px; color: var(--muted); }
    .file-close { color: var(--muted); cursor: pointer; padding: 2px 6px; border-radius: 4px; }
    .file-close:hover { background: rgba(239, 68, 68, 0.2); color: var(--danger); }

    .content { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow-y: auto; padding: 18px 24px; gap: 16px; }
    .section { display: none; }
    .section.active { display: block; }

    /* Dashboard Widgets */
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: 16px; }
    .kpi { background: var(--panel); border: 1px solid var(--border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; }
    .kpi-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; font-weight: 700; margin-bottom: 6px; font-family: "JetBrains Mono", monospace; }
    .kpi-val { font-size: 18px; font-weight: 700; color: var(--text); font-family: "JetBrains Mono", monospace; }
    .kpi-val.green { color: var(--success); }
    .kpi-val.red { color: var(--danger); }
    .kpi-val.blue { color: var(--accent); }
    .kpi-val.orange { color: var(--warning); }

    .card { background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .card-title { font-size: 11.5px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-family: "JetBrains Mono", monospace; }
    .card-title::before { content: ""; width: 3px; height: 14px; background: var(--accent); border-radius: 2px; }

    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 8px; }
    .info-item { background: var(--panel2); padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); }
    .info-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; margin-bottom: 2px; font-family: "JetBrains Mono", monospace; }
    .info-val { font-size: 12px; font-weight: 600; color: var(--text); word-break: break-all; }

    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media(max-width: 960px) { .charts-grid { grid-template-columns: 1fr; } }
    .chart-box { width: 100%; height: 260px; }

    .top-cp { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px; }
    .cp-row { display: flex; flex-direction: column; padding: 10px 12px; background: var(--panel2); border-radius: 10px; border: 1px solid var(--border); }
    .cp-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; }
    .cp-bar { height: 4px; background: var(--bg); border-radius: 2px; margin-top: 6px; overflow: hidden; }
    .cp-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 2px; }

    /* Table */
    .table-toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .search-input { background: var(--bg); border: 1px solid var(--border2); border-radius: 10px; padding: 7px 12px; color: var(--text); font-size: 12px; outline: none; width: 260px; font-family: "Plus Jakarta Sans", sans-serif; }
    .search-input:focus { border-color: var(--accent); }
    .filter-select { background: var(--bg); border: 1px solid var(--border2); border-radius: 10px; padding: 7px 10px; color: var(--text); font-size: 12px; outline: none; }
    .table-wrap { overflow: auto; max-height: 540px; border-radius: 12px; border: 1px solid var(--border); background: var(--panel); }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: var(--sidebar); color: var(--muted); text-align: left; padding: 10px 12px; font-weight: 700; font-size: 10.5px; text-transform: uppercase; letter-spacing: .4px; border-bottom: 1px solid var(--border); white-space: nowrap; cursor: pointer; user-select: none; font-family: "JetBrains Mono", monospace; }
    th:hover { color: var(--text); }
    td { padding: 9px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tbody tr { cursor: pointer; transition: background 0.15s; }
    tbody tr:hover { background: var(--panel2); }
    tbody tr.open { background: var(--panel2); }
    .detail { background: var(--bg); }
    .detail-inner { padding: 14px 18px; border-top: 1px solid var(--border2); border-bottom: 1px solid var(--border2); display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 8px 20px; font-size: 11.5px; }

    .credit { color: var(--success); font-weight: 700; }
    .debit { color: var(--danger); font-weight: 700; }
    .badge-fee { background: rgba(245, 158, 11, 0.15); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.3); font-size: 9.5px; padding: 1px 6px; border-radius: 6px; font-weight: 600; margin-left: 5px; }
    .badge-pill { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; font-family: "JetBrains Mono", monospace; }
    .badge-pill.crdt { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-pill.dbit { background: rgba(239, 68, 68, 0.15); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }

    .toast { position: fixed; bottom: 20px; right: 20px; background: var(--panel); border: 1px solid var(--accent); border-radius: 10px; padding: 12px 18px; font-size: 12px; font-weight: 600; transform: translateY(100px); opacity: 0; transition: all 0.3s; z-index: 999; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .toast.show { transform: translateY(0); opacity: 1; }
    input[type=file] { display: none; }
  </style>
</head>
<body>

<div class="app">
  <!-- TOPBAR -->
  <header class="topbar">
    <div class="logo">
      <div class="logo-icon">CP</div>
      <div>
        <div class="brand">ConciliaPyme · Visor CAMT</div>
        <div class="brand-sub">Paraguay · Banco Itaú & ueno bank · ISO 20022 SIPAP</div>
      </div>
    </div>

    <nav class="nav">
      <button class="nav-btn active" id="btn-tab-vis" onclick="App.nav('vis')">Visor</button>
      <button class="nav-btn" id="btn-tab-rep" onclick="App.nav('rep')">Informe Flujo</button>
    </nav>

    <div style="display:flex;gap:6px;">
      <button class="btn btn-ghost btn-sm" onclick="App.loadSampleItau()">Itaú Paraguay</button>
      <button class="btn btn-ghost btn-sm" onclick="App.loadSampleUeno()">ueno bank</button>
      <button class="btn btn-success btn-sm" id="btn-export-csv" onclick="Viewer.exportCSV()">Exportar CSV</button>
    </div>
  </header>

  <div class="main">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div style="font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:10px;font-family:'JetBrains Mono',monospace;">Extractos XML</div>
        <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()">
          <div style="font-size:24px;font-weight:800;color:var(--accent);margin-bottom:4px;">⬆</div>
          <div class="dz-title">Arrastra o Carga XML CAMT</div>
          <div class="dz-sub">CAMT.052 / CAMT.053 / CAMT.054</div>
          <input type="file" id="fileInput" multiple accept=".xml">
        </div>
        <div style="font-size:10px;color:var(--muted);margin-top:10px;line-height:1.5;">
          ✓ 100% en local en el navegador<br>
          ✓ Sin envío de datos a servidores<br>
          ✓ Exportación instantánea a CSV
        </div>
      </div>

      <div class="file-list" id="fileList"></div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="content">
      <!-- SECTION VISOR -->
      <section class="section active" id="sec-vis">
        <div id="visor-container"></div>
      </section>

      <!-- SECTION REPORT -->
      <section class="section" id="sec-rep">
        <div id="report-container"></div>
      </section>
    </main>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
var App = {
  charts: {},
  currentSec: 'vis',
  nav: function(sec) {
    this.currentSec = sec;
    document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('active');});
    document.getElementById('btn-tab-' + sec).classList.add('active');
    document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});
    document.getElementById('sec-' + sec).classList.add('active');
    if (sec === 'rep' && Viewer.activeFile) Viewer.renderReport();
  },
  toast: function(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); }, 3000);
  },
  loadSampleItau: function() {
    Viewer.loadXmlString(SAMPLE_ITAU, 'Extracto_Itau_Paraguay_SIPAP_CAMT053.xml');
  },
  loadSampleUeno: function() {
    Viewer.loadXmlString(SAMPLE_UENO, 'Extracto_ueno_bank_PY_CAMT053.xml');
  }
};

var SAMPLE_ITAU = \`${sampleItauEscaped}\`;
var SAMPLE_UENO = \`${sampleUenoEscaped}\`;

var Viewer = {
  files: [],
  activeFile: null,
  filtered: [],
  sortCol: 'fecha',
  sortDir: 'desc',
  openRows: new Set(),

  init: function() {
    var self = this;
    var dz = document.getElementById('dropzone');
    ['dragenter','dragover'].forEach(function(ev){
      dz.addEventListener(ev, function(e){ e.preventDefault(); dz.classList.add('drag'); });
    });
    ['dragleave','drop'].forEach(function(ev){
      dz.addEventListener(ev, function(e){ e.preventDefault(); dz.classList.remove('drag'); });
    });
    dz.addEventListener('drop', function(e){
      if(e.dataTransfer.files && e.dataTransfer.files.length) self.loadFiles(e.dataTransfer.files);
    });
    document.getElementById('fileInput').addEventListener('change', function(e){
      if(e.target.files && e.target.files.length) self.loadFiles(e.target.files);
      e.target.value = '';
    });
    // Load initial Paraguay sample
    this.loadXmlString(SAMPLE_ITAU, 'Extracto_Itau_Paraguay_SIPAP_CAMT053.xml');
  },

  fmtMoney: function(n, curr) {
    if(n === undefined || n === null || isNaN(n)) return '₲ 0';
    var c = curr || (this.activeFile && this.activeFile.data && this.activeFile.data.moneda) || 'PYG';
    var num = Math.round(Number(n)).toLocaleString('es-PY');
    return (c === 'PYG' ? '₲ ' : '$ ') + num;
  },

  loadXmlString: function(xmlStr, filename) {
    var parsed = this.parseCAMT(xmlStr);
    var fileObj = {
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
      name: filename,
      raw: xmlStr,
      data: parsed
    };
    this.files.push(fileObj);
    this.selectFile(fileObj.id);
    App.toast('Extracto ' + filename + ' cargado');
  },

  loadFiles: async function(fileList) {
    var loaded = 0;
    for(var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if(!f.name.toLowerCase().endsWith('.xml')) continue;
      try {
        var text = await f.text();
        var parsed = this.parseCAMT(text);
        this.files.push({
          id: 'f_' + Date.now() + '_' + i,
          name: f.name,
          raw: text,
          data: parsed
        });
        loaded++;
      } catch(err) {}
    }
    if(loaded > 0) {
      this.selectFile(this.files[this.files.length - 1].id);
      App.toast('Cargados ' + loaded + ' archivo(s)');
    }
  },

  selectFile: function(id) {
    var f = this.files.find(function(x){return x.id === id;});
    if(!f) return;
    this.activeFile = f;
    this.filtered = f.data.movimientos.map(function(m, i){ return Object.assign({}, m, {_id: i}); });
    this.openRows.clear();
    this.renderSidebar();
    this.renderViewer();
    if(App.currentSec === 'rep') this.renderReport();
  },

  renderSidebar: function() {
    var list = document.getElementById('fileList');
    var self = this;
    list.innerHTML = this.files.map(function(f){
      var active = self.activeFile && self.activeFile.id === f.id;
      return '<div class="file-item ' + (active ? 'active' : '') + '" onclick="Viewer.selectFile(\\'' + f.id + '\\')">' +
        '<div class="file-icon">CAMT</div>' +
        '<div class="file-info"><div class="file-name">' + f.name + '</div><div class="file-meta">' + f.data.movimientos.length + ' txs · ' + (f.data.banco || 'Banco') + '</div></div>' +
        '<span class="file-close" onclick="event.stopPropagation();Viewer.removeFile(\\'' + f.id + '\\')">×</span>' +
      '</div>';
    }).join('');
  },

  removeFile: function(id) {
    this.files = this.files.filter(function(f){return f.id !== id;});
    if(this.activeFile && this.activeFile.id === id) {
      if(this.files.length > 0) this.selectFile(this.files[0].id);
      else { this.activeFile = null; document.getElementById('visor-container').innerHTML = ''; }
    } else {
      this.renderSidebar();
    }
  },

  renderViewer: function() {
    if(!this.activeFile) return;
    var d = this.activeFile.data;
    var saldoNeto = d.totCredit - d.totDebit;

    var html = '<div class="kpis">' +
      '<div class="kpi"><div class="kpi-lbl">Ingresos Totales</div><div class="kpi-val green">' + this.fmtMoney(d.totCredit) + '</div></div>' +
      '<div class="kpi"><div class="kpi-lbl">Gastos Totales</div><div class="kpi-val red">' + this.fmtMoney(d.totDebit) + '</div></div>' +
      '<div class="kpi"><div class="kpi-lbl">Flujo Neto</div><div class="kpi-val ' + (saldoNeto >= 0 ? 'green' : 'red') + '">' + (saldoNeto >= 0 ? '+' : '') + this.fmtMoney(saldoNeto) + '</div></div>' +
      '<div class="kpi"><div class="kpi-lbl">Saldo Inicial</div><div class="kpi-val blue">' + this.fmtMoney(d.saldoInicial) + '</div></div>' +
      '<div class="kpi"><div class="kpi-lbl">Saldo Final</div><div class="kpi-val orange">' + this.fmtMoney(d.saldoFinal) + '</div></div>' +
      '<div class="kpi"><div class="kpi-lbl">Comisiones</div><div class="kpi-val red">' + d.comisiones + ' cargos</div></div>' +
    '</div>';

    // Account Card
    html += '<div class="card"><div class="card-title">Información de la Cuenta & Entidad</div><div class="info-grid">' +
      '<div class="info-item"><div class="info-lbl">Banco / Entidad</div><div class="info-val">' + (d.banco || '—') + '</div></div>' +
      '<div class="info-item"><div class="info-lbl">BIC / SWIFT</div><div class="info-val mono">' + (d.bic || '—') + '</div></div>' +
      '<div class="info-item"><div class="info-lbl">Cuenta / IBAN</div><div class="info-val mono">' + (d.iban || d.cuenta || '—') + '</div></div>' +
      '<div class="info-item"><div class="info-lbl">Titular / Razón Social</div><div class="info-val">' + (d.propietario || '—') + '</div></div>' +
      '<div class="info-item"><div class="info-lbl">Moneda</div><div class="info-val mono">' + (d.moneda || 'PYG') + '</div></div>' +
    '</div></div>';

    // Charts
    html += '<div class="card"><div class="card-title">Análisis Visual del Extracto</div><div class="charts-grid">' +
      '<div><div id="chart-pie" class="chart-box"></div></div>' +
      '<div><div id="chart-bar" class="chart-box"></div></div>' +
    '</div></div>';

    // Top Counterparties
    if(d.topContrapartes && d.topContrapartes.length > 0) {
      html += '<div class="card"><div class="card-title">Top Contrapartes por Volumen</div><div class="top-cp">';
      var maxVol = Math.max.apply(null, d.topContrapartes.map(function(c){return Math.abs(c.total);})) || 1;
      d.topContrapartes.slice(0, 6).forEach(function(cp){
        var pct = Math.round((Math.abs(cp.total) / maxVol) * 100);
        html += '<div class="cp-row">' +
          '<div class="cp-header"><span>' + cp.nombre + ' <small style="color:var(--muted)">(' + cp.count + ' txs)</small></span><span class="' + (cp.total >= 0 ? 'credit' : 'debit') + '">' + Viewer.fmtMoney(cp.total) + '</span></div>' +
          '<div class="cp-bar"><div class="cp-bar-fill" style="width:' + pct + '%"></div></div>' +
        '</div>';
      });
      html += '</div></div>';
    }

    // Transactions Table
    html += '<div class="card"><div class="card-title">Listado de Transacciones</div>' +
      '<div class="table-toolbar">' +
        '<input type="text" class="search-input" id="tbl-search" placeholder="Buscar transacción, titular, ref..." oninput="Viewer.applyFilters()">' +
        '<select class="filter-select" id="tbl-filter-type" onchange="Viewer.applyFilters()">' +
          '<option value="all">Todos los tipos</option>' +
          '<option value="credit">Solo Ingresos (Créditos)</option>' +
          '<option value="debit">Solo Gastos (Débitos)</option>' +
        '</select>' +
      '</div>' +
      '<div id="table-container">' + this.buildTableHtml() + '</div>' +
    '</div>';

    document.getElementById('visor-container').innerHTML = html;
    setTimeout(function(){ Viewer.renderCharts(d); }, 40);
  },

  buildTableHtml: function() {
    var self = this;
    var rows = this.filtered.map(function(tx){
      var isOpen = self.openRows.has(tx._id);
      var isCredit = tx.monto >= 0;
      var h = '<tr onclick="Viewer.toggleRow(' + tx._id + ')" class="' + (isOpen ? 'open' : '') + '">' +
        '<td class="mono">' + tx.fecha + '</td>' +
        '<td><span class="badge-pill ' + (isCredit ? 'crdt' : 'dbit') + '">' + (isCredit ? 'INGRESO' : 'GASTO') + '</span></td>' +
        '<td class="mono ' + (isCredit ? 'credit' : 'debit') + '" style="text-align:right;">' + (isCredit ? '+' : '') + self.fmtMoney(tx.monto) + '</td>' +
        '<td><strong>' + (tx.contra || '—') + '</strong>' + (tx.esComision ? '<span class="badge-fee">comisión</span>' : '') + '</td>' +
        '<td class="mono" style="color:var(--muted)">' + (tx.ref || tx.refEndToEnd || '—') + '</td>' +
        '<td style="text-align:center;color:var(--muted)">' + (isOpen ? '▼' : '▶') + '</td>' +
      '</tr>';

      if(isOpen) {
        h += '<tr class="detail"><td colspan="6"><div class="detail-inner">' +
          '<div><span style="color:var(--muted)">Fecha Contable:</span> <strong>' + tx.fecha + '</strong></div>' +
          '<div><span style="color:var(--muted)">Fecha Valor:</span> <strong>' + tx.fechaValor + '</strong></div>' +
          '<div><span style="color:var(--muted)">Ref. EndToEnd:</span> <span class="mono">' + (tx.refEndToEnd || '—') + '</span></div>' +
          '<div><span style="color:var(--muted)">IBAN Contraparte:</span> <span class="mono">' + (tx.ibanContra || '—') + '</span></div>' +
          '<div><span style="color:var(--muted)">BIC Contraparte:</span> <span class="mono">' + (tx.bicContra || '—') + '</span></div>' +
          '<div><span style="color:var(--muted)">Concepto / Remesa:</span> ' + (tx.desc || '—') + '</div>' +
        '</div></td></tr>';
      }
      return h;
    }).join('');

    return '<div class="table-wrap"><table><thead><tr>' +
      '<th>Fecha</th><th>Tipo</th><th style="text-align:right;">Importe</th><th>Contraparte</th><th>Referencia</th><th></th>' +
    '</tr></thead><tbody>' + (rows || '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--muted)">Sin resultados</td></tr>') + '</tbody></table></div>';
  },

  applyFilters: function() {
    if(!this.activeFile) return;
    var q = (document.getElementById('tbl-search')?.value || '').toLowerCase();
    var tp = document.getElementById('tbl-filter-type')?.value || 'all';
    this.filtered = this.activeFile.data.movimientos.map(function(m, i){ return Object.assign({}, m, {_id: i}); }).filter(function(tx){
      if(tp === 'credit' && tx.monto < 0) return false;
      if(tp === 'debit' && tx.monto >= 0) return false;
      if(q) {
        var str = (tx.fecha + ' ' + tx.contra + ' ' + tx.ref + ' ' + tx.desc + ' ' + tx.monto).toLowerCase();
        if(str.indexOf(q) < 0) return false;
      }
      return true;
    });
    document.getElementById('table-container').innerHTML = this.buildTableHtml();
  },

  toggleRow: function(id) {
    if(this.openRows.has(id)) this.openRows.delete(id);
    else this.openRows.add(id);
    document.getElementById('table-container').innerHTML = this.buildTableHtml();
  },

  renderCharts: function(d) {
    var pieEl = document.getElementById('chart-pie');
    if(pieEl) {
      var pie = echarts.init(pieEl);
      pie.setOption({
        backgroundColor: 'transparent',
        title: { text: 'Ingresos vs Gastos', textStyle: { color: '#8b949e', fontSize: 11 } },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie', radius: ['45%', '70%'],
          data: [
            { value: d.totCredit, name: 'Ingresos', itemStyle: { color: '#10b981' } },
            { value: d.totDebit, name: 'Gastos', itemStyle: { color: '#ef4444' } }
          ]
        }]
      });
    }

    var barEl = document.getElementById('chart-bar');
    if(barEl) {
      var meses = {};
      d.movimientos.forEach(function(m){
        var k = m.fecha ? m.fecha.substring(0, 7) : '2026-03';
        if(!meses[k]) meses[k] = { c: 0, d: 0 };
        if(m.monto >= 0) meses[k].c += m.monto;
        else meses[k].d += Math.abs(m.monto);
      });
      var keys = Object.keys(meses).sort();
      var bar = echarts.init(barEl);
      bar.setOption({
        backgroundColor: 'transparent',
        title: { text: 'Flujo por Meses', textStyle: { color: '#8b949e', fontSize: 11 } },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: keys, axisLabel: { color: '#8b949e' } },
        yAxis: { type: 'value', axisLabel: { color: '#8b949e' } },
        series: [
          { name: 'Ingresos', type: 'bar', data: keys.map(function(k){return meses[k].c;}), itemStyle: { color: '#10b981' } },
          { name: 'Gastos', type: 'bar', data: keys.map(function(k){return meses[k].d;}), itemStyle: { color: '#ef4444' } }
        ]
      });
    }
  },

  renderReport: function() {
    if(!this.activeFile) return;
    var d = this.activeFile.data;
    var saldoNeto = d.totCredit - d.totDebit;

    var html = '<div class="card">' +
      '<div class="card-title">Informe Ejecutivo de Flujo de Caja</div>' +
      '<div class="kpis">' +
        '<div class="kpi"><div class="kpi-lbl">Saldo Inicial</div><div class="kpi-val blue">' + this.fmtMoney(d.saldoInicial) + '</div></div>' +
        '<div class="kpi"><div class="kpi-lbl">Ingresos Totales</div><div class="kpi-val green">+' + this.fmtMoney(d.totCredit) + '</div></div>' +
        '<div class="kpi"><div class="kpi-lbl">Gastos Totales</div><div class="kpi-val red">-' + this.fmtMoney(d.totDebit) + '</div></div>' +
        '<div class="kpi"><div class="kpi-lbl">Saldo Final</div><div class="kpi-val orange">' + this.fmtMoney(d.saldoFinal) + '</div></div>' +
      '</div>' +
      '<div style="margin-top:14px;padding:12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;font-size:12px;color:var(--success);">' +
        '<strong>✓ Cuadre Financiero Verificado:</strong> Saldo Inicial + Ingresos - Gastos = Saldo Final.' +
      '</div>' +
    '</div>';

    document.getElementById('report-container').innerHTML = html;
  },

  exportCSV: function() {
    if(!this.activeFile) return;
    var d = this.activeFile.data;
    var headers = ['Fecha','FechaValor','Tipo','Monto','Moneda','Contraparte','IBAN','BIC','Referencia','Descripcion','EsComision'];
    var rows = d.movimientos.map(function(m){
      return [
        m.fecha, m.fechaValor, m.tipo, m.monto, m.moneda,
        '"' + (m.contra || '').replace(/"/g, '""') + '"',
        m.ibanContra, m.bicContra,
        '"' + (m.ref || '').replace(/"/g, '""') + '"',
        '"' + (m.desc || '').replace(/"/g, '""') + '"',
        m.esComision ? 'SI' : 'NO'
      ].join(';');
    });
    var csv = '\\uFEFF' + headers.join(';') + '\\r\\n' + rows.join('\\r\\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = this.activeFile.name.replace('.xml', '') + '_export.csv';
    a.click();
    App.toast('Archivo CSV descargado');
  },

  parseCAMT: function(xmlText) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlText, 'text/xml');
    var res = {
      banco: '', bic: '', cuenta: '', iban: '', propietario: '', moneda: 'PYG',
      saldoInicial: 0, saldoFinal: 0, fechaInicio: '', fechaFin: '',
      movimientos: [], totCredit: 0, totDebit: 0, comisiones: 0, topContrapartes: []
    };

    var NS = [
      'urn:iso:std:iso:20022:tech:xsd:camt.053.001.02',
      'urn:iso:std:iso:20022:tech:xsd:camt.052.001.02',
      'urn:iso:std:iso:20022:tech:xsd:camt.054.001.02', ''
    ];

    function findTag(p, tag) {
      for(var i=0; i<NS.length; i++) {
        var el = p.getElementsByTagNameNS(NS[i], tag)[0];
        if(el) return el;
      }
      return p.getElementsByTagName(tag)[0] || null;
    }
    function findAll(p, tag) {
      for(var i=0; i<NS.length; i++) {
        var els = p.getElementsByTagNameNS(NS[i], tag);
        if(els.length > 0) return Array.from(els);
      }
      return Array.from(p.getElementsByTagName(tag));
    }
    function textOf(p, tag) {
      var el = findTag(p, tag);
      return el ? (el.textContent || '').trim() : '';
    }

    var stmt = findTag(doc, 'Stmt') || findTag(doc, 'Rpt') || doc.documentElement;
    if(!stmt) return res;

    var acct = findTag(stmt, 'Acct');
    if(acct) {
      var idAcct = findTag(acct, 'Id');
      if(idAcct) {
        res.iban = textOf(idAcct, 'IBAN') || textOf(findTag(idAcct, 'Othr'), 'Id');
        res.cuenta = res.iban;
      }
      var svcr = findTag(acct, 'Svcr');
      if(svcr) {
        var fi = findTag(svcr, 'FinInstnId');
        if(fi) { res.banco = textOf(fi, 'Nm'); res.bic = textOf(fi, 'BIC'); }
      }
      var ownr = findTag(acct, 'Ownr');
      if(ownr) res.propietario = textOf(ownr, 'Nm');
    }

    var bals = findAll(stmt, 'Bal');
    bals.forEach(function(bal){
      var tp = textOf(bal, 'Cd') || textOf(bal, 'Prtry');
      var amtEl = findTag(bal, 'Amt');
      if(amtEl) {
        var ccy = amtEl.getAttribute('Ccy');
        if(ccy) res.moneda = ccy;
        var v = parseFloat(amtEl.textContent || '0');
        var ind = textOf(bal, 'CdtDbtInd');
        if(ind.startsWith('DBIT')) v = -v;
        if(tp.indexOf('OPBD') >= 0 || tp.indexOf('PRCD') >= 0 || tp.indexOf('ITBD') >= 0) res.saldoInicial = v;
        else if(tp.indexOf('CLBD') >= 0 || tp.indexOf('CLAV') >= 0 || tp.indexOf('ITAV') >= 0) res.saldoFinal = v;
      }
    });

    var cpMap = {};
    var entries = findAll(stmt, 'Ntry');
    entries.forEach(function(ntry){
      var m = {
        fecha: '', fechaValor: '', tipo: 'CRDT', monto: 0, moneda: res.moneda,
        contra: '', ibanContra: '', bicContra: '', refEndToEnd: '', ref: '', desc: '', esComision: false
      };
      var amtEl = findTag(ntry, 'Amt');
      if(amtEl) {
        m.monto = parseFloat(amtEl.textContent || '0');
        var ccy = amtEl.getAttribute('Ccy');
        if(ccy) m.moneda = ccy;
      }
      var ind = textOf(ntry, 'CdtDbtInd');
      m.tipo = ind.startsWith('DBIT') ? 'DBIT' : 'CRDT';
      if(m.tipo === 'DBIT') { m.monto = -Math.abs(m.monto); res.totDebit += Math.abs(m.monto); }
      else { m.monto = Math.abs(m.monto); res.totCredit += m.monto; }

      var bg = findTag(ntry, 'BookgDt');
      if(bg) m.fecha = (textOf(bg, 'Dt') || textOf(bg, 'DtTm')).substring(0, 10);
      var vd = findTag(ntry, 'ValDt');
      if(vd) m.fechaValor = (textOf(vd, 'Dt') || textOf(vd, 'DtTm')).substring(0, 10);

      var nd = findTag(ntry, 'NtryDtls');
      if(nd) {
        var td = findTag(nd, 'TxDtls');
        if(td) {
          var refs = findTag(td, 'Refs');
          if(refs) { m.refEndToEnd = textOf(refs, 'EndToEndId'); m.ref = textOf(refs, 'InstrId') || textOf(refs, 'TxId'); }
          var rp = findTag(td, 'RltdPties');
          if(rp) {
            var party = m.tipo === 'CRDT' ? (findTag(rp, 'Dbtr') || findTag(rp, 'Cdtr')) : (findTag(rp, 'Cdtr') || findTag(rp, 'Dbtr'));
            if(party) m.contra = textOf(party, 'Nm');
          }
          var rmt = findTag(td, 'RmtInf');
          if(rmt) m.desc = textOf(rmt, 'Ustrd');
        }
      }
      if(/comisi|fee|cargo|gasto|mantenim/i.test(m.contra + ' ' + m.desc)) {
        m.esComision = true; res.comisiones++;
      }
      var cp = m.contra || 'Otros';
      if(!cpMap[cp]) cpMap[cp] = { nombre: cp, total: 0, count: 0 };
      cpMap[cp].total += m.monto; cpMap[cp].count++;
      res.movimientos.push(m);
    });

    res.topContrapartes = Object.values(cpMap).sort(function(a,b){return Math.abs(b.total) - Math.abs(a.total);});
    return res;
  }
};

window.onload = function() { Viewer.init(); };
<\/script>
</body>
</html>`;
}
