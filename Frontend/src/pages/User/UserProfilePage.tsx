// src/pages/User/UserProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '../../components/user/UserProfile';
import UserPublicProfile from '../../components/user/UserPublicProfile'; // 👈 НОВИЯТ КОМПОНЕНТ
import { useAuth } from '../../hooks/useAuth';
import { userProfileService, UserProfileDTO } from '../../services/userProfileService';

interface UserProfilePageProps {
    profileUserId?: string;
}

function UserProfilePage({ profileUserId: propUserId }: UserProfilePageProps) {
    const { userId: paramUserId } = useParams<{ userId: string }>();
    const { user } = useAuth();

    // Use prop if provided, otherwise use route param
    const targetUserId = propUserId || paramUserId;
    const isOwnProfile = user && targetUserId === user.id;

    const [profileData, setProfileData] = useState<UserProfileDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (targetUserId) {
            fetchUserProfile();
        }
    }, [targetUserId]);

    const fetchUserProfile = async () => {
        if (!targetUserId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await userProfileService.getUserProfile(targetUserId);

            if (response.success && response.data) {
                setProfileData(response.data);
            } else {
                setError(response.error || 'Failed to load profile');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('An error occurred while loading the profile');
        } finally {
            setLoading(false);
        }
    };

    if (!targetUserId) {
        return <div className="page-error">No user ID provided</div>;
    }

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-error">
                <h2>Failed to Load Profile</h2>
                <p>{error}</p>
                <button onClick={fetchUserProfile}>Try Again</button>
            </div>
        );
    }

    if (!profileData) {
        return <div className="page-error">Profile Not Found</div>;
    }

    // 👇 КЛЮЧОВА ПРОМЯНА ТУК:
    return isOwnProfile ? (
        // Собствен профил - пълна версия
        <UserProfile
            userId={targetUserId}
            currentUserId={user?.id}
            displayName={profileData.displayName}
            email={profileData.email}
            avatarUrl={profileData.avatarUrl}
            memberSince={profileData.memberSince}
        />
    ) : (
        // Публичен профил - ограничена версия
        <UserPublicProfile
            userId={targetUserId}
            currentUserId={user?.id}
            displayName={profileData.displayName}
            avatarUrl={profileData.avatarUrl}
            memberSince={profileData.memberSince}
        />
    );
}

export default UserProfilePage;