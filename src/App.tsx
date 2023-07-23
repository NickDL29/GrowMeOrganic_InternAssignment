import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FirstPage from './components/FirstPage';
import SecondPage from './components/SecondPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/second" element={<SecondPage />} />
      </Routes>
    </Router>
  );
};

export default App;
