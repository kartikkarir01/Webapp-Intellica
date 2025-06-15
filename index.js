// Example initialization
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const formData = {
  work: {
    ranges: [
      { day: 'Monday', hours: [9, 10, 11] },
      { day: 'Tuesday', hours: [14, 15] }
    ]
  },
  personal: {
    ranges: []
  }
};

// Create calendar instances
const workCalendar = new TimeSlotCalendar('work', days, formData);
const personalCalendar = new TimeSlotCalendar('personal', days, formData);