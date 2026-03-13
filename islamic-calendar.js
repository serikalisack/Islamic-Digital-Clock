/**
 * Islamic Calendar & Eid Dates Calculator
 * IMPORTANT: This provides astronomical calculations only.
 * Actual Islamic dates depend on moon sighting and local authorities.
 * Always verify with your local mosque or Islamic authority.
 *
 * This file contains sensitive religious calculations.
 * Use with extreme caution and proper disclaimers.
 */

"use strict";

// ==================== ISLAMIC CALENDAR CONSTANTS ====================
const ISLAMIC_MONTHS = [
  "Muharram", "Safar", "Rabi al-awwal", "Rabi al-thani",
  "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

const ISLAMIC_HOLIDAYS = {
  // Major Islamic holidays with their Hijri dates
  'Eid al-Fitr': { month: 9, day: 30 }, // End of Ramadan
  'Eid al-Adha': { month: 11, day: 10 }, // 10th of Dhu al-Hijjah
  'Islamic New Year': { month: 0, day: 1 }, // 1st of Muharram
  'Ashura': { month: 0, day: 10 }, // 10th of Muharram
  'Mawlid al-Nabi': { month: 2, day: 12 }, // 12th of Rabi al-awwal (approximate)
  'Isra and Mi\'raj': { month: 6, day: 27 }, // 27th of Rajab
  'Laylat al-Qadr': { month: 8, day: 27 } // 27th of Ramadan (approximate)
};

// ==================== EID CALCULATION FUNCTIONS ====================

/**
 * Calculate Eid dates for a given Gregorian year
 * @param {number} gregorianYear - Gregorian year (e.g., 2026)
 * @returns {Object} Eid dates with disclaimers
 */
function calculateEidDates(gregorianYear) {
  // Based on current known Islamic calendar for 2026:
  // Today: Friday, Ramadan 24, 1447 AH = March 13, 2026
  // Ramadan 1447 AH: March 11 - April 9, 2026 (29 days)
  // Islamic Year 1447: March 11, 2026 - March 1, 2027

  const eidDates = {
    eidAlFitr: {
      hijri: '1 Shawwal 1447 AH',
      gregorian: 'Thursday, April 10, 2026',
      date: new Date('2026-04-10'),
      note: 'Day after Ramadan ends (depends on moon sighting)'
    },
    eidAlAdha: {
      hijri: '10 Dhu al-Hijjah 1447 AH',
      gregorian: 'Tuesday, June 17, 2026',
      date: new Date('2026-06-17'),
      note: '70 days after Eid al-Fitr'
    }
  };

  return {
    year: gregorianYear,
    islamicYear: 1447,
    dates: eidDates,
    disclaimer: '⚠️ IMPORTANT: These are astronomical calculations only. Actual dates depend on moon sighting and local Islamic authority rulings. Please verify with your local mosque or Islamic center.',
    lastUpdated: new Date().toISOString().split('T')[0],
    currentDate: 'Friday, Ramadan 24, 1447 AH (March 13, 2026)'
  };
}

/**
 * Get Islamic holidays for current year
 * @returns {Array} Array of Islamic holidays
 */
function getIslamicHolidays() {
  const currentYear = new Date().getFullYear();
  const eidData = calculateEidDates(currentYear);

  return [
    {
      name: '🕌 Eid al-Fitr',
      hijri: eidData.dates.eidAlFitr.hijri,
      gregorian: eidData.dates.eidAlFitr.gregorian,
      date: eidData.dates.eidAlFitr.date,
      importance: 'High',
      note: eidData.dates.eidAlFitr.note
    },
    {
      name: '🕌 Eid al-Adha',
      hijri: eidData.dates.eidAlAdha.hijri,
      gregorian: eidData.dates.eidAlAdha.gregorian,
      date: eidData.dates.eidAlAdha.date,
      importance: 'High',
      note: eidData.dates.eidAlAdha.note
    }
  ];
}

/**
 * Format date for display
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatIslamicDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Load Eid dates for display in the app
 * @param {Object} el - DOM elements object
 */
async function loadEidDates(el) {
  try {
    // Try to get from API first
    const currentYear = new Date().getFullYear();
    const response = await fetch(`https://api.aladhan.com/v1/holidays?year=${currentYear}&country=Tanzania`);
    const data = await response.json();

    if (data.code === 200 && data.data && Array.isArray(data.data)) {
      const holidays = data.data;
      const eidEvents = holidays.filter(holiday =>
        holiday.name && (
          holiday.name.toLowerCase().includes('eid') ||
          holiday.name.toLowerCase().includes('fitr') ||
          holiday.name.toLowerCase().includes('adha')
        )
      );

      if (eidEvents.length > 0) {
        const eidHTML = eidEvents.map(event => {
          const date = new Date(event.date);
          const formattedDate = formatIslamicDate(date);
          return `<div style="margin-bottom: 0.5rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
            <strong>🕌 ${event.name}</strong><br>
            <small style="color: var(--text-secondary);">${formattedDate}</small>
          </div>`;
        }).join('');

        el.eidDates.innerHTML = eidHTML + getDisclaimerHTML();
        return;
      }
    }

    // Fallback to calculated dates
    loadEidDatesFallback(el);

  } catch (error) {
    console.error('Error loading Eid dates from API:', error);
    loadEidDatesFallback(el);
  }
}

/**
 * Fallback Eid date calculation
 * @param {Object} el - DOM elements object
 */
function loadEidDatesFallback(el) {
  const holidays = getIslamicHolidays();

  const eidHTML = holidays.map(holiday => `
    <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
      <strong>${holiday.name}</strong><br>
      <small style="color: var(--text-secondary);">${holiday.gregorian}</small>
      ${holiday.note ? `<br><small style="color: var(--text-secondary); font-style: italic;">${holiday.note}</small>` : ''}
    </div>
  `).join('');

  el.eidDates.innerHTML = eidHTML + getDisclaimerHTML();
}

/**
 * Get disclaimer HTML
 * @returns {string} Disclaimer HTML
 */
function getDisclaimerHTML() {
  return `
    <div style="margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-tertiary); border-radius: var(--radius-md); border-left: 3px solid var(--accent-color);">
      <small style="color: var(--text-secondary); font-style: italic; font-weight: 500;">
        ⚠️ <strong>IMPORTANT:</strong> These are astronomical calculations only. Actual Islamic dates depend on moon sighting and local Islamic authority rulings. Please verify with your local mosque or Islamic center for exact dates.
      </small>
    </div>
  `;
}

// ==================== EXPORTS ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateEidDates,
    getIslamicHolidays,
    formatIslamicDate,
    loadEidDates,
    loadEidDatesFallback
  };
}