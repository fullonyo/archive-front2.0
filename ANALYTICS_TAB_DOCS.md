# AnalyticsTab - Documentação Completa

## 📊 Visão Geral

O **AnalyticsTab** é um dashboard completo de analytics para o painel admin do Archive Nyo. Implementa visualizações de dados em tempo real, gráficos interativos, e exportação de relatórios.

---

## 🎯 Componentes Criados

### 1. **Chart Components** (Componentes Reutilizáveis)

#### LineChart.jsx (~180 linhas)
- **Propósito**: Gráficos de linha para tendências temporais
- **Features**:
  - Suporte a múltiplos datasets
  - Área preenchida configurável (fill)
  - Linhas curvas (tension)
  - Tooltips customizados com formatação pt-BR
  - Eixos com labels e formatação inteligente (K, M)
  - GPU acceleration e CSS containment
- **Uso**:
```jsx
<LineChart
  labels={['Jan', 'Fev', 'Mar']}
  datasets={[{
    label: 'Novos Usuários',
    data: [120, 150, 180],
    borderColor: 'rgb(99, 102, 241)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)'
  }]}
  title="Crescimento de Usuários"
  height="300px"
  yAxisLabel="Usuários"
/>
```

#### BarChart.jsx (~180 linhas)
- **Propósito**: Gráficos de barras para comparações
- **Features**:
  - Orientação vertical ou horizontal
  - Stacked bars (barras empilhadas)
  - Tooltips com formatação numérica
  - Cores customizáveis por dataset
  - Bordas arredondadas (borderRadius: 4)
  - Limite de largura de barra (maxBarThickness: 60)
- **Uso**:
```jsx
<BarChart
  labels={['Avatars', 'Worlds', 'Props']}
  datasets={[{
    label: 'Downloads',
    data: [450, 320, 180],
    backgroundColor: 'rgba(139, 92, 246, 0.8)'
  }]}
  horizontal={true}
  height="300px"
/>
```

#### DoughnutChart.jsx (~140 linhas)
- **Propósito**: Gráficos de rosca/pizza para distribuições
- **Features**:
  - Legenda com percentuais automáticos
  - 8 cores padrão predefinidas
  - Cores customizáveis
  - Tooltip com valor e percentual
  - Hover offset para destaque
  - Cutout configurável (padrão 60%)
- **Uso**:
```jsx
<DoughnutChart
  labels={['Aprovado', 'Pendente', 'Rejeitado']}
  data={[750, 120, 30]}
  title="Status de Assets"
  height="300px"
/>
```

#### DateRangePicker.jsx (~140 linhas)
- **Propósito**: Seletor de período para filtrar analytics
- **Features**:
  - 9 presets prontos (Hoje, Ontem, Últimos 7/30 dias, etc.)
  - Modo customizado com 2 inputs de data
  - Botões estilizados com estado ativo
  - Callback onChange com datas formatadas
  - Usa date-fns para manipulação de datas
- **Presets disponíveis**:
  - Hoje
  - Ontem
  - Últimos 7 dias
  - Últimos 30 dias
  - Este mês
  - Mês passado
  - Últimos 3 meses
  - Este ano
  - Customizado
- **Uso**:
```jsx
<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onChange={(start, end) => setDateRange({ start, end })}
/>
```

---

### 2. **AnalyticsTab.jsx** (~720 linhas)

#### Estrutura Principal
- 4 subtabs: Overview, Users Analytics, Assets Analytics, Top Lists
- Header com DateRangePicker e botões de exportação (CSV/PDF)
- Loading states e error handling
- Real-time data refresh quando date range muda

#### Subtabs Implementados

##### **OverviewSubtab** (Dashboard Geral)
**Stats Cards**:
- Total de Usuários (com growth %)
- Total de Assets (com growth %)
- Total Downloads (com growth %)
- Taxa de Engagement (com growth %)

**Charts**:
1. **Crescimento de Usuários** (LineChart)
   - Novos usuários ao longo do tempo
   - Área preenchida azul

2. **Uploads de Assets** (BarChart)
   - Assets publicados por período
   - Barras roxas verticais

3. **Distribuição por Categoria** (DoughnutChart)
   - Percentual de assets por categoria
   - Cores variadas

4. **Downloads ao Longo do Tempo** (LineChart)
   - Tendência de downloads
   - Área preenchida verde

##### **UsersAnalyticsSubtab**
**Stats Cards**:
- Novos Usuários
- Usuários Ativos
- Creators
- Taxa de Retenção (%)

**Charts**:
1. **Tendência de Registros** (LineChart)
   - Registros ao longo do tempo
2. **Atividade de Usuários** (BarChart)
   - Usuários ativos por período
3. **Distribuição por Tipo** (DoughnutChart)
   - USER, CREATOR, MODERATOR, ADMIN
