class Calendar {
  constructor() {
    // DOM elements
    this.dateElement        = document.querySelector('.date');
    this.daysContainer      = document.querySelector('.days');
    this.prevBtn            = document.querySelector('.prev');
    this.nextBtn            = document.querySelector('.next');
    this.todayBtn           = document.querySelector('.today-btn');
    this.gotoBtn            = document.querySelector('.goto-btn');
    this.dateInput          = document.querySelector('.date-input');
    this.eventDay           = document.querySelector('.event-day');
    this.eventDate          = document.querySelector('.event-date');
    this.eventsContainer    = document.querySelector('.events');
    this.addEventBtn        = document.querySelector('.add-event');
    this.addEventWrapper    = document.querySelector('.add-event-wrapper');
    this.addEventCloseBtn   = document.querySelector('.close');
    this.addEventTitle      = document.querySelector('.event-name');
    this.addEventFrom       = document.querySelector('.event-time-from');
    this.addEventTo         = document.querySelector('.event-time-to');
    this.addEventSubmit     = document.querySelector('.add-event-btn');

    // State
    this.today      = new Date();
    this.activeDay  = this.today.getDate();
    this.month      = this.today.getMonth();
    this.year       = this.today.getFullYear();
    this.eventsList = this._loadEvents();
    this.monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];

    this._init();
  }

  _init() {
    this._renderCalendar();
    this._renderEvents(this.activeDay);
    this._bindUIActions();
    this._showFooterCredit();
  }

  // Load/save
  _loadEvents() {
    return JSON.parse(localStorage.getItem('events') || '[]');
  }
  _saveEvents() {
    localStorage.setItem('events', JSON.stringify(this.eventsList));
  }

  // Helpers
  _formatDateKey(day) {
    const mm = String(this.month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${this.year}-${mm}-${dd}`;
  }
  _convertToAmPm(time24) {
    let [h, m] = time24.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${suffix}`;
  }

  // Calendar rendering
  _renderCalendar() {
    const firstDay   = new Date(this.year, this.month, 1).getDay();
    const lastDate   = new Date(this.year, this.month + 1, 0).getDate();
    const prevLast   = new Date(this.year, this.month, 0).getDate();
    let html = '';

    // Previous month's tail
    for (let i = firstDay; i > 0; i--) {
      html += `<div class="day prev-date">${prevLast - i + 1}</div>`;
    }
    // Current month days
    for (let day = 1; day <= lastDate; day++) {
      const isToday =
        day === this.today.getDate() &&
        this.month === this.today.getMonth() &&
        this.year === this.today.getFullYear();
      const hasEvt = this.eventsList.some(e => e.date === this._formatDateKey(day));
      let cls = 'day';
      if (hasEvt) cls += ' event';
      if (isToday) cls += ' today';
      html += `<div class="${cls}" data-day="${day}">${day}</div>`;
    }
    // Next month's lead
    const totalCells = firstDay + lastDate;
    const nextDays = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= nextDays; i++) {
      html += `<div class="day next-date">${i}</div>`;
    }

    this.dateElement.textContent = `${this.monthNames[this.month]} ${this.year}`;
    this.daysContainer.innerHTML  = html;

    // Highlight activeDay cell
    this.daysContainer.querySelectorAll('.day[data-day]').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.day) === this.activeDay);
    });
  }

  _renderEvents(day) {
    const key     = this._formatDateKey(day);
    const entries = this.eventsList.filter(e => e.date === key);
    if (!entries.length) {
      this.eventsContainer.innerHTML = '<div class="no-event"><h3>No Events</h3></div>';
      return;
    }
    this.eventsContainer.innerHTML = entries.map(e => {
      const title = e.title.charAt(0).toUpperCase() + e.title.slice(1);
      const time  = `${this._convertToAmPm(e.from)} - ${this._convertToAmPm(e.to)}`;
      return `
        <div class="event" data-id="${e.id}">
          <i class="fas fa-circle"></i>
          <h3 class="event-title">${title}</h3>
          <span class="event-time">${time}</span>
        </div>`;
    }).join('');
  }

  // Event CRUD
  _addEvent() {
    const title = this.addEventTitle.value.trim();
    const from  = this.addEventFrom.value;
    const to    = this.addEventTo.value;
    if (!title || !from || !to) { alert('Please fill all fields'); return; }
    const id      = Date.now();
    const dateKey = this._formatDateKey(this.activeDay);
    this.eventsList.push({ id, title, from, to, date: dateKey, repeatWeekly: false });
    this._saveEvents();
    this._renderCalendar();
    this._renderEvents(this.activeDay);
    this.addEventWrapper.classList.remove('active');
  }
  _deleteEvent(id) {
    this.eventsList = this.eventsList.filter(e => e.id !== id);
    this._saveEvents();
    this._renderCalendar();
    this._renderEvents(this.activeDay);
  }

  // UI bindings
  _bindUIActions() {
    this.prevBtn.addEventListener('click', () => { this.month--; this._renderCalendar(); });
    this.nextBtn.addEventListener('click', () => { this.month++; this._renderCalendar(); });
    this.todayBtn.addEventListener('click', () => {
      this.today = new Date();
      this.month = this.today.getMonth();
      this.year  = this.today.getFullYear();
      this._renderCalendar();
    });
    this.gotoBtn.addEventListener('click', () => {
      const [m, y] = this.dateInput.value.split('/').map(Number);
      if (m>=1 && m<=12 && String(y).length===4) { this.month=m-1; this.year=y; this._renderCalendar(); }
      else alert('Invalid Date');
    });

    this.daysContainer.addEventListener('click', e => {
      const el = e.target.closest('.day[data-day]');
      if (!el) return;
      this.activeDay = Number(el.dataset.day);
      this._renderCalendar();
      this._renderEvents(this.activeDay);
    });

    this.addEventBtn.addEventListener('click', () => this.addEventWrapper.classList.toggle('active'));
    this.addEventCloseBtn.addEventListener('click', () => this.addEventWrapper.classList.remove('active'));
    this.addEventSubmit.addEventListener('click', () => this._addEvent());

    this.eventsContainer.addEventListener('click', e => {
      const evtEl = e.target.closest('.event[data-id]');
      if (!evtEl) return;
      const id = Number(evtEl.dataset.id);
      if (confirm('Delete this event?')) this._deleteEvent(id);
    });
  }

  // Footer credit
  _showFooterCredit() {
    const cred = document.createElement('div');
    cred.innerHTML = 'A Project By <a>TeamRocket</a>';
    cred.style.cssText = 'position:absolute;bottom:0;right:0;font-size:10px;color:#ccc;padding:5px;';
    document.body.appendChild(cred);
  }
}

window.addEventListener('DOMContentLoaded', () => new Calendar());
