import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/User/Login";
import Register from "../pages/User/Register";
import Customize from "../pages/Clothes/Customize"
import Catalogue from "../pages/Clothes/Catalogue";
import SamplesPage from "../pages/Sounds/SamplesPage";
import AllSamplesPage from "../pages/Sounds/AllSamplesPage";
import ChooseYourSoundsPage from "../pages/Sounds/ChooseYourSoundsPage";
import SamplePacksPage from "../pages/Sounds/SamplePacksPage";
import UploadPackForm from "../pages/Sounds/UploadPackForm";
import UploadSampleForm from "../pages/Sounds/UploadSampleForm";
import GodotGameEmbed from "../pages/Game/GodotGameEmbed";
import ProfilePage from "../pages/User/UserProfile";
import { CartPage } from "../pages/Cart/CartPage";
import { CheckoutDetails } from "../pages/Cart/CheckoutDetails";
import { CheckoutSummary } from "../pages/Cart/CheckoutSummary";
import { CheckoutSuccess } from "../pages/Cart/CheckoutPages";

// You can easily expand this later with private routes or 404 pages
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/customize' element={<Customize/>} />
      <Route path='/catalogue' element={<Catalogue/>} />
      <Route path='/sounds' element={<ChooseYourSoundsPage/>} />
      <Route path="/sample-packs" element={<SamplePacksPage />} />
      <Route path="/samples" element={<AllSamplesPage />} />
      <Route path="/pack/:id" element={<SamplesPage />} />
      <Route path="/upload-pack" element={<UploadPackForm />} />
      <Route path="/upload-sample" element={<UploadSampleForm />} />
      <Route path="/game" element={<GodotGameEmbed />} />
      
      {/* User Profile Routes */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />

      
       <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/details" element={<CheckoutDetails />} />
         <Route path="/checkout/summary" element={<CheckoutSummary />} />
       <Route path="/checkout/success" element={<CheckoutSuccess />} />  
    </Routes>
  );
};