4. **Engagement ao Longo do Tempo** (LineChart)
   - Taxa de engagement temporal

##### **AssetsAnalyticsSubtab**
**Stats Cards**:
- Novos Assets
- Total Downloads
- Média Downloads/Asset
- Taxa de Aprovação (%)

**Charts**:
1. **Tendência de Uploads** (LineChart)
   - Uploads ao longo do tempo
2. **Tendência de Downloads** (BarChart)
   - Downloads por período
3. **Performance por Categoria** (BarChart horizontal)
   - Downloads por categoria
4. **Distribuição por Status** (DoughnutChart)
   - Aprovado, Pendente, Rejeitado

##### **TopListsSubtab**
**3 Listas com DataTable**:
1. **Top Creators**
   - Colunas: Rank, Username, Assets Count, Downloads, Avg Rating
   - Top 10 creators por downloads

2. **Top Assets**
   - Colunas: Rank, Title, Category, Downloads, Rating
   - Top 10 assets mais baixados

3. **Top Categorias**
   - Colunas: Rank, Name, Assets Count, Total Downloads, Avg Rating
   - Top 10 categorias por performance

**Seleção de Lista**:
- Botões para alternar entre as 3 listas
- Ícones: Users, Package, Award
- Estado ativo visual

---

### 3. **adminService.js** (5 novos métodos)

```javascript
// 1. Get Analytics Overview
getAnalyticsOverview: async (params = {}) => {
  // params: { startDate, endDate }
  // Retorna: stats, growth, chartData
}

// 2. Get User Analytics
getUserAnalytics: async (params = {}) => {
  // params: { startDate, endDate, metric }
  // Retorna: stats, chartData (registrations, activity, userTypes, engagement)
}

// 3. Get Asset Analytics
getAssetAnalytics: async (params = {}) => {
  // params: { startDate, endDate, metric }
  // Retorna: stats, chartData (uploads, downloads, categoryPerformance, statusDistribution)
}

// 4. Get Top Lists
getTopLists: async (type, params = {}) => {
  // type: 'creators' | 'assets' | 'categories'
  // params: { limit, startDate, endDate }
  // Retorna: array de top items
}

// 5. Export Analytics
exportAnalytics: async (format, params = {}) => {
  // format: 'csv' | 'pdf'
  // params: { startDate, endDate, subtab }
  // Retorna: Blob para download
}
```

---

## 🎨 Design System Aplicado

### Performance Otimizations
Todos os componentes seguem as diretrizes de performance:
- ✅ `React.memo` em todos os chart components
- ✅ `useCallback` para event handlers
- ✅ `useMemo` para chart data e options
- ✅ CSS `contain: 'layout style paint'` nos containers
- ✅ `willChange: 'transform'` e `willChange: 'scroll-position'`
- ✅ GPU acceleration com `transform: translateZ(0)`
- ✅ Scroll optimization com `overscrollBehavior: 'contain'`

### Color Palette (Chart.js)
```javascript
// Chart colors (rgba para transparência)
const chartColors = {
  indigo: 'rgba(99, 102, 241, 0.8)',    // Primary
  purple: 'rgba(139, 92, 246, 0.8)',    // Secondary
  pink: 'rgba(236, 72, 153, 0.8)',      // Accent
  orange: 'rgba(251, 146, 60, 0.8)',    // Warning
  green: 'rgba(34, 197, 94, 0.8)',      // Success
  sky: 'rgba(14, 165, 233, 0.8)',       // Info
  amber: 'rgba(245, 158, 11, 0.8)',     // Caution
  red: 'rgba(239, 68, 68, 0.8)'         // Danger
};
```

### Typography
- Chart titles: `16px bold` white
- Axis labels: `11px` gray-150
- Legend labels: `12px` gray-200
- Tooltips: `12px` com bg dark

### Spacing
- Chart container padding: `p-4` (16px)
- Grid gap: `gap-6` (24px)
- Stats cards: `gap-4` (16px)

---

## 📦 Dependências Instaladas

```json
{
  "chart.js": "^4.x",           // Core chart library
  "react-chartjs-2": "^5.x",    // React wrapper
  "date-fns": "^3.x"            // Date manipulation
}
```

### Chart.js Modules Registrados
```javascript
// LineChart
CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler

// BarChart
CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend

// DoughnutChart
ArcElement, Tooltip, Legend
```

---

## 🔌 Integração com Backend

### Endpoints Necessários (A IMPLEMENTAR)

#### 1. GET `/admin/analytics/overview`
**Query Params**:
- `startDate`: string (yyyy-MM-dd)
- `endDate`: string (yyyy-MM-dd)

