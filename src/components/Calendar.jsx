import React, { useState, useEffect } from 'react';
import './Calendar.css';
import eventsData from '../data/events.json';

const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  // ✅ Dev-friendly event setup
  const [events, setEvents] = useState(() => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('calendarEvents');
      return eventsData;
    }

    const saved = localStorage.getItem('calendarEvents');
    return saved ? JSON.parse(saved) : eventsData;
  });

  const [showModal, setShowModal] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerMode, setPickerMode] = useState('default');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState('Meeting');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // ✅ Save to localStorage when events change (production only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));
  const getEventsForDate = (dateStr) => events.filter(e => e.date === dateStr);

  const handleCellClick = (dateStr) => {
    const evs = getEventsForDate(dateStr);
    setSelectedDate(dateStr);
    setSelectedEvents(evs);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDate('');
    setSelectedEvents([]);
    setNewTitle('');
    setNewTime('');
    setNewCategory('Meeting');
    setIsEditing(false);
    setEditIndex(null);
  };

  const handleAddEvent = () => {
    if (!newTitle || !newTime) return alert("Please fill in title and time");
    const updatedEvents = [...events];

    if (isEditing && editIndex !== null) {
      const originalEvent = selectedEvents[editIndex];
      const globalIdx = events.findIndex(
        e => e.date === originalEvent.date && e.title === originalEvent.title && e.time === originalEvent.time
      );
      updatedEvents[globalIdx] = { title: newTitle, time: newTime, category: newCategory, date: selectedDate };
    } else {
      updatedEvents.push({ title: newTitle, time: newTime, category: newCategory, date: selectedDate });
    }

    setEvents(updatedEvents);
    setSelectedEvents(getEventsForDate(selectedDate));
    closeModal();
  };

  const handleEdit = (idx) => {
    const event = selectedEvents[idx];
    setNewTitle(event.title);
    setNewTime(event.time);
    setNewCategory(event.category || 'Meeting');
    setIsEditing(true);
    setEditIndex(idx);
  };

  const handleDelete = (idx) => {
    const eventToDelete = selectedEvents[idx];
    const updatedEvents = events.filter(
      e => !(e.date === eventToDelete.date && e.title === eventToDelete.title && e.time === eventToDelete.time)
    );
    setEvents(updatedEvents);
    setSelectedEvents(updatedEvents.filter(e => e.date === selectedDate));
  };

  const categoryStyles = {
    Meeting: 'event meeting',
    meeting: 'event meeting',
    Task: 'event task',
    task: 'event task',
    Deadline: 'event deadline',
    deadline: 'event deadline'
  };

  const categoryIcons = {
    Meeting: '📅',
    meeting: '📅',
    Task: '📝',
    task: '📝',
    Deadline: '⏰',
    deadline: '⏰'
  };

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="cell empty"></div>);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

      cells.push(
        <div key={day} className={`cell ${isToday ? 'today' : ''}`} onClick={() => handleCellClick(dateStr)}>
          <div className="date">{day}</div>
          {Object.entries(dayEvents.reduce((acc, ev) => {
            acc[ev.time] = acc[ev.time] || [];
            acc[ev.time].push(ev);
            return acc;
          }, {})).sort().map(([time, group], idx) => {
            const overlapClass = group.length > 2 ? 'overlap-high' : group.length === 2 ? 'overlap-mid' : '';
            return (
              <div key={idx} className={`event-group ${overlapClass}`}>
                <div className="event-time-label">🕒 {time}</div>
                {group.map((e, i) => (
                  <div key={i} className={`${categoryStyles[e.category] || 'event'}`} title={e.title}>
                    {categoryIcons[e.category] || '📌'} {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    }
    return cells;
  };

  const handleMonthClick = (monthIndex) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowPickerModal(false);
    setPickerMode('default');
  };

  const handleYearClick = (year) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setPickerMode('month');
  };

  const generateYears = () => {
    const years = [];
    const currentYear = currentDate.getFullYear();
    const startYear = currentYear - 6;
    for (let i = startYear; i < startYear + 12; i++) years.push(i);
    return years;
  };

  return (
    <div className="calendar-container">
      <div className="header">
        <button onClick={prevMonth}>←</button>
        <h2 onClick={() => setShowPickerModal(true)}>{currentDate.toLocaleString('default', { month: 'long' })} {year}</h2>
        <button onClick={nextMonth}>→</button>
        <button className="today-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
        <button className="upcoming-btn" onClick={() => {
          const now = new Date();
          const filtered = events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
          setUpcomingEvents(filtered);
          setShowUpcomingModal(true);
        }}>📅 Show Upcoming Events</button>
      </div>

      <div className="weekdays">{daysInWeek.map(day => <div key={day} className="weekday">{day}</div>)}</div>
      <div className="grid">{renderCells()}</div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Events on {selectedDate}</h3>
            {selectedEvents.length === 0 ? <p>No events</p> : (
              <div className="modal-events">
                {selectedEvents.map((e, i) => (
                  <div key={i} className="modal-event-row">
                    <span>{categoryIcons[e.category]} <strong>{e.title}</strong> ({e.time})</span>
                    <span>
                      <button className="small-btn" onClick={() => handleEdit(i)}>✏️</button>
                      <button className="small-btn delete" onClick={() => handleDelete(i)}>🗑️</button>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="add-event-form">
              <h4>{isEditing ? 'Edit Event' : 'Add Event'}</h4>
              <input type="text" placeholder="Event Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                <option value="Meeting">Meeting</option>
                <option value="Task">Task</option>
                <option value="Deadline">Deadline</option>
              </select>
              <button onClick={handleAddEvent}>{isEditing ? 'Update' : 'Add'}</button>
            </div>
            <button className="close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {showPickerModal && (
        <div className="modal-overlay" onClick={() => { setShowPickerModal(false); setPickerMode('default'); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Month and Year</h3>
            <div className="month-year-header">
              <button onClick={() => setPickerMode('year')}>{year}</button>
              <button onClick={() => setPickerMode('month')}>{months[month]}</button>
            </div>
            {pickerMode === 'month' && <div className="month-grid">{months.map((m, idx) => <div key={m} className="month-cell" onClick={() => handleMonthClick(idx)}>{m}</div>)}</div>}
            {pickerMode === 'year' && <div className="year-grid">{generateYears().map(y => <div key={y} className="year-cell" onClick={() => handleYearClick(y)}>{y}</div>)}</div>}
          </div>
        </div>
      )}

      {showUpcomingModal && (
        <div className="modal-overlay" onClick={() => setShowUpcomingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Upcoming Events in {new Date().getFullYear()}</h3>
            {upcomingEvents.length === 0 ? <p>No upcoming events</p> : (
              <ul className="upcoming-list">
                {upcomingEvents.map((e, i) => (
                  <li key={i}><strong>{e.title}</strong><br />{e.date} @ {e.time} — <em>{e.category}</em></li>
                ))}
              </ul>
            )}
            <button className="close-btn" onClick={() => setShowUpcomingModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
