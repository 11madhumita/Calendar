import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import './App.css';

function App() {
  const [view, setView] = useState('events');

  return (
    <div className="app-container">
      <Sidebar onSelect={setView} activeSection={view} />

      <div className="main-content">
        {view === 'home' && <h1 style={{ textAlign: 'center' }}>Welcome to Home</h1>}

        {view === 'payments' && <h1 style={{textAlign:'center'}}>Payments Section</h1>}
        {view === 'events' && <Calendar />}
      </div>
    </div>
  );
}

export default App;