**Response**:
```javascript
{
  success: true,
  data: {
    stats: {
      totalUsers: 1520,
      totalAssets: 850,
      totalDownloads: 12450,
      engagementRate: 68.5
    },
    growth: {
      users: 12.5,      // Percentual
      assets: 8.3,
      downloads: 15.2,
      engagement: 2.1
    },
    chartData: {
      userGrowth: {
        labels: ['Jan', 'Fev', 'Mar', ...],
        data: [120, 150, 180, ...]
      },
      assetUploads: {
        labels: ['Jan', 'Fev', 'Mar', ...],
        data: [45, 52, 68, ...]
      },
      categoryDistribution: {
        labels: ['Avatars', 'Worlds', 'Props', ...],
        data: [320, 280, 150, ...]
      },
      downloads: {
        labels: ['Jan', 'Fev', 'Mar', ...],
        data: [450, 520, 680, ...]
      }
    }
  }
}
```

#### 2. GET `/admin/analytics/users`
**Query Params**:
- `startDate`, `endDate`, `metric` (opcional)

**Response**:
```javascript
{
  success: true,
  data: {
    stats: {
      newUsers: 125,
      activeUsers: 850,
      creators: 320,
      retentionRate: 72.5
    },
    chartData: {
      registrations: { labels: [...], data: [...] },
      activity: { labels: [...], data: [...] },
      userTypes: { labels: ['USER', 'CREATOR', ...], data: [500, 320, ...] },
      engagement: { labels: [...], data: [...] }
    }
  }
}
```

#### 3. GET `/admin/analytics/assets`
**Query Params**:
- `startDate`, `endDate`, `metric` (opcional)

**Response**:
```javascript
{
  success: true,
  data: {
    stats: {
      newAssets: 68,
      totalDownloads: 5240,
      avgDownloads: 6.15,
      approvalRate: 94.2
    },
    chartData: {
      uploads: { labels: [...], data: [...] },
      downloads: { labels: [...], data: [...] },
      categoryPerformance: {
        labels: ['Avatars', 'Worlds', ...],
        data: [1200, 980, ...]
      },
      statusDistribution: {
        labels: ['Aprovado', 'Pendente', 'Rejeitado'],
        data: [750, 80, 20]
      }
    }
  }
}
```

#### 4. GET `/admin/analytics/top/:type`
**Path Params**:
- `type`: 'creators' | 'assets' | 'categories'

**Query Params**:
- `limit`: number (default 10)
- `startDate`, `endDate`

**Response** (exemplo para creators):
```javascript
{
  success: true,
  data: [
    {
      rank: 1,
      username: 'JohnDoe',
      assetsCount: 45,
      totalDownloads: 2300,
      avgRating: 4.8
    },
    // ... mais 9 items
  ]
}
```

#### 5. GET `/admin/analytics/export/:format`
**Path Params**:
- `format`: 'csv' | 'pdf'

**Query Params**:
- `startDate`, `endDate`, `subtab`

**Response**: Blob (binary file)

**Headers**:
```
Content-Type: text/csv (ou application/pdf)
Content-Disposition: attachment; filename="analytics-2025-11-08.csv"
```

---

## 🚀 Funcionalidades

### ✅ Implementado
- [x] 4 subtabs completos (Overview, Users, Assets, Top Lists)
- [x] 3 tipos de gráficos (Line, Bar, Doughnut)
- [x] DateRangePicker com 9 presets + customizado
- [x] Export para CSV/PDF (frontend pronto, aguarda backend)
- [x] Real-time data refresh
- [x] Loading states
- [x] Empty states
- [x] Error handling com toast
- [x] Responsive design
- [x] GPU acceleration
- [x] CSS containment
- [x] Tooltip formatado pt-BR
- [x] Percentuais automáticos (DoughnutChart)
- [x] Formatação inteligente de números (K, M)
- [x] Permission-based access

### 📋 Formato de Dados (Mock)

#### Para testar localmente
```javascript
// No backend, retornar este formato temporário:
const mockData = {
  overview: {
    stats: {
      totalUsers: 1520,
      totalAssets: 850,
      totalDownloads: 12450,
      engagementRate: 68.5
    },
    growth: { users: 12.5, assets: 8.3, downloads: 15.2, engagement: 2.1 },
    chartData: {
      userGrowth: {
        labels: Array.from({length: 30}, (_, i) => `Dia ${i+1}`),
        data: Array.from({length: 30}, () => Math.floor(Math.random() * 50) + 10)
      },
      // ... outros charts
    }
  }
};
```

---

## 🎯 Próximos Passos (Backend)

### Prioridade Alta
1. **Implementar endpoints de analytics** (`/admin/analytics/*`)
2. **Criar queries SQL agregadas** para stats e charts
3. **Implementar export CSV/PDF** (usar libraries: `csv-writer`, `pdfkit`)

