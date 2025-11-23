
import React from 'react';
import UserProfile from '../../components/user/UserProfile';
import { useAuth } from '../../hooks/useAuth';

function MyProfilePage() {
    const { user, checkAuth } = useAuth(); // Get current logged-in user

    if (!user) return <div>Please log in</div>;

    const handleProfileUpdate = async () => {
        await checkAuth();
    };

    return (
        <UserProfile
            userId={user.id}
            currentUserId={user.id}
            displayName={user.displayName}
            email={user.email}
            avatarUrl={user.avatarUrl}
            memberSince={user.createdAt}
            onProfileUpdate={handleProfileUpdate}
        />
    );
}

export default MyProfilePage;