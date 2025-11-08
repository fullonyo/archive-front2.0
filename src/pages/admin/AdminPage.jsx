import { useState, useEffect } from 'react';
import { Shield, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import Breadcrumb from '../../components/common/Breadcrumb';
import PendingAssetsTab from '../../components/admin/PendingAssetsTab';
import adminService from '../../services/adminService';

const AdminPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);

  // Check admin permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        const response = await adminService.getMyPermissions();
        
        console.log('Admin permissions response:', response); // Debug
        
        if (response.success) {
          const permissions = response.data?.permissions || [];
          const role = response.data?.level || response.data?.user?.role || 'USER';
          
          console.log('User role:', role); // Debug
          console.log('User permissions:', permissions); // Debug
          
          // Check if user has admin access
          const isAdmin = ['SISTEMA', 'ADMIN', 'MODERATOR'].includes(role);
          const hasAdminPanel = permissions.includes('view_admin_panel');
          
          console.log('Is admin?', isAdmin, 'Has panel permission?', hasAdminPanel); // Debug
          
          setHasPermission(isAdmin && hasAdminPanel);
          setUserPermissions(permissions);
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error('Permission check error:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [isAuthenticated, navigate]);

  const tabs = [
    {
      id: 'pending',
      label: t('admin.pendingApprovals') || 'Pending Approvals',
      icon: Shield,
      component: PendingAssetsTab,
      permissions: ['approve_assets', 'moderate_assets']
    }
    // Future tabs can be added here:
    // { id: 'users', label: 'User Management', icon: Users, component: UserManagementTab },
    // { id: 'reports', label: 'Reports', icon: Flag, component: ReportsTab },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3, component: AnalyticsTab },
  ];

  // Filter tabs based on permissions
  const availableTabs = tabs.filter(tab => {
    if (!tab.permissions) return true;
    return tab.permissions.some(perm => userPermissions.includes(perm));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={32} className="animate-spin text-theme-active" />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <div className="px-3 sm:px-4 lg:px-6 pt-6">
          <Breadcrumb
            items={[
              { label: t('sidebar.admin') || 'Admin Panel', path: '/admin' }
            ]}
          />
        </div>

        <div className="px-3 sm:px-4 lg:px-6 pb-6">
          <div className="bg-surface-float border border-red-500/20 rounded-xl p-12 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-text-secondary mb-6">
              You don't have permission to access the admin panel.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Breadcrumb */}
      <div className="px-3 sm:px-4 lg:px-6 pt-6">
        <Breadcrumb
          items={[
            { label: t('sidebar.admin') || 'Admin Panel', path: '/admin' }
          ]}
        />
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 lg:px-6 pb-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-theme-active/10">
              <Shield size={24} className="text-theme-active" />
            </div>
            <h1 className="text-3xl font-bold">
              {t('sidebar.admin') || 'Admin Panel'}
            </h1>
          </div>
          <p className="text-text-secondary">
            {t('admin.subtitle') || 'Manage assets, users, and platform settings'}
          </p>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-surface-base -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-3 mb-6 border-b border-white/5"
             style={{ contain: 'layout style' }}>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {availableTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-theme-active text-white'
                      : 'bg-surface-float text-text-secondary hover:text-text-primary hover:bg-surface-float2'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {ActiveTabComponent && <ActiveTabComponent />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
