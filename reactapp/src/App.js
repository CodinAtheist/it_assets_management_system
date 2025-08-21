import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AssetList from './components/AssetList';
import AddAssetForm from './components/AddAssetForm';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>IT Asset Management System</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<AssetList />} />
            <Route path="/add" element={<AddAssetForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
