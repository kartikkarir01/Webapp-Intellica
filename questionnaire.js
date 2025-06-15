
document.getElementById('questionnaireForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const data = {
    strictSleep: form.get('strictSleep'),
    permStart: form.get('permStart'),
    permEnd: form.get('permEnd'),
    travelIncluded: form.get('travelIncluded'),
    personalTimePref: form.get('personalTime'),
    personalStart: form.get('personalStart'),
    personalEnd: form.get('personalEnd'),
    familyTimePref: form.get('familyTime'),
    familyStart: form.get('familyStart'),
    familyEnd: form.get('familyEnd'),
    status: form.getAll('status'),
    statusOther: form.get('statusOther')
  };
  localStorage.setItem('userScheduleData', JSON.stringify(data));
  window.location.href = 'dayview.html';
});
