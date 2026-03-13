function fallbackHijriCalculation(date) {
  const gregorianDate = new Date(date);
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth() + 1;
  const day = gregorianDate.getDate();

  const yearsSince622 = year - 622;
  const hijriYear = Math.floor(yearsSince622 * 365.2425 / 354.367) + 1;

  const dayOfYear = Math.floor((new Date(year, month - 1, day) - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24)) + 1;
  const hijriDayOfYear = Math.floor(dayOfYear * 354.367 / 365.2425);

  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  let hijriMonth = 1;
  let remainingDays = hijriDayOfYear;

  for (let i = 0; i < monthLengths.length; i++) {
    if (remainingDays <= monthLengths[i]) {
      hijriMonth = i + 1;
      break;
    }
    remainingDays -= monthLengths[i];
  }

  const hijriDay = remainingDays;

  const monthNames = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
  ];

  return `${hijriDay} ${monthNames[hijriMonth - 1]} ${hijriYear} AH`;
}

console.log('March 13, 2026:', fallbackHijriCalculation(new Date('2026-03-13')));
console.log('Day of year for March 13:', Math.floor((new Date(2026, 2, 13) - new Date(2026, 0, 1)) / (1000 * 60 * 60 * 24)) + 1);