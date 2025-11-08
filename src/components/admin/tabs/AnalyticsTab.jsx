import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Award,
  Download,
  FileText,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

// Components
import StatsCard from '../shared/StatsCard';
import DateRangePicker from '../shared/DateRangePicker';
import LineChart from '../shared/LineChart';
import BarChart from '../shared/BarChart';
import DoughnutChart from '../shared/DoughnutChart';
import DataTable from '../shared/DataTable';

// Services
import adminService from '../../../services/adminService';

/**
 * AnalyticsTab Component
 * Main analytics dashboard with 4 subtabs
 */
const AnalyticsTab = () => {
  const [activeSubtab, setActiveSubtab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [assetAnalytics, setAssetAnalytics] = useState(null);
  const [topLists, setTopLists] = useState({
    creators: [],
    assets: [],
    categories: []
  });

  const handleDateRangeChange = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);

  // Load overview data
  const loadOverviewData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      };
      const response = await adminService.getAnalyticsOverview(params);
      
      if (response.success) {
        setOverviewData(response.data);
      }
    } catch (error) {
      console.error('Load overview data error:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load user analytics
  const loadUserAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      };
      const response = await adminService.getUserAnalytics(params);
      
      if (response.success) {
        setUserAnalytics(response.data);
      }
    } catch (error) {
      console.error('Load user analytics error:', error);
      toast.error('Erro ao carregar analytics de usuários');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load asset analytics
  const loadAssetAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      };
      const response = await adminService.getAssetAnalytics(params);
      
      if (response.success) {
        setAssetAnalytics(response.data);
      }
    } catch (error) {
      console.error('Load asset analytics error:', error);
      toast.error('Erro ao carregar analytics de assets');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load top lists
  const loadTopLists = useCallback(async (type) => {
    try {
      setLoading(true);
      const params = {
        limit: 10,
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      };
      const response = await adminService.getTopLists(type, params);
      
      if (response.success) {
        setTopLists(prev => ({
          ...prev,
          [type]: response.data
        }));
      }
    } catch (error) {
      console.error(`Load top ${type} error:`, error);
      toast.error(`Erro ao carregar top ${type}`);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Export data
  const handleExport = useCallback(async (format) => {
    try {
      const params = {
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd'),
        subtab: activeSubtab
      };
      
      const blob = await adminService.exportAnalytics(format, params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${activeSubtab}-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Dados exportados em ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar dados');
    }
  }, [dateRange, activeSubtab]);

  // Load data when subtab or date range changes
  useEffect(() => {
    switch (activeSubtab) {
      case 'overview':
        loadOverviewData();
        break;
      case 'users':
        loadUserAnalytics();
        break;
      case 'assets':
        loadAssetAnalytics();
        break;
      case 'top':
        loadTopLists('creators');
        loadTopLists('assets');
        loadTopLists('categories');
        break;
      default:
        break;
    }
  }, [activeSubtab, dateRange, loadOverviewData, loadUserAnalytics, loadAssetAnalytics, loadTopLists]);

  const subtabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'assets', label: 'Assets', icon: Package },
    { id: 'top', label: 'Top Lists', icon: Award }
  ], []);

  return (
    <div className="h-full flex flex-col">
      {/* Header with Date Range Picker and Export */}
      <div className="flex-shrink-0 px-3 sm:px-4 lg:px-6 py-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Analytics Dashboard</h2>
            <p className="text-sm text-text-tertiary">
              Análise detalhada de métricas e performance da plataforma
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={loading}
              className="px-3 py-2 bg-surface-float text-text-primary text-sm rounded-lg border border-white/10 hover:bg-surface-float2 disabled:opacity-50 transition-all duration-200"
            >
              <FileText size={16} className="inline mr-2" />
              Exportar CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={loading}
              className="px-3 py-2 bg-theme-active text-white text-sm rounded-lg hover:bg-theme-hover disabled:opacity-50 transition-all duration-200"
            >
              <FileText size={16} className="inline mr-2" />
              Exportar PDF
            </button>
          </div>
        </div>

        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onChange={handleDateRangeChange}
        />
      </div>

      {/* Subtabs Navigation */}
      <div 
        className="flex-shrink-0 px-3 sm:px-4 lg:px-6 border-b border-white/5"
        style={{ contain: 'layout style' }}
      >
        <div className="flex gap-1">
          {subtabs.map((subtab) => {
            const Icon = subtab.icon;
            return (
              <button
                key={subtab.id}
                onClick={() => setActiveSubtab(subtab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeSubtab === subtab.id
                    ? 'text-theme-active border-theme-active'
                    : 'text-text-secondary border-transparent hover:text-text-primary hover:border-white/10'
                }`}
              >
                <Icon size={16} />
                {subtab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtab Content */}
      <div 
        className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4"
        style={{
          WebkitOverflowScrolling: 'touch',
          contain: 'layout style paint',
          willChange: 'scroll-position',
          overscrollBehavior: 'contain'
        }}
      >
        {activeSubtab === 'overview' && (
          <OverviewSubtab data={overviewData} loading={loading} />
        )}
        {activeSubtab === 'users' && (
          <UsersAnalyticsSubtab data={userAnalytics} loading={loading} />
        )}
        {activeSubtab === 'assets' && (
          <AssetsAnalyticsSubtab data={assetAnalytics} loading={loading} />
        )}
        {activeSubtab === 'top' && (
          <TopListsSubtab data={topLists} loading={loading} />
        )}
      </div>
    </div>
  );
};

/**
 * Overview Subtab - Dashboard geral
 */
const OverviewSubtab = ({ data, loading }) => {
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-active border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-tertiary">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-text-tertiary">Nenhum dado disponível</p>
      </div>
    );
  }

  const stats = data.stats || {};
  const growth = data.growth || {};
  const chartData = data.chartData || {};

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Métricas Principais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Users}
            label="Total de Usuários"
            value={stats.totalUsers?.toLocaleString('pt-BR') || '0'}
            trend={growth.users > 0 ? 'up' : growth.users < 0 ? 'down' : 'neutral'}
            trendValue={`${Math.abs(growth.users || 0)}%`}
          />
          <StatsCard
            icon={Package}
            label="Total de Assets"
            value={stats.totalAssets?.toLocaleString('pt-BR') || '0'}
            trend={growth.assets > 0 ? 'up' : growth.assets < 0 ? 'down' : 'neutral'}
            trendValue={`${Math.abs(growth.assets || 0)}%`}
          />
          <StatsCard
            icon={Download}
            label="Downloads"
            value={stats.totalDownloads?.toLocaleString('pt-BR') || '0'}
            trend={growth.downloads > 0 ? 'up' : growth.downloads < 0 ? 'down' : 'neutral'}
            trendValue={`${Math.abs(growth.downloads || 0)}%`}
          />
          <StatsCard
            icon={TrendingUp}
            label="Engagement"
            value={`${stats.engagementRate || 0}%`}
            trend={growth.engagement > 0 ? 'up' : growth.engagement < 0 ? 'down' : 'neutral'}
            trendValue={`${Math.abs(growth.engagement || 0)}%`}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Crescimento de Usuários</h4>
          <LineChart
            labels={chartData.userGrowth?.labels || []}
            datasets={[
              {
                label: 'Novos Usuários',
                data: chartData.userGrowth?.data || [],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
              }
            ]}
            height="250px"
          />
        </div>

        {/* Asset Uploads Chart */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Uploads de Assets</h4>
          <BarChart
            labels={chartData.assetUploads?.labels || []}
            datasets={[
              {
                label: 'Assets Publicados',
                data: chartData.assetUploads?.data || [],
                backgroundColor: 'rgba(139, 92, 246, 0.8)'
              }
            ]}
            height="250px"
          />
        </div>

        {/* Category Distribution */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Distribuição por Categoria</h4>
          <DoughnutChart
            labels={chartData.categoryDistribution?.labels || []}
            data={chartData.categoryDistribution?.data || []}
            height="250px"
          />
        </div>

        {/* Downloads Chart */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Downloads ao Longo do Tempo</h4>
          <LineChart
            labels={chartData.downloads?.labels || []}
            datasets={[
              {
                label: 'Downloads',
                data: chartData.downloads?.data || [],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)'
              }
            ]}
            height="250px"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Users Analytics Subtab
 */
const UsersAnalyticsSubtab = ({ data, loading }) => {
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-active border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-tertiary">Carregando analytics de usuários...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-text-tertiary">Nenhum dado disponível</p>
      </div>
    );
  }

  const stats = data.stats || {};
  const chartData = data.chartData || {};

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Estatísticas de Usuários</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Users}
            label="Novos Usuários"
            value={stats.newUsers?.toLocaleString('pt-BR') || '0'}
          />
          <StatsCard
            icon={TrendingUp}
            label="Usuários Ativos"
            value={stats.activeUsers?.toLocaleString('pt-BR') || '0'}
          />
          <StatsCard
            icon={Award}
            label="Creators"
            value={stats.creators?.toLocaleString('pt-BR') || '0'}
          />
          <StatsCard
            icon={Calendar}
            label="Taxa de Retenção"
            value={`${stats.retentionRate || 0}%`}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Tendência de Registros</h4>
          <LineChart
            labels={chartData.registrations?.labels || []}
            datasets={[
              {
                label: 'Registros',
                data: chartData.registrations?.data || [],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
              }
            ]}
            height="300px"
          />
        </div>

        {/* User Activity */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Atividade de Usuários</h4>
          <BarChart
            labels={chartData.activity?.labels || []}
            datasets={[
              {
                label: 'Usuários Ativos',
                data: chartData.activity?.data || [],
                backgroundColor: 'rgba(139, 92, 246, 0.8)'
              }
            ]}
            height="300px"
          />
        </div>

        {/* User Types Distribution */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Distribuição por Tipo</h4>
          <DoughnutChart
            labels={chartData.userTypes?.labels || []}
            data={chartData.userTypes?.data || []}
            height="300px"
          />
        </div>

        {/* Engagement Over Time */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Engagement ao Longo do Tempo</h4>
          <LineChart
            labels={chartData.engagement?.labels || []}
            datasets={[
              {
                label: 'Taxa de Engagement',
                data: chartData.engagement?.data || [],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)'
              }
            ]}
            height="300px"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Assets Analytics Subtab
 */
const AssetsAnalyticsSubtab = ({ data, loading }) => {
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-active border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-tertiary">Carregando analytics de assets...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-text-tertiary">Nenhum dado disponível</p>
      </div>
    );
  }

  const stats = data.stats || {};
  const chartData = data.chartData || {};

  return (
    <div className="space-y-6">
      {/* Asset Stats */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Estatísticas de Assets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Package}
            label="Novos Assets"
            value={stats.newAssets?.toLocaleString('pt-BR') || '0'}
          />
          <StatsCard
            icon={Download}
            label="Total Downloads"
            value={stats.totalDownloads?.toLocaleString('pt-BR') || '0'}
          />
          <StatsCard
            icon={TrendingUp}
            label="Média Downloads/Asset"
            value={stats.avgDownloads?.toLocaleString('pt-BR') || '0'}
          />
          <StatsCard
            icon={Award}
            label="Taxa de Aprovação"
            value={`${stats.approvalRate || 0}%`}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trend */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Tendência de Uploads</h4>
          <LineChart
            labels={chartData.uploads?.labels || []}
            datasets={[
              {
                label: 'Uploads',
                data: chartData.uploads?.data || [],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
              }
            ]}
            height="300px"
          />
        </div>

        {/* Downloads Trend */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Tendência de Downloads</h4>
          <BarChart
            labels={chartData.downloads?.labels || []}
            datasets={[
              {
                label: 'Downloads',
                data: chartData.downloads?.data || [],
                backgroundColor: 'rgba(34, 197, 94, 0.8)'
              }
            ]}
            height="300px"
          />
        </div>

        {/* Category Performance */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Performance por Categoria</h4>
          <BarChart
            labels={chartData.categoryPerformance?.labels || []}
            datasets={[
              {
                label: 'Downloads',
                data: chartData.categoryPerformance?.data || [],
                backgroundColor: 'rgba(139, 92, 246, 0.8)'
              }
            ]}
            horizontal={true}
            height="300px"
          />
        </div>

        {/* Asset Status Distribution */}
        <div className="bg-surface-float rounded-xl p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Distribuição por Status</h4>
          <DoughnutChart
            labels={chartData.statusDistribution?.labels || []}
            data={chartData.statusDistribution?.data || []}
            height="300px"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Top Lists Subtab
 */
const TopListsSubtab = ({ data, loading }) => {
  const [activeList, setActiveList] = useState('creators');

  const topCreatorsColumns = [
    { key: 'rank', label: '#', width: '60px' },
    { key: 'username', label: 'Creator', sortable: true },
    { key: 'assetsCount', label: 'Assets', sortable: true },
    { key: 'totalDownloads', label: 'Downloads', sortable: true },
    { key: 'avgRating', label: 'Rating', sortable: true }
  ];

  const topAssetsColumns = [
    { key: 'rank', label: '#', width: '60px' },
    { key: 'title', label: 'Asset', sortable: true },
    { key: 'category', label: 'Categoria', sortable: true },
    { key: 'downloads', label: 'Downloads', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true }
  ];

  const topCategoriesColumns = [
    { key: 'rank', label: '#', width: '60px' },
    { key: 'name', label: 'Categoria', sortable: true },
    { key: 'assetsCount', label: 'Assets', sortable: true },
    { key: 'totalDownloads', label: 'Downloads', sortable: true },
    { key: 'avgRating', label: 'Rating Médio', sortable: true }
  ];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-active border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-tertiary">Carregando top lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveList('creators')}
          className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
            activeList === 'creators'
              ? 'bg-theme-active text-white'
              : 'bg-surface-float text-text-secondary hover:bg-surface-float2'
          }`}
        >
          <Users size={16} className="inline mr-2" />
          Top Creators
        </button>
        <button
          onClick={() => setActiveList('assets')}
          className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
            activeList === 'assets'
              ? 'bg-theme-active text-white'
              : 'bg-surface-float text-text-secondary hover:bg-surface-float2'
          }`}
        >
          <Package size={16} className="inline mr-2" />
          Top Assets
        </button>
        <button
          onClick={() => setActiveList('categories')}
          className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
            activeList === 'categories'
              ? 'bg-theme-active text-white'
              : 'bg-surface-float text-text-secondary hover:bg-surface-float2'
          }`}
        >
          <Award size={16} className="inline mr-2" />
          Top Categorias
        </button>
      </div>

      {/* Lists */}
      <div className="bg-surface-float rounded-xl border border-white/5 overflow-hidden">
        {activeList === 'creators' && (
          <DataTable
            columns={topCreatorsColumns}
            data={data.creators || []}
            loading={loading}
            emptyMessage="Nenhum creator encontrado"
          />
        )}
        {activeList === 'assets' && (
          <DataTable
            columns={topAssetsColumns}
            data={data.assets || []}
            loading={loading}
            emptyMessage="Nenhum asset encontrado"
          />
        )}
        {activeList === 'categories' && (
          <DataTable
            columns={topCategoriesColumns}
            data={data.categories || []}
            loading={loading}
            emptyMessage="Nenhuma categoria encontrada"
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(AnalyticsTab);