### Prioridade Média
4. **Adicionar cache** aos endpoints de analytics (Redis, 5min TTL)
5. **Otimizar queries** com indexes em `createdAt`, `downloads`, `isApproved`
6. **Adicionar paginação** para top lists

### Prioridade Baixa
7. **Real-time updates** com WebSocket (opcional)
8. **Scheduled reports** via email (opcional)
9. **Custom metrics** configuráveis (opcional)

---

## 📊 Exemplo de Query SQL (Backend)

```sql
-- User Growth (exemplo)
SELECT 
  DATE(createdAt) as date,
  COUNT(*) as newUsers
FROM User
WHERE createdAt BETWEEN ? AND ?
GROUP BY DATE(createdAt)
ORDER BY date ASC;

-- Category Distribution
SELECT 
  c.name as category,
  COUNT(a.id) as count
FROM Asset a
JOIN Category c ON a.categoryId = c.id
WHERE a.isApproved = true
GROUP BY c.id, c.name
ORDER BY count DESC;

-- Top Creators
SELECT 
  u.id,
  u.username,
  COUNT(a.id) as assetsCount,
  SUM(a.downloads) as totalDownloads,
  AVG(r.rating) as avgRating
FROM User u
LEFT JOIN Asset a ON u.id = a.userId AND a.isApproved = true
LEFT JOIN Review r ON a.id = r.assetId
GROUP BY u.id
ORDER BY totalDownloads DESC
LIMIT 10;
```

---

## 🎨 Screenshots das Funcionalidades

### Overview Subtab
- 4 stats cards com trends (up/down arrows)
- 4 charts em grid 2x2
- Cores coordenadas por tipo de métrica

### Users Analytics Subtab
- 4 stats cards específicos de usuários
- 4 charts mostrando registros, atividade, tipos, engagement
- Gráfico de rosca para distribuição de roles

### Assets Analytics Subtab
- 4 stats cards de assets e downloads
- Charts de uploads (linha), downloads (barra), performance (horizontal bar), status (rosca)
- Horizontal bar chart para comparar categorias

### Top Lists Subtab
- 3 botões para alternar listas
- DataTable reutilizado com sorting
- Rank, nome, métricas formatadas

---

## 📝 Notas de Implementação

### Performance
- Todos os charts usam `React.memo` para evitar re-renders
- `useMemo` para dados e options do Chart.js
- CSS containment aplicado em todos os containers de scroll
- GPU acceleration para animações

### Acessibilidade
- Tooltips descritivos
- Contrast ratios adequados (WCAG AA)
- Labels em português claro
- Loading states com spinners

### Responsive
- Grid adapta de 1 a 2 colunas (charts)
- Stats cards: 1-2-4 colunas
- DateRangePicker com botões wrappable

### Internacionalização
- Usa `useTranslation` hook
- Fallbacks em inglês se tradução não existir
- Números formatados com `pt-BR`

---

## 🔧 Troubleshooting

### Charts não aparecem
- Verificar se `chart.js` e `react-chartjs-2` estão instalados
- Conferir se módulos do Chart.js foram registrados
- Checar console para erros de import

### Datas não funcionam
- Verificar se `date-fns` está instalado
- Conferir formato de data (yyyy-MM-dd)
- Validar range (start < end)

### Export não funciona
- Backend precisa implementar endpoints `/admin/analytics/export/:format`
- Verificar responseType: 'blob' no axios
- Conferir permissões de download do browser

---

## ✅ Checklist de Integração

Frontend (Completo):
- [x] LineChart component
- [x] BarChart component
- [x] DoughnutChart component
- [x] DateRangePicker component
- [x] AnalyticsTab com 4 subtabs
- [x] adminService com 5 métodos
- [x] Integração no AdminPage
- [x] Export buttons UI
- [x] Permission check
- [x] 0 compilation errors

Backend (Pendente):
- [ ] GET `/admin/analytics/overview`
- [ ] GET `/admin/analytics/users`
- [ ] GET `/admin/analytics/assets`
- [ ] GET `/admin/analytics/top/:type`
- [ ] GET `/admin/analytics/export/:format`
- [ ] SQL queries otimizadas
- [ ] Cache layer (Redis)
- [ ] Permission validation

---

## 🎉 Resultado Final

**Total de código criado**:
- AnalyticsTab.jsx: ~720 linhas
- LineChart.jsx: ~180 linhas
- BarChart.jsx: ~180 linhas
- DoughnutChart.jsx: ~140 linhas
- DateRangePicker.jsx: ~140 linhas
- adminService.js: +80 linhas (5 métodos)
- **TOTAL: ~1440 linhas**

**Componentes**: 5 novos
**Subtabs**: 4 completos
**Chart types**: 3 diferentes
**Export formats**: 2 (CSV, PDF)
**Date presets**: 9 opções

O AnalyticsTab está 100% completo no frontend e pronto para integração com o backend! 🚀
