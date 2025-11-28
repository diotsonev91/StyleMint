import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';  // Import Navigate from react-router-dom
import { adminUserApi, adminProductApi } from '../../api/admin.api';
import { getCurrentUser } from '../../api/auth';  // Import the getCurrentUser function

const AdminPanel = () => {
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('');
    const [designId, setDesignId] = useState('');
    const [sampleId, setSampleId] = useState('');
    const [packId, setPackId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);  // State to track if the user is admin
    const [loading, setLoading] = useState(true);  // State to handle loading the user data

    // Fetch current user and check if they are admin
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setRole(currentUser.role);
                setIsAdmin(currentUser.role === 'admin');
            } catch (error) {
                console.error('Error fetching user:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Redirect non-admins
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAdmin) {
        return <Navigate to="/home" />;  // Redirect to the home page if not an admin
    }

    // Handler functions for each action
    const handleDeleteUser = async () => {
        try {
            await adminUserApi.deleteUserAsAdmin(userId);
            alert('User deleted successfully');
        } catch (error) {
            alert('Error deleting user');
        }
    };

    const handleAddRole = async () => {
        try {
            await adminUserApi.addRoleToUser(userId, role);
            alert('Role added successfully');
        } catch (error) {
            alert('Error adding role');
        }
    };

    const handleRemoveRole = async () => {
        try {
            await adminUserApi.removeRoleFromUser(userId, role);
            alert('Role removed successfully');
        } catch (error) {
            alert('Error removing role');
        }
    };

    const handleDeleteDesign = async () => {
        try {
            await adminProductApi.deleteDesignAsAdmin(designId);
            alert('Design deleted successfully');
        } catch (error) {
            alert('Error deleting design');
        }
    };

    const handleArchiveSample = async () => {
        try {
            await adminProductApi.archiveSampleAsAdmin(sampleId);
            alert('Sample archived successfully');
        } catch (error) {
            alert('Error archiving sample');
        }
    };

    const handleArchivePack = async () => {
        try {
            await adminProductApi.archivePackAsAdmin(packId);
            alert('Pack archived successfully');
        } catch (error) {
            alert('Error archiving pack');
        }
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <div>
                <h3>Manage Users</h3>
                <input
                    type="text"
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                />
                <button onClick={handleAddRole}>Add Role</button>
                <button onClick={handleRemoveRole}>Remove Role</button>
                <button onClick={handleDeleteUser}>Delete User</button>
            </div>

            <div>
                <h3>Manage Products</h3>
                <input
                    type="text"
                    placeholder="Design ID"
                    value={designId}
                    onChange={(e) => setDesignId(e.target.value)}
                />
                <button onClick={handleDeleteDesign}>Delete Design</button>

                <input
                    type="text"
                    placeholder="Sample ID"
                    value={sampleId}
                    onChange={(e) => setSampleId(e.target.value)}
                />
                <button onClick={handleArchiveSample}>Archive Sample</button>

                <input
                    type="text"
                    placeholder="Pack ID"
                    value={packId}
                    onChange={(e) => setPackId(e.target.value)}
                />
                <button onClick={handleArchivePack}>Archive Pack</button>
            </div>
        </div>
    );
};

export default AdminPanel;
