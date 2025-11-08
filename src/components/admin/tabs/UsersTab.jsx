import React, { useState, useCallback, useMemo } from 'react';
import { 
  Users, UserCheck, UserX, Shield, 
  Eye, Edit, Ban, Trash2, Crown,
  Package, MessageSquare, Heart, Calendar,
  Clock, Mail, MapPin, Link as LinkIcon
} from 'lucide-react';
import { DataTable, StatsCard, FilterBar, StatusBadge } from '../shared';
import { EditUserModal, BanUserModal, ChangeRoleModal } from '../modals';
import adminService from '../../../services/adminService';
import { useTranslation } from '../../../hooks/useTranslation';
import { handleImageError } from '../../../utils/imageUtils';
import { PLACEHOLDER_IMAGES } from '../../../constants';
import toast from 'react-hot-toast';

/**
 * UsersTab - Gerenciamento de usuários
 * Subtabs: All Users, Access Requests, Banned Users, Moderators
 */
const UsersTab = () => {
  const { t } = useTranslation();
  const [activeSubtab, setActiveSubtab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    pending: 0,
    moderators: 0
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    role: null,
    accountType: null,
    status: null,
    sortBy: 'newest'
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Selection
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers({
        page,
        limit: 20,
        search: filters.search,
        role: filters.role,
        accountType: filters.accountType,
        status: filters.status,
        sortBy: filters.sortBy
      });

      if (response.success) {
        setUsers(response.data.users || []);
        setStats({
          total: response.data.stats?.total || 0,
          active: response.data.stats?.active || 0,
          banned: response.data.stats?.banned || 0,
          pending: response.data.stats?.pending || 0,
          moderators: response.data.stats?.moderators || 0
        });
        setHasMore(response.data.hasMore || false);
      }
    } catch (error) {
      console.error('Load users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  // Filter change handler
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      role: null,
      accountType: null,
      status: null,
      sortBy: 'newest'
    });
    setPage(1);
  }, []);

  // Sort handler
  const handleSort = useCallback((column, order) => {
    setSortBy(column);
    setSortOrder(order);
  }, []);

  // User actions
  const handleViewUser = useCallback((user) => {
    window.open(`/profile/${user.username}`, '_blank');
  }, []);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  }, []);

  const handleBanUser = useCallback((user) => {
    setSelectedUser(user);
    setBanModalOpen(true);
  }, []);

  const handleChangeRole = useCallback((user) => {
    setSelectedUser(user);
    setRoleModalOpen(true);
  }, []);

  const handleDeleteUser = useCallback(async (user) => {
    if (!confirm(`Are you sure you want to delete ${user.username}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(user.id);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  }, [loadUsers]);

  // Modal handlers
  const handleSaveUser = useCallback(async (userId, data) => {
    await adminService.updateUser(userId, data);
    loadUsers();
  }, [loadUsers]);

  const handleBan = useCallback(async (userId, banData) => {
    await adminService.banUser(userId, banData.reason, banData.duration);
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = useCallback(async (userId, newRole, reason) => {
    await adminService.changeUserRole(userId, newRole, reason);
    loadUsers();
  }, [loadUsers]);

  // Render different content based on active subtab
  const renderContent = () => {
    switch (activeSubtab) {
      case 'all':
        return <AllUsersSubtab 
          users={users}
          loading={loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          selectedUsers={selectedUsers}
          onSelectionChange={setSelectedUsers}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onBanUser={handleBanUser}
          onChangeRole={handleChangeRole}
          onDeleteUser={handleDeleteUser}
        />;
      
      case 'requests':
        return <AccessRequestsSubtab />;
      
      case 'banned':
        return <BannedUsersSubtab />;
      
      case 'moderators':
        return <ModeratorsSubtab />;
      
      default:
        return null;
    }
  };

  // Load users on mount and filter change
  React.useEffect(() => {
    if (activeSubtab === 'all') {
      loadUsers();
    }
  }, [loadUsers, activeSubtab]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.total.toLocaleString()}
          icon={Users}
          trend={{ value: '+12%', direction: 'up' }}
          subtitle="vs last month"
        />
        <StatsCard
          title="Active Users"
          value={stats.active.toLocaleString()}
          icon={UserCheck}
          trend={{ value: '+8%', direction: 'up' }}
          subtitle="online today"
        />
        <StatsCard
          title="Banned Users"
          value={stats.banned.toLocaleString()}
          icon={UserX}
          trend={{ value: '-2', direction: 'down' }}
          subtitle="this week"
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pending.toLocaleString()}
          icon={Clock}
          trend={{ value: '+5', direction: 'up' }}
          subtitle="awaiting review"
        />
        <StatsCard
          title="Moderators"
          value={stats.moderators.toLocaleString()}
          icon={Shield}
          subtitle="total staff"
        />
      </div>

      {/* Subtabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto scrollbar-hide">
        {[
          { id: 'all', label: 'All Users', icon: Users },
          { id: 'requests', label: 'Access Requests', icon: UserCheck },
          { id: 'banned', label: 'Banned Users', icon: UserX },
          { id: 'moderators', label: 'Moderators', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubtab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubtab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
                ${isActive 
                  ? 'text-theme-active border-b-2 border-theme-active' 
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
      <BanUserModal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        user={selectedUser}
        onBan={handleBan}
      />
      <ChangeRoleModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        user={selectedUser}
        onChangeRole={handleRoleChange}
      />
    </div>
  );
};

// ============================================
// ALL USERS SUBTAB
// ============================================

const AllUsersSubtab = ({ 
  users, 
  loading, 
  filters, 
  onFilterChange, 
  onClearFilters,
  selectedUsers,
  onSelectionChange,
  sortBy,
  sortOrder,
  onSort,
  onViewUser,
  onEditUser,
  onBanUser,
  onChangeRole,
  onDeleteUser
}) => {
  // Filter configurations
  const filterConfigs = [
    {
      key: 'role',
      label: 'Role',
      icon: Shield,
      options: [
        { value: 'USER', label: 'User', icon: Users },
        { value: 'CREATOR', label: 'Creator', icon: Package },
        { value: 'MODERATOR', label: 'Moderator', icon: Shield },
        { value: 'ADMIN', label: 'Admin', icon: Crown }
      ]
    },
    {
      key: 'accountType',
      label: 'Account Type',
      icon: Crown,
      options: [
        { value: 'FREE', label: 'Free' },
        { value: 'PRO', label: 'Pro' },
        { value: 'BUSINESS', label: 'Business' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      icon: UserCheck,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'banned', label: 'Banned' },
        { value: 'unverified', label: 'Unverified' }
      ]
    }
  ];

  // Table columns
  const columns = [
    {
      key: 'user',
      label: 'User',
      width: 'w-64',
      render: (user) => (
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl || PLACEHOLDER_IMAGES.USER_AVATAR}
            alt={user.username}
            onError={handleImageError}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {user.username}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {user.email}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => (
        <div className="flex flex-col gap-1">
          <StatusBadge type={user.role} size="sm" />
          <StatusBadge type={user.accountType} size="sm" />
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Activity',
      render: (user) => (
        <div className="flex gap-3 text-xs text-text-tertiary">
          <div className="flex items-center gap-1" title="Assets">
            <Package size={12} />
            <span>{user._count?.assets || 0}</span>
          </div>
          <div className="flex items-center gap-1" title="Reviews">
            <MessageSquare size={12} />
            <span>{user._count?.reviews || 0}</span>
          </div>
          <div className="flex items-center gap-1" title="Likes">
            <Heart size={12} />
            <span>{user._count?.favorites || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => (
        <div className="flex flex-col gap-1">
          {user.isVerified ? (
            <StatusBadge type="VERIFIED" size="sm" />
          ) : (
            <StatusBadge type="UNVERIFIED" size="sm" />
          )}
          {!user.isActive && (
            <StatusBadge type="BANNED" size="sm" />
          )}
        </div>
      )
    },
    {
      key: 'joined',
      label: 'Joined',
      sortable: true,
      render: (user) => (
        <div className="text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          {user.lastLogin && (
            <div className="flex items-center gap-1 mt-1 text-text-tertiary">
              <Clock size={12} />
              <span>Last: {formatRelativeTime(user.lastLogin)}</span>
            </div>
          )}
        </div>
      )
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'View Profile',
      icon: Eye,
      onClick: onViewUser
    },
    {
      label: 'Edit User',
      icon: Edit,
      onClick: onEditUser
    },
    {
      label: 'Change Role',
      icon: Shield,
      onClick: onChangeRole
    },
    {
      label: 'Ban User',
      icon: Ban,
      onClick: onBanUser,
      variant: 'danger',
      disabled: (user) => !user.isActive
    },
    {
      label: 'Delete User',
      icon: Trash2,
      onClick: onDeleteUser,
      variant: 'danger'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search by username or email..."
        onSearchChange={(value) => onFilterChange('search', value)}
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        selectable
        selectedRows={selectedUsers}
        onSelectionChange={onSelectionChange}
        actions={actions}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        emptyState={
          <>
            <Users size={48} className="mx-auto mb-4 text-text-tertiary" />
            <p className="text-lg font-semibold text-text-primary mb-2">No users found</p>
            <p className="text-text-secondary">Try adjusting your search or filters</p>
          </>
        }
      />
    </div>
  );
};

// ============================================
// ACCESS REQUESTS SUBTAB
// ============================================

const AccessRequestsSubtab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState([]);

  // Load access requests
  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getAccessRequests();
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (error) {
      console.error('Load requests error:', error);
      toast.error('Failed to load access requests');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Approve request
  const handleApprove = useCallback(async (request) => {
    try {
      await adminService.approveAccessRequest(request.id);
      toast.success(`Approved request from ${request.username}`);
      loadRequests();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  }, [loadRequests]);

  // Reject request
  const handleReject = useCallback(async (request) => {
    const reason = prompt('Enter rejection reason (optional):');
    
    try {
      await adminService.rejectAccessRequest(request.id, reason);
      toast.success(`Rejected request from ${request.username}`);
      loadRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  }, [loadRequests]);

  // Bulk approve
  const handleBulkApprove = useCallback(async () => {
    if (!confirm(`Approve ${selectedRequests.length} requests?`)) return;

    try {
      await Promise.all(
        selectedRequests.map(id => 
          adminService.approveAccessRequest(id)
        )
      );
      toast.success(`Approved ${selectedRequests.length} requests`);
      setSelectedRequests([]);
      loadRequests();
    } catch (error) {
      toast.error('Failed to approve requests');
    }
  }, [selectedRequests, loadRequests]);

  // Bulk reject
  const handleBulkReject = useCallback(async () => {
    if (!confirm(`Reject ${selectedRequests.length} requests?`)) return;
    
    const reason = prompt('Enter rejection reason (optional):');

    try {
      await Promise.all(
        selectedRequests.map(id => 
          adminService.rejectAccessRequest(id, reason)
        )
      );
      toast.success(`Rejected ${selectedRequests.length} requests`);
      setSelectedRequests([]);
      loadRequests();
    } catch (error) {
      toast.error('Failed to reject requests');
    }
  }, [selectedRequests, loadRequests]);

  // Table columns
  const columns = [
    {
      key: 'user',
      label: 'User Information',
      width: 'w-64',
      render: (request) => (
        <div className="space-y-1">
          <p className="font-semibold text-text-primary">{request.username}</p>
          <p className="text-xs text-text-secondary">{request.email}</p>
          {request.vrchatName && (
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <LinkIcon size={10} />
              <span>VRChat: {request.vrchatName}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'reason',
      label: 'Registration Reason',
      render: (request) => (
        <p className="text-sm text-text-secondary line-clamp-2">
          {request.registrationReason || 'No reason provided'}
        </p>
      )
    },
    {
      key: 'requestedRole',
      label: 'Requested Role',
      render: (request) => (
        <StatusBadge type={request.requestedRole || 'USER'} size="sm" />
      )
    },
    {
      key: 'submitted',
      label: 'Submitted',
      sortable: true,
      render: (request) => (
        <div className="text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatRelativeTime(request.createdAt)}</span>
          </div>
          <p className="text-text-tertiary mt-1">
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      )
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'Approve',
      icon: UserCheck,
      onClick: handleApprove,
      variant: 'success'
    },
    {
      label: 'Reject',
      icon: UserX,
      onClick: handleReject,
      variant: 'danger'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="bg-surface-float border border-white/10 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {selectedRequests.length} request(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 
                       hover:bg-green-600/30 rounded-lg text-sm font-medium transition-all"
            >
              <UserCheck size={16} />
              Approve Selected
            </button>
            <button
              onClick={handleBulkReject}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 
                       hover:bg-red-600/30 rounded-lg text-sm font-medium transition-all"
            >
              <UserX size={16} />
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        selectable
        selectedRows={selectedRequests}
        onSelectionChange={setSelectedRequests}
        actions={actions}
        emptyState={
          <>
            <UserCheck size={48} className="mx-auto mb-4 text-text-tertiary" />
            <p className="text-lg font-semibold text-text-primary mb-2">No pending requests</p>
            <p className="text-text-secondary">All access requests have been processed</p>
          </>
        }
      />
    </div>
  );
};

// ============================================
// BANNED USERS SUBTAB
// ============================================

const BannedUsersSubtab = () => {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'newest'
  });

  // Load banned users
  const loadBannedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers({
        status: 'banned',
        search: filters.search,
        sortBy: filters.sortBy
      });
      
      if (response.success) {
        setBannedUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Load banned users error:', error);
      toast.error('Failed to load banned users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load on mount and filter change
  React.useEffect(() => {
    loadBannedUsers();
  }, [loadBannedUsers]);

  // Unban user
  const handleUnban = useCallback(async (user) => {
    if (!confirm(`Unban ${user.username}? They will regain access immediately.`)) {
      return;
    }

    try {
      await adminService.unbanUser(user.id);
      toast.success(`${user.username} has been unbanned`);
      loadBannedUsers();
    } catch (error) {
      toast.error('Failed to unban user');
    }
  }, [loadBannedUsers]);

  // View ban details
  const handleViewDetails = useCallback((user) => {
    // TODO: Open modal with ban history and details
    alert(`Ban Details for ${user.username}\n\nReason: ${user.banReason || 'No reason provided'}\nBanned by: ${user.bannedBy || 'System'}\nDate: ${user.bannedAt ? new Date(user.bannedAt).toLocaleString() : 'Unknown'}`);
  }, []);

  // Delete banned user permanently
  const handleDeletePermanently = useCallback(async (user) => {
    if (!confirm(`PERMANENTLY DELETE ${user.username}?\n\nThis action cannot be undone. All their assets, reviews, and data will be deleted.`)) {
      return;
    }

    const confirmation = prompt('Type DELETE to confirm:');
    if (confirmation !== 'DELETE') {
      toast.error('Deletion cancelled');
      return;
    }

    try {
      await adminService.deleteUser(user.id);
      toast.success(`${user.username} has been permanently deleted`);
      loadBannedUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  }, [loadBannedUsers]);

  // Filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Table columns
  const columns = [
    {
      key: 'user',
      label: 'Banned User',
      width: 'w-64',
      render: (user) => (
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl || PLACEHOLDER_IMAGES.USER_AVATAR}
            alt={user.username}
            onError={handleImageError}
            className="w-10 h-10 rounded-full object-cover opacity-50"
          />
          <div className="min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {user.username}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {user.email}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'banInfo',
      label: 'Ban Information',
      render: (user) => (
        <div className="space-y-1">
          <p className="text-sm text-text-secondary line-clamp-2">
            {user.banReason || 'No reason provided'}
          </p>
          {user.bannedBy && (
            <p className="text-xs text-text-tertiary">
              Banned by: {user.bannedBy}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'User Stats',
      render: (user) => (
        <div className="flex gap-3 text-xs text-text-tertiary">
          <div className="flex items-center gap-1" title="Assets">
            <Package size={12} />
            <span>{user._count?.assets || 0}</span>
          </div>
          <div className="flex items-center gap-1" title="Reviews">
            <MessageSquare size={12} />
            <span>{user._count?.reviews || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'bannedAt',
      label: 'Ban Date',
      sortable: true,
      render: (user) => (
        <div className="text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <Ban size={12} />
            <span>{formatRelativeTime(user.bannedAt || user.updatedAt)}</span>
          </div>
          <p className="text-text-tertiary mt-1">
            {new Date(user.bannedAt || user.updatedAt).toLocaleDateString()}
          </p>
        </div>
      )
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: handleViewDetails
    },
    {
      label: 'Unban User',
      icon: UserCheck,
      onClick: handleUnban,
      variant: 'success'
    },
    {
      label: 'Delete Permanently',
      icon: Trash2,
      onClick: handleDeletePermanently,
      variant: 'danger'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <FilterBar
        searchPlaceholder="Search banned users..."
        onSearchChange={(value) => handleFilterChange('search', value)}
        filters={[]}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={bannedUsers}
        loading={loading}
        actions={actions}
        emptyState={
          <>
            <UserX size={48} className="mx-auto mb-4 text-text-tertiary" />
            <p className="text-lg font-semibold text-text-primary mb-2">No banned users</p>
            <p className="text-text-secondary">No users are currently banned</p>
          </>
        }
      />
    </div>
  );
};

// ============================================
// MODERATORS SUBTAB
// ============================================

const ModeratorsSubtab = () => {
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    admins: 0,
    moderators: 0,
    totalActions: 0
  });

  // Load moderators
  const loadModerators = useCallback(async () => {
    setLoading(true);
    try {
      // Get all users with ADMIN or MODERATOR role
      const response = await adminService.getUsers({
        role: 'MODERATOR,ADMIN',
        sortBy: 'role'
      });
      
      if (response.success) {
        const modList = response.data.users || [];
        setModerators(modList);
        
        // Calculate stats
        setStats({
          admins: modList.filter(u => u.role === 'ADMIN').length,
          moderators: modList.filter(u => u.role === 'MODERATOR').length,
          totalActions: modList.reduce((sum, u) => sum + (u._count?.adminActions || 0), 0)
        });
      }
    } catch (error) {
      console.error('Load moderators error:', error);
      toast.error('Failed to load moderators');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  React.useEffect(() => {
    loadModerators();
  }, [loadModerators]);

  // View activity
  const handleViewActivity = useCallback(async (moderator) => {
    try {
      const response = await adminService.getUserActivity(moderator.id);
      if (response.success) {
        const activity = response.data;
        alert(`Activity for ${moderator.username}\n\nTotal Actions: ${activity.totalActions || 0}\nAssets Approved: ${activity.assetsApproved || 0}\nUsers Banned: ${activity.usersBanned || 0}\nReports Resolved: ${activity.reportsResolved || 0}`);
      }
    } catch (error) {
      toast.error('Failed to load activity');
    }
  }, []);

  // Change role
  const handleChangeRole = useCallback((moderator) => {
    // TODO: Open ChangeRoleModal
    const newRole = prompt(`Change role for ${moderator.username}\n\nCurrent: ${moderator.role}\n\nEnter new role (USER, CREATOR, MODERATOR, ADMIN):`);
    
    if (!newRole || !['USER', 'CREATOR', 'MODERATOR', 'ADMIN'].includes(newRole.toUpperCase())) {
      toast.error('Invalid role');
      return;
    }

    toast.success(`Role change for ${moderator.username} to ${newRole.toUpperCase()} (not implemented)`);
  }, []);

  // Remove moderator
  const handleRemoveModerator = useCallback(async (moderator) => {
    if (!confirm(`Remove ${moderator.username} from moderation team?\n\nThey will be demoted to CREATOR role.`)) {
      return;
    }

    try {
      await adminService.changeUserRole(moderator.id, 'CREATOR');
      toast.success(`${moderator.username} has been removed from moderation team`);
      loadModerators();
    } catch (error) {
      toast.error('Failed to remove moderator');
    }
  }, [loadModerators]);

  // View profile
  const handleViewProfile = useCallback((moderator) => {
    window.open(`/profile/${moderator.username}`, '_blank');
  }, []);

  // Table columns
  const columns = [
    {
      key: 'moderator',
      label: 'Moderator',
      width: 'w-64',
      render: (mod) => (
        <div className="flex items-center gap-3">
          <img
            src={mod.avatarUrl || PLACEHOLDER_IMAGES.USER_AVATAR}
            alt={mod.username}
            onError={handleImageError}
            className="w-10 h-10 rounded-full object-cover border-2 border-theme-active/30"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-text-primary truncate">
                {mod.username}
              </p>
              {mod.role === 'ADMIN' && (
                <Crown size={14} className="text-yellow-400" />
              )}
            </div>
            <p className="text-xs text-text-secondary truncate">
              {mod.email}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role & Status',
      render: (mod) => (
        <div className="flex flex-col gap-1">
          <StatusBadge type={mod.role} size="sm" />
          {mod.isVerified ? (
            <StatusBadge type="VERIFIED" size="sm" />
          ) : (
            <StatusBadge type="UNVERIFIED" size="sm" />
          )}
        </div>
      )
    },
    {
      key: 'activity',
      label: 'Moderation Activity',
      render: (mod) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Shield size={14} className="text-theme-active" />
            <span className="text-text-primary font-semibold">
              {mod._count?.adminActions || 0} actions
            </span>
          </div>
          <div className="flex gap-3 text-xs text-text-tertiary">
            <div className="flex items-center gap-1" title="Assets Moderated">
              <Package size={10} />
              <span>{mod._count?.moderatedAssets || 0}</span>
            </div>
            <div className="flex items-center gap-1" title="Reports Handled">
              <MessageSquare size={10} />
              <span>{mod._count?.resolvedReports || 0}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'joined',
      label: 'Joined Team',
      sortable: true,
      render: (mod) => (
        <div className="text-xs text-text-secondary">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(mod.createdAt).toLocaleDateString()}</span>
          </div>
          {mod.lastLogin && (
            <div className="flex items-center gap-1 mt-1 text-text-tertiary">
              <Clock size={12} />
              <span>Active {formatRelativeTime(mod.lastLogin)}</span>
            </div>
          )}
        </div>
      )
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'View Profile',
      icon: Eye,
      onClick: handleViewProfile
    },
    {
      label: 'View Activity',
      icon: Shield,
      onClick: handleViewActivity
    },
    {
      label: 'Change Role',
      icon: Edit,
      onClick: handleChangeRole
    },
    {
      label: 'Remove from Team',
      icon: UserX,
      onClick: handleRemoveModerator,
      variant: 'danger',
      disabled: (mod) => mod.role === 'ADMIN' // Can't remove admins
    }
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Admins"
          value={stats.admins}
          icon={Crown}
          subtitle="highest access"
        />
        <StatsCard
          title="Total Moderators"
          value={stats.moderators}
          icon={Shield}
          subtitle="active staff"
        />
        <StatsCard
          title="Total Actions"
          value={stats.totalActions.toLocaleString()}
          icon={Package}
          subtitle="all time"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={moderators}
        loading={loading}
        actions={actions}
        emptyState={
          <>
            <Shield size={48} className="mx-auto mb-4 text-text-tertiary" />
            <p className="text-lg font-semibold text-text-primary mb-2">No moderators found</p>
            <p className="text-text-secondary">No users with moderation permissions</p>
          </>
        }
      />
    </div>
  );
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default UsersTab;
