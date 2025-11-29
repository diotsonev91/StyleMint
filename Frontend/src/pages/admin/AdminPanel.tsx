import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    adminUserApi,
    adminProductApi,
    adminStatsApi,
    AdminClothDesignDTO,
    AdminSampleDTO,
    AdminPackDTO,
    UserDTO,
    AllRegistrationStatsDTO,
    Page
} from '../../api/admin.api';
import { getCurrentUser } from '../../api/auth';
import './AdminPanel.css';
import {
    FaUsers,
    FaShoppingBag,
    FaUserShield,
    FaTrash,
    FaPlus,
    FaMinus,
    FaArchive,
    FaTshirt,
    FaMusic,
    FaBox,
    FaChevronLeft,
    FaChevronRight,
    FaSync,
    FaSearch,
    FaChartBar,
    FaCalendarDay,
    FaCalendarWeek,
    FaCalendar,
    FaUserTag
} from 'react-icons/fa';

const AdminPanel = () => {
    // User management state
    const [userId, setUserId] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [role, setRole] = useState('CUSTOMER');

    // Product management state (manual delete)
    const [designId, setDesignId] = useState('');
    const [sampleId, setSampleId] = useState('');
    const [packId, setPackId] = useState('');

    // Auth state
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'products', 'statistics'

    // User listings state
    const [users, setUsers] = useState<Page<UserDTO> | null>(null);
    const [userPage, setUserPage] = useState(0);
    const [searchedUser, setSearchedUser] = useState<UserDTO | null>(null);

    // Product listings state
    const [designs, setDesigns] = useState<Page<AdminClothDesignDTO> | null>(null);
    const [samples, setSamples] = useState<Page<AdminSampleDTO> | null>(null);
    const [packs, setPacks] = useState<Page<AdminPackDTO> | null>(null);

    // Pagination state
    const [designPage, setDesignPage] = useState(0);
    const [samplePage, setSamplePage] = useState(0);
    const [packPage, setPackPage] = useState(0);

    // ⭐ Statistics state
    const [stats, setStats] = useState<AllRegistrationStatsDTO | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Loading states
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    console.log("ADMIN PANEL RENDERED");

    // Check if user is admin
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                console.log("INCLUDING ADMIN: " + currentUser.roles?.includes("ADMIN"));
                setIsAdmin(currentUser.roles?.includes("ADMIN"));
            } catch (error) {
                console.error('Error fetching user:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Load users when switching to users tab
    useEffect(() => {
        if (activeTab === 'users' && isAdmin) {
            loadUsers(userPage);
        }
    }, [activeTab, isAdmin]);

    // Load products when switching to products tab
    useEffect(() => {
        if (activeTab === 'products' && isAdmin) {
            loadAllProducts();
        }
    }, [activeTab, isAdmin]);

    // ⭐ Load statistics when switching to statistics tab
    useEffect(() => {
        if (activeTab === 'statistics' && isAdmin) {
            loadStatistics();
        }
    }, [activeTab, isAdmin]);

    // ========================================
    // LOAD FUNCTIONS
    // ========================================

    const loadUsers = async (page: number) => {
        setLoadingUsers(true);
        try {
            const data = await adminUserApi.getAllUsers(page, 10);
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadAllProducts = async () => {
        setLoadingProducts(true);
        try {
            await Promise.all([
                loadDesigns(designPage),
                loadSamples(samplePage),
                loadPacks(packPage)
            ]);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const loadDesigns = async (page: number) => {
        try {
            const data = await adminProductApi.getAllDesigns(page, 10);
            setDesigns(data);
        } catch (error) {
            console.error('Error loading designs:', error);
        }
    };

    const loadSamples = async (page: number) => {
        try {
            const data = await adminProductApi.getAllSamples(page, 10);
            setSamples(data);
        } catch (error) {
            console.error('Error loading samples:', error);
        }
    };

    const loadPacks = async (page: number) => {
        try {
            const data = await adminProductApi.getAllPacks(page, 10);
            setPacks(data);
        } catch (error) {
            console.error('Error loading packs:', error);
        }
    };

    // ⭐ Load statistics
    const loadStatistics = async () => {
        setLoadingStats(true);
        try {
            const data = await adminStatsApi.getAllRegistrationStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading Admin Panel...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/home" />;
    }

    // ========================================
    // USER MANAGEMENT HANDLERS
    // ========================================

    const handleSearchUserByEmail = async () => {
        if (!userEmail.trim()) {
            alert('Please enter an email address');
            return;
        }
        try {
            const user = await adminUserApi.getUserByEmail(userEmail);
            setSearchedUser(user);
            setUserId(user.id);
            alert(`✅ User found: ${user.displayName} (${user.email})`);
        } catch (error: any) {
            alert('❌ User not found: ' + (error.message || 'Unknown error'));
            setSearchedUser(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!userId.trim()) {
            alert('Please enter a User ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete user ${userId}?`)) {
            try {
                await adminUserApi.deleteUserAsAdmin(userId);
                alert('✅ User deleted successfully');
                setUserId('');
                setSearchedUser(null);
                await loadUsers(userPage);
            } catch (error: any) {
                alert('❌ Error deleting user: ' + (error.message || 'Unknown error'));
            }
        }
    };

    const handleAddRole = async () => {
        if (!userId.trim()) {
            alert('Please enter a User ID');
            return;
        }
        try {
            await adminUserApi.addRoleToUser(userId, role);
            alert(`✅ Role "${role}" added successfully to user ${userId}`);
            await loadUsers(userPage);
        } catch (error: any) {
            alert('❌ Error adding role: ' + (error.message || 'Unknown error'));
        }
    };

    const handleRemoveRole = async () => {
        if (!userId.trim()) {
            alert('Please enter a User ID');
            return;
        }
        try {
            await adminUserApi.removeRoleFromUser(userId, role);
            alert(`✅ Role "${role}" removed successfully from user ${userId}`);
            await loadUsers(userPage);
        } catch (error: any) {
            alert('❌ Error removing role: ' + (error.message || 'Unknown error'));
        }
    };

    const handleDeleteUserFromList = async (userId: string) => {
        if (window.confirm(`Are you sure you want to delete user ${userId}?`)) {
            try {
                await adminUserApi.deleteUserAsAdmin(userId);
                alert('✅ User deleted successfully');
                await loadUsers(userPage);
            } catch (error: any) {
                alert('❌ Error deleting user: ' + (error.message || 'Unknown error'));
            }
        }
    };

    // ========================================
    // PRODUCT MANAGEMENT HANDLERS
    // ========================================

    const handleDeleteDesignById = async () => {
        if (!designId.trim()) {
            alert('Please enter a Design ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete design ${designId}?`)) {
            try {
                await adminProductApi.deleteDesignAsAdmin(designId);
                alert('✅ Design deleted successfully');
                setDesignId('');
                await loadDesigns(designPage);
            } catch (error: any) {
                alert('❌ Error deleting design: ' + (error.message || 'Unknown error'));
            }
        }
    };

    const handleArchiveSampleById = async () => {
        if (!sampleId.trim()) {
            alert('Please enter a Sample ID');
            return;
        }
        if (window.confirm(`Are you sure you want to archive sample ${sampleId}?`)) {
            try {
                await adminProductApi.archiveSampleAsAdmin(sampleId);
                alert('✅ Sample archived successfully');
                setSampleId('');
                await loadSamples(samplePage);
            } catch (error: any) {
                alert('❌ Error archiving sample: ' + (error.message || 'Unknown error'));
            }
        }
    };

    const handleArchivePackById = async () => {
        if (!packId.trim()) {
            alert('Please enter a Pack ID');
            return;
        }
        if (window.confirm(`Are you sure you want to archive pack ${packId}?`)) {
            try {
                await adminProductApi.archivePackAsAdmin(packId);
                alert('✅ Pack archived successfully');
                setPackId('');
                await loadPacks(packPage);
            } catch (error: any) {
                alert('❌ Error archiving pack: ' + (error.message || 'Unknown error'));
            }
        }
    };

    const handleDeleteDesign = async (designId: string) => {
        if (window.confirm(`Are you sure you want to delete design ${designId}?`)) {
            try {
                await adminProductApi.deleteDesignAsAdmin(designId);
                alert('✅ Design deleted successfully');
                await loadDesigns(designPage);
            } catch (error: any) {
                alert('❌ Error deleting design: ' + (error.message || 'Unknown error'));
            }
        }
    };

    const handleArchiveSample = async (sampleId: string) => {
        if (window.confirm(`Are you sure you want to archive sample ${sampleId}?`)) {
            try {
                await adminProductApi.archiveSampleAsAdmin(sampleId);
                alert('✅ Sample archived successfully');
                await loadSamples(samplePage);
            } catch (error: any) {
                alert('❌ Error archiving sample: ' + (error.message || 'Unknown error'));
            }
        }
    };

    const handleArchivePack = async (packId: string) => {
        if (window.confirm(`Are you sure you want to archive pack ${packId}?`)) {
            try {
                await adminProductApi.archivePackAsAdmin(packId);
                alert('✅ Pack archived successfully');
                await loadPacks(packPage);
            } catch (error: any) {
                alert('❌ Error archiving pack: ' + (error.message || 'Unknown error'));
            }
        }
    };

    // ========================================
    // PAGINATION HANDLERS
    // ========================================

    const handleUserPageChange = (newPage: number) => {
        setUserPage(newPage);
        loadUsers(newPage);
    };

    const handleDesignPageChange = (newPage: number) => {
        setDesignPage(newPage);
        loadDesigns(newPage);
    };

    const handleSamplePageChange = (newPage: number) => {
        setSamplePage(newPage);
        loadSamples(newPage);
    };

    const handlePackPageChange = (newPage: number) => {
        setPackPage(newPage);
        loadPacks(newPage);
    };

    return (
        <div className="admin-panel-container">
            <div className="admin-panel">
                {/* Header */}
                <div className="admin-header">
                    <FaUserShield className="admin-icon" />
                    <h1>Admin Control Panel</h1>
                    <p className="admin-subtitle">Manage users, products, and view statistics</p>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FaUsers /> User Management
                    </button>
                    <button
                        className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <FaShoppingBag /> Product Management
                    </button>
                    <button
                        className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('statistics')}
                    >
                        <FaChartBar /> User Statistics
                    </button>
                </div>

                {/* Content */}
                <div className="admin-content">
                    {/* ========================================
                        USER MANAGEMENT TAB
                    ======================================== */}
                    {activeTab === 'users' && (
                        <div className="admin-section">
                            <div className="section-header">
                                <h2><FaUsers /> User Management</h2>
                                <button
                                    onClick={() => loadUsers(userPage)}
                                    className="btn-refresh"
                                    disabled={loadingUsers}
                                >
                                    <FaSync className={loadingUsers ? 'spinning' : ''} />
                                    Refresh Users
                                </button>
                            </div>

                            {/* Manual User Actions */}
                            <div className="card">
                                <h3>Manual User Actions</h3>

                                {/* Search by Email */}
                                <div className="form-group">
                                    <label>Search by Email</label>
                                    <div className="input-with-button">
                                        <input
                                            type="email"
                                            placeholder="Enter user email"
                                            value={userEmail}
                                            onChange={(e) => setUserEmail(e.target.value)}
                                            className="input-field"
                                        />
                                        <button
                                            onClick={handleSearchUserByEmail}
                                            className="btn-inline btn-search"
                                        >
                                            <FaSearch /> Search
                                        </button>
                                    </div>
                                </div>

                                {searchedUser && (
                                    <div className="search-result">
                                        <p><strong>Name:</strong> {searchedUser.displayName}</p>
                                        <p><strong>Email:</strong> {searchedUser.email}</p>
                                        <p><strong>Roles:</strong> {searchedUser.roles.join(', ')}</p>
                                        <p><strong>ID:</strong> {searchedUser.id}</p>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>User ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter user UUID (or search by email above)"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="input-field"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="CUSTOMER">CUSTOMER</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="DESIGNER">DESIGNER</option>
                                        <option value="AUTHOR">AUTHOR</option>
                                    </select>
                                </div>

                                <div className="button-group">
                                    <button onClick={handleAddRole} className="btn btn-success">
                                        <FaPlus /> Add Role
                                    </button>
                                    <button onClick={handleRemoveRole} className="btn btn-warning">
                                        <FaMinus /> Remove Role
                                    </button>
                                    <button onClick={handleDeleteUser} className="btn btn-danger">
                                        <FaTrash /> Delete User
                                    </button>
                                </div>
                            </div>

                            {/* User Listing */}
                            <div className="card">
                                <h3>All Users</h3>

                                {loadingUsers && (
                                    <div className="loading-products">
                                        <div className="spinner-small"></div>
                                        <p>Loading users...</p>
                                    </div>
                                )}

                                {users && users.content.length > 0 ? (
                                    <>
                                        <div className="product-list">
                                            {users.content.map((user) => (
                                                <div key={user.id} className="product-item">
                                                    <div className="product-info">
                                                        <span className="product-name">{user.displayName}</span>
                                                        <span className="product-meta">{user.email}</span>
                                                        <span className="product-meta">Roles: {user.roles.join(', ')}</span>
                                                        <span className="product-id">ID: {user.id}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteUserFromList(user.id)}
                                                        className="btn-item-delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <Pagination
                                            currentPage={userPage}
                                            totalPages={users.totalPages}
                                            onPageChange={handleUserPageChange}
                                        />
                                    </>
                                ) : (
                                    !loadingUsers && <p className="empty-message">No users found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================
                        PRODUCT MANAGEMENT TAB
                    ======================================== */}
                    {activeTab === 'products' && (
                        <div className="admin-section">
                            <div className="section-header">
                                <h2><FaShoppingBag /> Product Management</h2>
                                <button
                                    onClick={loadAllProducts}
                                    className="btn-refresh"
                                    disabled={loadingProducts}
                                >
                                    <FaSync className={loadingProducts ? 'spinning' : ''} />
                                    Refresh All
                                </button>
                            </div>

                            {loadingProducts && (
                                <div className="loading-products">
                                    <div className="spinner-small"></div>
                                    <p>Loading products...</p>
                                </div>
                            )}

                            {/* Manual Delete - Designs */}
                            <div className="card">
                                <h3><FaTshirt /> Delete Design by ID</h3>
                                <div className="form-group">
                                    <label>Design ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter design UUID"
                                        value={designId}
                                        onChange={(e) => setDesignId(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <button onClick={handleDeleteDesignById} className="btn btn-danger btn-full">
                                    <FaTrash /> Delete Design
                                </button>
                            </div>

                            {/* Design Listing */}
                            <div className="card">
                                <h3><FaTshirt /> All Cloth Designs</h3>

                                {designs && designs.content.length > 0 ? (
                                    <>
                                        <div className="product-list">
                                            {designs.content.map((design) => (
                                                <div key={design.id} className="product-item">
                                                    <div className="product-info">
                                                        <span className="product-name">{design.name}</span>
                                                        <span className="product-meta">{design.type}</span>
                                                        <span className="product-id">ID: {design.id}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteDesign(design.id)}
                                                        className="btn-item-delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <Pagination
                                            currentPage={designPage}
                                            totalPages={designs.totalPages}
                                            onPageChange={handleDesignPageChange}
                                        />
                                    </>
                                ) : (
                                    <p className="empty-message">No designs found</p>
                                )}
                            </div>

                            {/* Manual Archive - Samples */}
                            <div className="card">
                                <h3><FaMusic /> Archive Sample by ID</h3>
                                <div className="form-group">
                                    <label>Sample ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter sample UUID"
                                        value={sampleId}
                                        onChange={(e) => setSampleId(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <button onClick={handleArchiveSampleById} className="btn btn-warning btn-full">
                                    <FaArchive /> Archive Sample
                                </button>
                            </div>

                            {/* Sample Listing */}
                            <div className="card">
                                <h3><FaMusic /> All Audio Samples</h3>

                                {samples && samples.content.length > 0 ? (
                                    <>
                                        <div className="product-list">
                                            {samples.content.map((sample) => (
                                                <div key={sample.id} className="product-item">
                                                    <div className="product-info">
                                                        <span className="product-name">{sample.name}</span>
                                                        <span className="product-meta">{sample.category}</span>
                                                        <span className="product-id">ID: {sample.id}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleArchiveSample(sample.id)}
                                                        className="btn-item-archive"
                                                    >
                                                        <FaArchive />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <Pagination
                                            currentPage={samplePage}
                                            totalPages={samples.totalPages}
                                            onPageChange={handleSamplePageChange}
                                        />
                                    </>
                                ) : (
                                    <p className="empty-message">No samples found</p>
                                )}
                            </div>

                            {/* Manual Archive - Packs */}
                            <div className="card">
                                <h3><FaBox /> Archive Pack by ID</h3>
                                <div className="form-group">
                                    <label>Pack ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter pack UUID"
                                        value={packId}
                                        onChange={(e) => setPackId(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <button onClick={handleArchivePackById} className="btn btn-warning btn-full">
                                    <FaArchive /> Archive Pack
                                </button>
                            </div>

                            {/* Pack Listing */}
                            <div className="card">
                                <h3><FaBox /> All Sample Packs</h3>

                                {packs && packs.content.length > 0 ? (
                                    <>
                                        <div className="product-list">
                                            {packs.content.map((pack) => (
                                                <div key={pack.id} className="product-item">
                                                    <div className="product-info">
                                                        <span className="product-name">{pack.name}</span>
                                                        <span className="product-meta">{pack.sampleCount} samples</span>
                                                        <span className="product-id">ID: {pack.id}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleArchivePack(pack.id)}
                                                        className="btn-item-archive"
                                                    >
                                                        <FaArchive />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <Pagination
                                            currentPage={packPage}
                                            totalPages={packs.totalPages}
                                            onPageChange={handlePackPageChange}
                                        />
                                    </>
                                ) : (
                                    <p className="empty-message">No packs found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================
                        ⭐ USER STATISTICS TAB
                    ======================================== */}
                    {activeTab === 'statistics' && (
                        <div className="admin-section">
                            <div className="section-header">
                                <h2><FaChartBar /> User Statistics</h2>
                                <button
                                    onClick={loadStatistics}
                                    className="btn-refresh"
                                    disabled={loadingStats}
                                >
                                    <FaSync className={loadingStats ? 'spinning' : ''} />
                                    Refresh Stats
                                </button>
                            </div>

                            {loadingStats && (
                                <div className="loading-products">
                                    <div className="spinner-small"></div>
                                    <p>Loading statistics...</p>
                                </div>
                            )}

                            {stats && (
                                <>
                                    {/* Registration Statistics */}
                                    <div className="stats-grid">
                                        <div className="stat-card stat-today">
                                            <div className="stat-icon">
                                                <FaCalendarDay />
                                            </div>
                                            <div className="stat-info">
                                                <h4>Registered Today</h4>
                                                <p className="stat-number">{stats.today}</p>
                                            </div>
                                        </div>

                                        <div className="stat-card stat-week">
                                            <div className="stat-icon">
                                                <FaCalendarWeek />
                                            </div>
                                            <div className="stat-info">
                                                <h4>This Week</h4>
                                                <p className="stat-number">{stats.thisWeek}</p>
                                            </div>
                                        </div>

                                        <div className="stat-card stat-month">
                                            <div className="stat-icon">
                                                <FaCalendar />
                                            </div>
                                            <div className="stat-info">
                                                <h4>This Month</h4>
                                                <p className="stat-number">{stats.thisMonth}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role Distribution */}
                                    <div className="card">
                                        <h3><FaUserTag /> Users by Role</h3>
                                        <div className="role-stats">
                                            <div className="role-stat-item">
                                                <span className="role-label">Customers</span>
                                                <span className="role-count">{stats.byRole.customer}</span>
                                            </div>
                                            <div className="role-stat-item">
                                                <span className="role-label">Admins</span>
                                                <span className="role-count">{stats.byRole.admin}</span>
                                            </div>
                                            {stats.byRole.designer !== undefined && (
                                                <div className="role-stat-item">
                                                    <span className="role-label">Designers</span>
                                                    <span className="role-count">{stats.byRole.designer}</span>
                                                </div>
                                            )}
                                            {stats.byRole.producer !== undefined && (
                                                <div className="role-stat-item">
                                                    <span className="role-label">Producers</span>
                                                    <span className="role-count">{stats.byRole.producer}</span>
                                                </div>
                                            )}
                                            {stats.byRole.author !== undefined && (
                                                <div className="role-stat-item">
                                                    <span className="role-label">Authors</span>
                                                    <span className="role-count">{stats.byRole.author}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {!loadingStats && !stats && (
                                <p className="empty-message">No statistics available</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ========================================
// PAGINATION COMPONENT
// ========================================

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="btn-page"
            >
                <FaChevronLeft /> Previous
            </button>

            <span className="page-info">
                Page {currentPage + 1} of {totalPages}
            </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="btn-page"
            >
                Next <FaChevronRight />
            </button>
        </div>
    );
};

export default AdminPanel;