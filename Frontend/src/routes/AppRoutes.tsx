import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Customize from "../pages/Customize"
import Catalogue from "../pages/Catalogue";
import TechForSale from "../pages/TechForSale";
import CustomizeAdvanced from "../pages/CustomizeAdvanced";
// You can easily expand this later with private routes or 404 pages
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/customize' element={<Customize/>} />
      <Route path='/catalogue' element={<Catalogue/>} />
      <Route path='/tech-for-sale' element={<TechForSale/>} />
    </Routes>
  );
};
