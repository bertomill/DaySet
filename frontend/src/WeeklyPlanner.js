// File: frontend/src/WeeklyPlanner.js

import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Import the calendar styles

const localizer = momentLocalizer(moment);

function WeeklyPlanner() {
  const [events, setEvents] = useState([]);

  // Handle new event creation
  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('Enter event title:');
    if (title) {
      setEvents((prevEvents) => [...prevEvents, { start, end, title }]);
    }
  };

  return (
    <div style={{ height: '80vh', padding: '20px' }}>
      <h2>Weekly Planner</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        selectable
        style={{ height: '100%' }}
        onSelectSlot={handleSelectSlot}
      />
    </div>
  );
}

export default WeeklyPlanner;
