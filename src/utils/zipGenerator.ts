import JSZip from 'jszip';
import { generateSingleHtmlFile } from './generateSingleHtml';
import { SAMPLE_CAMT_FILES } from './sampleData';
import { SAMPLE_CAMT_ITAU_PARAGUAY } from './paraguayBanking';

export async function createFullProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // 1. README & Thesis Documentation
  zip.file(
    'README.md',
    `# ConciliaPyme · Visor y Conciliador CAMT ISO 20022 para PYMEs (Paraguay & Latam)

Sistema web profesional de alto rendimiento para la lectura, visualización, conciliación bancaria y auditoría de extractos bancarios en formato estándar internacional **ISO 20022 (CAMT.052, CAMT.053, CAMT.054)** y transacciones **SIPAP**.

Desarrollado con arquitectura **Clean Architecture + Adapter Pattern**, privacidad por diseño (procesamiento 100% en cliente) y diseñado tanto para su defensa como **Tesis de Grado en Ingeniería Informática** como para su comercialización como **SaaS B2B para PYMEs**.

---

## 🚀 Despliegue Rápido en Cualquier Servidor

### Requisitos
- Node.js 18+ o superior
- npm o pnpm o yarn

### Pasos
\`\`\`bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (opcional)
cp .env.example .env

# 3. Iniciar en modo desarrollo
npm run dev

# 4. Compilar para producción (genera carpeta dist/)
npm run build
\`\`\`

---

## 🌐 Opciones de Despliegue en la Nube

1. **Vercel**: \`vercel deploy\` (incluye \`vercel.json\` preconfigurado).
2. **Netlify**: Arrastra la carpeta \`dist/\` o conecta con Git (\`netlify.toml\` incluido).
3. **Cloudflare Pages / Firebase Hosting**: \`dist/\` como directorio estático.
4. **Docker / VPS (Nginx / Linux)**:
   \`\`\`bash
   docker build -t conciliapyme-app .
   docker run -p 8080:80 conciliapyme-app
   \`\`\`

---

## 🔒 Privacidad y Seguridad
Los ficheros XML bancarios son procesados directamente en la memoria del navegador del usuario mediante el DOMParser nativo. Ningún dato bancario confidencial viaja a servidores externos a menos que se configure explícitamente un Storage Provider corporativo.
`
  );

  // 2. Academic Thesis Document
  zip.file(
    'TESIS_INFORMATICA_PARAGUAY.md',
    `# PROYECTO DE TESIS DE GRADO EN INGENIERÍA INFORMÁTICA
## Título: "Plataforma Web Basada en Arquitectura Modular y Privacidad por Diseño para la Automatización de la Conciliación Bancaria y Análisis Financiero en Formato ISO 20022 (CAMT/SIPAP) en Pequeñas y Medianas Empresas (PYMEs) del Paraguay"

### Autor: Tesista / Investigador en Informática
### País: Paraguay · Año Lectivo: 2026

---

## 1. INTRODUCCIÓN Y PLANTEAMIENTO DEL PROBLEMA
En el ecosistema empresarial del Paraguay, la mayoría de las PYMEs gestionan su conciliación bancaria mediante planillas manuales en hojas de cálculo o visualizadores PDF proveídos por los bancos. Con la modernización del Sistema de Pagos del Paraguay (**SIPAP - BCP**) y la adopción progresiva del estándar financiero internacional **ISO 20022 (mensajería CAMT.052, CAMT.053 y CAMT.054)**, las entidades bancarias generan archivos estructurados en XML de alta granularidad.

Sin embargo, las PYMEs carecen de herramientas asequibles que procesen estos archivos sin comprometer el secreto bancario y la privacidad de sus movimientos.

### Objetivos:
1. **Objetivo General**: Diseñar e implementar un sistema web desacoplado y seguro que interprete extractos bancarios ISO 20022 CAMT y facilite la conciliación automática en moneda local (Guaraníes PYG) y divisas (USD).
2. **Objetivos Específicos**:
   - Implementar un motor de parsing XML client-side Zero-Trust.
   - Diseñar un módulo de autenticación federada con Google OAuth 2.0 (Google Identity Services).
   - Crear una capa de abstracción desacoplada de almacenamiento (**Storage Adapter**) con compatibilidad para Supabase, Firebase Storage, AWS S3 y almacenamiento local.
   - Integrar telemetría y métricas de uso anónimas con Google Analytics 4 (GA4).
   - Generar cuadres de caja matemáticos y exportaciones normalizadas compatibles con la Facturación Electrónica Nacional (SIFEN - DNIT).

---

## 2. ARQUITECTURA DE SOFTWARE
El proyecto sigue el paradigma de **Clean Architecture** y el patrón de diseño **Adapter (GoF)**:

\`\`\`
+-------------------------------------------------------------+
|                      CAPA DE PRESENTACIÓN                   |
|   React 19 + TypeScript + Tailwind CSS + Lucide Icons       |
|   (Vistas: Dashboard KPIs, Analizador CAMT, Conciliador)   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                      CAPA DE DOMINIO                        |
|   - ISO 20022 Parser (CAMT.052, CAMT.053, CAMT.054, SIPAP)  |
|   - Reglas de Conciliación y Detección de Comisiones Bancarias|
|   - Algoritmo de Cuadre de Saldos (Inicial + Cred - Deb = Fin)|
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    CAPA DE INFRAESTRUCTURA                  |
|   - AuthService (Google Identity Services / OAuth 2.0)     |
|   - StorageService (Local / Supabase / Firebase / S3 Driver)|
|   - AnalyticsService (GA4 Gtag Integration)                |
|   - ExportService (CSV BOM UTF-8 / Standalone HTML / ZIP)   |
+-------------------------------------------------------------+
\`\`\`

---

## 3. VIABILIDAD ECONÓMICA Y MODELO DE NEGOCIO EN PARAGUAY
- **Público Objetivo**: Empresas comerciales, constructoras, agroservicios y estudios contables en Asunción, Ciudad del Este y Encarnación.
- **Planes Propuestos**:
  - Plan Básico (Gratuito / Local): Uso ilimitado en navegador sin coste de servidor.
  - Plan Pro PYME (Gs. 150.000 / mes): Guardado en la nube (Supabase/S3), multi-banco y exportaciones automáticas.
  - Plan Corporativo / Estudios Contables (Gs. 450.000 / mes): Conciliación masiva multi-empresa y soporte prioritario.
`
  );

  // 3. Deployment Manual
  zip.file(
    'MANUAL_DESPLIEGUE_PYME.md',
    `# Guía de Despliegue de ConciliaPyme

### Opción A: Despliegue Estático en Vercel (Recomendado)
1. Instala Vercel CLI: \`npm i -g vercel\`
2. En la raíz del proyecto ejecuta: \`vercel\`
3. Todo funcionará automáticamente usando el archivo \`vercel.json\`.

### Opción B: Despliegue en Netlify
1. Arrastra la carpeta \`dist/\` tras ejecutar \`npm run build\` a https://app.netlify.com/drop.

### Opción C: Despliegue con Docker
\`\`\`bash
docker build -t conciliapyme .
docker run -d -p 80:80 --name conciliapyme-app conciliapyme
\`\`\`
`
  );

  // 4. Configuration Files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'conciliapyme-visor-camt',
        private: true,
        version: '1.0.0',
        description: 'Visor y Conciliador de Extractos Bancarios ISO 20022 CAMT para PYMEs y Tesis en Informática',
        type: 'module',
        scripts: {
          dev: 'vite --port=3000 --host=0.0.0.0',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'tsc --noEmit',
        },
        dependencies: {
          '@tailwindcss/vite': '^4.1.14',
          '@vitejs/plugin-react': '^5.0.4',
          clsx: '^2.1.1',
          'lucide-react': '^0.546.0',
          motion: '^12.23.24',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          recharts: '^3.10.1',
          'tailwind-merge': '^3.6.0',
          jszip: '^3.10.1',
          vite: '^6.2.3',
        },
        devDependencies: {
          '@types/node': '^22.14.0',
          '@types/react': '^19.0.1',
          '@types/react-dom': '^19.0.1',
          '@types/jszip': '^3.4.1',
          autoprefixer: '^10.4.21',
          tailwindcss: '^4.1.14',
          typescript: '~5.8.2',
        },
      },
      null,
      2
    )
  );

  zip.file(
    '.env.example',
    `# ==========================================
# CONCILIAPYME - VARIABLES DE ENTORNO
# ==========================================

# Google Authentication (Google Identity Services)
VITE_GOOGLE_CLIENT_ID=""

# Google Analytics 4
VITE_GA_MEASUREMENT_ID=""

# Storage Provider ('local' | 'supabase' | 'firebase' | 's3' | 'custom_api')
VITE_STORAGE_PROVIDER="local"

# Configuración Supabase (si aplica)
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
VITE_SUPABASE_BUCKET="camt-statements"

# Configuración AWS S3 / Cloudflare R2 (si aplica)
VITE_S3_ENDPOINT=""
VITE_S3_BUCKET="camt-bucket"
VITE_S3_REGION="us-east-1"
VITE_S3_ACCESS_KEY_ID=""
VITE_S3_SECRET_ACCESS_KEY=""

# Configuración Firebase (si aplica)
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
`
  );

  zip.file(
    'vercel.json',
    JSON.stringify(
      {
        rewrites: [{ source: '/(.*)', destination: '/index.html' }],
      },
      null,
      2
    )
  );

  zip.file(
    'netlify.toml',
    `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`
  );

  zip.file(
    'Dockerfile',
    `# Etapa 1: Compilación
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx ultra-ligero
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`
  );

  zip.file(
    'nginx.conf',
    `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
`
  );

  zip.file(
    'vite.config.ts',
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
`
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
      },
      null,
      2
    )
  );

  zip.file(
    'index.html',
    `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c47046'><path d='M3 3h18v18H3z'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ConciliaPyme · Visor CAMT Profesional</title>
    <!-- Google Identity Services for Google Auth -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  </head>
  <body class="bg-[#0a0c10] text-[#e8e5df]">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  // Single HTML bundle file
  zip.file('dist_single_standalone.html', generateSingleHtmlFile());

  // Sample XMLs for testing
  const samplesFolder = zip.folder('sample_xmls');
  if (samplesFolder) {
    samplesFolder.file('extracto_santander_camt053.xml', SAMPLE_CAMT_FILES[0].xml);
    samplesFolder.file('extracto_bbva_camt052.xml', SAMPLE_CAMT_FILES[1].xml);
    samplesFolder.file('extracto_itau_paraguay_sipap_camt053.xml', SAMPLE_CAMT_ITAU_PARAGUAY);
  }

  return await zip.generateAsync({ type: 'blob' });
}
