import React, {useEffect, useState} from "react";
import {Routes, Route, Navigate, useLocation} from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/User/Login";
import Register from "../pages/User/Register";
import Customize from "../pages/Clothes/Customize";
import Catalogue from "../pages/Clothes/Catalogue";
import SamplePackDetailledPage from "../pages/Sounds/SamplePackDetailledPage";
import AllSamplesPage from "../pages/Sounds/AllSamplesPage";
import ChooseYourSoundsPage from "../pages/Sounds/ChooseYourSoundsPage";
import SamplePacksPage from "../pages/Sounds/SamplePacksPage";
import UploadPackPage from "../pages/Sounds/UploadPackPage";
import UploadSamplePage from "../pages/Sounds/UploadSamplePage";
import GodotGameEmbedRush from "../pages/Game/GodotGameEmbedColorRush";
import GodotGameEmbedBpm from "../pages/Game/GodotGameEmbedBPMMatcher";

import { CartPage } from "../pages/Cart/CartPage";
import { CheckoutDetails } from "../pages/Cart/CheckoutDetails";
import { CheckoutSummary } from "../pages/Cart/CheckoutSummary";
import { CheckoutSuccess } from "../pages/Cart/CheckoutPages";
import GamesMenu from "../pages/Game/GamesMenu";
import UserSamplesPage from "../pages/Sounds/UserSamplesPage";
import EditSamplePage from "../pages/Sounds/EditSamplePage";
import UserPacksPage from "../pages/Sounds/UserPacksPage";
import EditPackPage from "../pages/Sounds/EditPackPage";
import {MyClothDesignsPage} from "../pages/Clothes/MyClothDesignsPage";
import {EditClothDesignPage} from "../pages/Clothes/EditClothDesignPage";
import {MyNftsPage} from "../pages/nft/MyNftsPage";
import MyProfilePage from "../pages/User/MyProfilePage";
import UserProfilePage from "../pages/User/UserProfilePage";
import {getCurrentUser} from "../api/auth";
import AdminPanel from "../pages/admin/AdminPanel";

// ⭐ Public routes that don't require authentication check
const PUBLIC_ROUTES = ['/login', '/register'];

export const AppRoutes: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation(); // ⭐ Get current route

    useEffect(() => {
        const fetchUser = async () => {
            // ⭐ Skip auth check for public routes
            if (PUBLIC_ROUTES.includes(location.pathname)) {
                console.log('📍 On public route, skipping auth check');
                setLoading(false);
                return;
            }

            try {
                const currentUser = await getCurrentUser();
                console.log(currentUser);
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
    }, [location.pathname]); // ⭐ Re-run when route changes

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/admin-panel" element={isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="/" element={isAdmin ? <Navigate to="/admin-panel" /> : <Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path='/customize' element={<Customize/>} />
            <Route path='/catalogue' element={<Catalogue/>} />
            <Route path='/sounds' element={<ChooseYourSoundsPage/>} />
            <Route path="/sample-packs" element={<SamplePacksPage />} />
            <Route path="/samples" element={<AllSamplesPage />} />
            <Route path="/pack/:packId" element={<SamplePackDetailledPage />} />
            <Route path="/upload-pack" element={<UploadPackPage />} />
            <Route path="/edit-pack/:packId" element={<EditPackPage />} />
            <Route path="/upload-sample" element={<UploadSamplePage />} />
            <Route path="/games" element={<GamesMenu />} />
            <Route path="/game/colorRush" element={<GodotGameEmbedRush />} />
            <Route path="/game/bpmMatcher" element={<GodotGameEmbedBpm />} />
            {/* User Profile Routes */}
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
            <Route path="/my-samples" element={<UserSamplesPage />} />
            <Route path="/my-packs" element={<UserPacksPage />} />
            <Route path="/my-designs" element={<MyClothDesignsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/details" element={<CheckoutDetails />} />
            <Route path="/checkout/summary" element={<CheckoutSummary />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/edit-design" element={<EditClothDesignPage />} />
            <Route path="/edit-sample/:sampleId" element={<EditSamplePage />} />
            <Route path="/my-nfts" element={<MyNftsPage />} />
        </Routes>
    );
};