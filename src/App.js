import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/register';
import PrivateComponent from './components/PrivateComponent';
import Recipes from './components/Recipes';
import AddRecipe from './components/AddRecipe';
import LikedProducts from './components/LikedProducts';
import ForgotPassword from './components/Forgot';
import OwnerInformation from './components/OwnerInformation';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Private routes */}
        <Route element={<PrivateComponent />}>
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/liked-products" element={<LikedProducts />} />
          <Route path="/owner-information" element={<OwnerInformation />} />
        </Route>

        {/* Optional: fallback route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
