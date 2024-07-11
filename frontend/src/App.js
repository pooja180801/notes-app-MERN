import React from 'react'
import Home from './pages/Home'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Login from './pages/Login';
import Register from './pages/Register';



const App = () => {
  return (
        <Router>
          <Routes>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Router>
  );
}

export default App
