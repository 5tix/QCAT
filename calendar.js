const calendarHeaderMonth = document.querySelector('.calendar-header__month');
const calendarPrevBtn = document.querySelector('.calendar-header__btn--prev');
const calendarNextBtn = document.querySelector('.calendar-header__btn--next');
const calendarBodyDays = document.querySelector('.calendar-body__days');
let selectedDate = new Date();

function renderCalendar(date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const prevMonthEnd = new Date(date.getFullYear(), date.getMonth(), 0);
  const today = new Date();

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = [];

  // Add previous month's days
  for (let i = monthStart.getDay(); i > 0; i--) {
    const prevDay = prevMonthEnd.getDate() - i + 1;
    const prevDate = new Date(date.getFullYear(), date.getMonth() - 1, prevDay);
    days.push({date: prevDate, isCurrentMonth: false, isToday: false});
  }

  // Add current month's days
  for (let i = 1; i <= monthEnd.getDate(); i++) {
    const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
    const isToday = currentDate.toDateString() === today.toDateString();
    days.push({date: currentDate, isCurrentMonth: true, isToday: isToday});
  }

  // Add next month's days
  for (let i = 1; i <= 6 - monthEnd.getDay(); i++) {
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, i);
    days.push({date: nextDate, isCurrentMonth: false, isToday: false});
  }

  const monthName = date.toLocaleString('default', { month: 'long' });
  calendarHeaderMonth.textContent = monthName + ' ' + date.getFullYear();

  calendarBodyDays.innerHTML = '';

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const dayElement = document.createElement('div');
    dayElement.classList.add('calendar-body__day');
    dayElement.classList.toggle('calendar-body__day--current-month', day.isCurrentMonth);
    dayElement.classList.toggle('calendar-body__day--today', day.isToday);
    dayElement.dataset.date = day.date.toISOString();

    const dayNumber = day.date.getDate();
    dayElement.textContent = dayNumber;

    dayElement.addEventListener('click', function() {
      const selectedDayElement = document.querySelector('.calendar-body__day--selected');
      if (selectedDayElement) {
        selectedDayElement.classList.remove('calendar-body__day--selected');
      }
      dayElement.classList.add('calendar-body__day--selected');
      selectedDate = new Date(day.date);
    });

    calendarBodyDays.appendChild(dayElement);
  }
}

renderCalendar(new Date());

calendarPrevBtn.addEventListener('click', function() {
  const currentMonth = new Date(calendarHeaderMonth.textContent);
  const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  renderCalendar(prevMonth);
});

calendarNextBtn.addEventListener('click', function() {
  const currentMonth = new Date(calendarHeaderMonth.textContent);
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  renderCalendar(nextMonth);
});
