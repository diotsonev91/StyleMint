import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CustomizeTshirt from "../pages/CustomizeTshirt"
import Catalogue from "../pages/Catalogue";
import TechForSale from "../pages/TechForSale";
// You can easily expand this later with private routes or 404 pages
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/customize' element={<CustomizeTshirt/>} />
      <Route path='/catalogue' element={<Catalogue/>} />
      <Route path='/tech-for-sale' element={<TechForSale/>} />
    </Routes>
  );
};
