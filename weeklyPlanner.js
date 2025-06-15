// weeklyPlanner.js (fixed formatting bugs)

class WeeklyPlanner {
  constructor() {
    this.dateCells     = Array.from(document.querySelectorAll('.day-date'));
    this.selectedDay   = null;
    window.currentOffset = 0;
    this.initialize();
  }

  initialize() {
    this.updateDates(window.currentOffset);
    this.dateCells.forEach((cell, i) => {
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', () => this.highlightSelectedColumn(i));
    });
    window.nextWeek  = () => this.updateDates(++window.currentOffset);
    window.prevWeek  = () => this.updateDates(--window.currentOffset);
    window.goToToday = () => this.goToToday();
  }

  updateDates(offset) {
    const base = new Date('2025-01-06');
    base.setDate(base.getDate() + offset * 7);
    this.dateCells.forEach((cell, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      cell.innerText = d.toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric'
      });
    });
    document.querySelectorAll('.event-block').forEach(el => el.remove());
    if (window.renderAllEvents) window.renderAllEvents();
    if (this.selectedDay !== null) this.highlightSelectedColumn(this.selectedDay);
  }

  highlightSelectedColumn(day) {
    this.selectedDay = day;
    document.querySelectorAll('.time-slot').forEach(slot => {
      const d = +slot.dataset.day;
      slot.style.outline = d === day ? '2px solid #2563eb' : 'none';
      slot.style.backgroundColor = d === day ? '#e6f0ff' : '';
    });
    this.dateCells.forEach((cell, i) => {
      cell.style.backgroundColor = i === day ? '#e6f0ff' : '';
      cell.style.borderRadius    = i === day ? '6px' : '';
    });
  }

  goToToday() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const pst = new Date(utc - 8 * 60 * 60000);
    const jan5= new Date('2025-01-06');
    const diff = Math.floor((pst - jan5) / (7 * 24 * 60 * 60 * 1000));
    window.currentOffset = diff;
    this.updateDates(diff);
    this.highlightSelectedColumn(pst.getDay());
  }
}

document.addEventListener('DOMContentLoaded', () => new WeeklyPlanner());

// --- Event rendering ---
class CalendarEventRenderer {
  constructor(e) {
    this.id            = e.id;
    this.title         = e.title.charAt(0).toUpperCase() + e.title.slice(1);
    this.start24       = e.from;
    this.end24         = e.to;
    this.day           = parseInt(e.day);
    this.repeatWeekly  = !!e.repeatWeekly;
    this.color         = this.pickColor(this.title);
    this.startDisplay  = this.toAmPm(this.start24);
    this.endDisplay    = this.toAmPm(this.end24);
  }

  pickColor(title) {
    const t = title.toLowerCase();
    if (t === 'sleep')         return '#6c63ff';
    if (t === 'travel')        return '#46b2e0';
    if (t === 'personal time') return '#4caf50';
    if (t === 'family time')   return '#f44336';
    return '#8e44ad';
  }

  toHour(t) {
    const [h, m] = t.split(':').map(Number);
    return m >= 30 ? h + 1 : h;
  }

  toAmPm(t) {
    let [h, m] = t.split(':').map(Number);
    const ap   = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`;
  }

  renderBlock() {
    const renderSegment = (day, from24, to24) => {
      const start    = this.toHour(from24);
      const end      = this.toHour(to24);
      const duration = ((end - start + 24) % 24) || 24;
      const slot     = document.querySelector(
        `.time-slot[data-day="${day}"][data-hour="${start}"]`
      );
      if (!slot) return;

      const div = document.createElement('div');
      div.className = 'event-block';
      div.innerHTML = `
        <strong>${this.title}</strong><br>
        <span style="font-size:11px">${this.startDisplay} - ${this.endDisplay}</span>
      `;
      Object.assign(div.style, {
        backgroundColor: this.color,
        position: 'absolute',
        top     : '0',
        left    : '0',
        right   : '0',
        height  : `${duration * 50}px`,
        borderRadius: '6px',
        color       : '#fff',
        padding     : '4px',
        fontSize    : '12px',
        zIndex      : '10',
        marginTop   : '2px',
        boxSizing   : 'border-box',
        textAlign   : 'center'
      });

      div.addEventListener('click', evt => this.openEdit(evt));
      div.addEventListener('contextmenu', evt => this.openDelete(evt));
      slot.appendChild(div);
    };

    const base   = new Date('2025-01-06');
    base.setDate(base.getDate() + (window.currentOffset || 0) * 7 + this.day);
    const [sh,sm] = this.start24.split(':').map(Number);
    const [eh,em] = this.end24  .split(':').map(Number);
    const startMin = sh*60 + sm;
    const endMin   = eh*60 + em;

    if (startMin >= endMin) {
      renderSegment(this.day, this.start24, '24:00');
      renderSegment((this.day + 1) % 7, '00:00', this.end24);
    } else {
      renderSegment(this.day, this.start24, this.end24);
    }
  }

  openEdit(evt) {
    evt.stopPropagation();
    document.getElementById('modalEventId').value    = this.id;
    document.getElementById('modalEventTitle').value = this.title;
    document.getElementById('modalFrom').value       = this.start24;
    document.getElementById('modalTo').value         = this.end24;
    document.querySelectorAll('.repeat-day').forEach(cb => cb.checked = +cb.value === this.day);
    document.getElementById('repeatAllDays').checked = false;
    document.getElementById('repeatWeekly').checked  = this.repeatWeekly;
    document.getElementById('eventModal').style.display = 'flex';
  }

  openDelete(evt) {
    evt.preventDefault();
    if (confirm(`Delete '${this.title}'?`)) {
      let evs = JSON.parse(localStorage.getItem('events') || '[]');
      evs = evs.filter(e => e.id !== this.id);
      localStorage.setItem('events', JSON.stringify(evs));
      document.querySelectorAll('.event-block').forEach(el => el.remove());
      window.renderAllEvents();
    }
  }
}

window.renderAllEvents = () => {
  const data  = JSON.parse(localStorage.getItem('userScheduleData')) || {};
  const events= JSON.parse(localStorage.getItem('events')) || [];

  // Preset routines
  ['Sleep','Travel','Personal Time','Family Time'].forEach((title, idx) => {
    const keyMap = ['strictSleep','travelIncluded','personalTimePref','familyTimePref'][idx];
    const startKey = ['permStart','', 'personalStart','familyStart'][idx];
    const endKey   = ['permEnd','', 'personalEnd','familyEnd'][idx];
    const enabled = idx===1 ? (data[keyMap]==='yes') : (data[keyMap] && data[keyMap]!=='later');
    if (enabled && data[startKey] && data[endKey] || idx===1) {
      for (let d=0; d<7; d++) {
        new CalendarEventRenderer({
          id: -1 - idx,
          title,
          from: idx===1 ? '08:00' : data[startKey],
          to:   idx===1 ? '09:00' : data[endKey],
          day: d,
          repeatWeekly: true
        }).renderBlock();
      }
    }
  });

  // User events
  const base = new Date('2025-01-06');
  base.setDate(base.getDate() + (window.currentOffset || 0)*7);
  const weekDates = [...Array(7)].map((_,i) => {
    const d = new Date(base);
    d.setDate(base.getDate()+i);
    return d.toISOString().split('T')[0];
  });
  events.forEach(e => {
    if (e.repeatWeekly || weekDates.includes(e.date)) {
      new CalendarEventRenderer(e).renderBlock();
    }
  });
};

document.addEventListener('DOMContentLoaded', () => window.renderAllEvents());
