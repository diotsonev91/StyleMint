import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Customize from "../pages/Customize"
import Catalogue from "../pages/Catalogue";
import SamplesPage from "../pages/SamplesPage";
import AllSamplesPage from "../pages/AllSamplesPage";
import ChooseYourSoundsPage from "../pages/ChooseYourSoundsPage";
import SamplePacksPage from "../pages/SamplePacksPage";
import UploadPackForm from "../pages/UploadPackForm";
import UploadSampleForm from "../pages/UploadSampleForm";
import AddMintToItem from "../pages/AddMintToItem";
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
    <Route path="/add-mint" element={<AddMintToItem />} />
    </Routes>
  );
};
