import React from 'react';
import './Sidebar.css';

function Sidebar({ onSelect, activeSection }) {
  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li onClick={() => onSelect('home')}>Home</li>
        <li onClick={() => onSelect('payments')}>Payments</li>
        <li onClick={() => onSelect('events')}>Events</li>
      </ul>

      {activeSection === 'events' && (
        <div className="legend">
          <h4>Legend</h4>
          <div className="legend-row">
            <span className="legend-box meeting"></span> Meeting
          </div>
          <div className="legend-row">
            <span className="legend-box task"></span> Task
          </div>
          <div className="legend-row">
            <span className="legend-box deadline"></span> Deadline
          </div>
          <div className="legend-row">
            <span className="legend-box overlap-mid"></span> 2 overlapping events
          </div>
          <div className="legend-row">
            <span className="legend-box overlap-high"></span> 3+ overlapping events
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
