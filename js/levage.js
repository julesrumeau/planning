// Function to calculate the date range from today
function calculateDateRange(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  let startMonth = date.getMonth() - 2;
  let endMonth = date.getMonth() + 10;
  let startYear = date.getFullYear();
  let endYear = date.getFullYear();

  if (startMonth < 0) {
    startMonth += 12;
    startYear--;
  }
  if (endMonth >= 12) {
    endMonth -= 12;
    endYear++;
  }

  let twoMonthsBefore = new Date(startYear, startMonth, 1);
  let tenMonthsAfter = new Date(endYear, endMonth + 1, 0);

  return {
    startDate: twoMonthsBefore,  // Start of the date range
    endDate: tenMonthsAfter      // End of the date range
  };
}

// Function to generate weeks between two dates
function getWeeksBetween(startDate, endDate) {
  let weeks = [];
  let currentDate = new Date(startDate);
  
  // Adjust to the Monday of the current week
  let day = currentDate.getDay();
  let diff = day <= 1 ? 1 - day : 8 - day;
  currentDate.setDate(currentDate.getDate() + diff);

  while (currentDate <= endDate) {
    let weekStart = new Date(currentDate);
    let weekEnd = new Date(currentDate);
    weekEnd.setDate(weekStart.getDate() + 6);

    let startMonth = weekStart.getMonth();
    let endMonth = weekEnd.getMonth();
    let startYear = weekStart.getFullYear();
    let endYear = weekEnd.getFullYear();

    if (startYear !== endYear) {
      const endOfYear = new Date(startYear, 11, 31);
      weeks.push({
        startMonth: startMonth,
        startYear: startYear,
        weekNumber: getISOWeekNumber(weekStart)
      });

      const startOfYear = new Date(endYear, 0, 1);
      weeks.push({
        startMonth: 0,
        startYear: endYear,
        weekNumber: getISOWeekNumber(startOfYear)
      });
    } else {
      weeks.push({
        startMonth: startMonth,
        startYear: startYear,
        weekNumber: getISOWeekNumber(weekStart)
      });
    }

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
}

// Function to get ISO week number
function getISOWeekNumber(date) {
  const d = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNum + 3);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNumber;
}

// Function to generate HTML table
function generateTable(weeks) {
  // Créer un objet pour regrouper les semaines par mois
  let weeksByMonth = {};

  // Organiser les semaines par mois dans l'objet weeksByMonth
  weeks.forEach(week => {
    const key = `${week.startYear}-${week.startMonth}`;
    if (!weeksByMonth[key]) {
      weeksByMonth[key] = [];
    }
    weeksByMonth[key].push(week);
  });

  // Générer le tableau HTML avec les mois et les semaines regroupées par colonnes
  let html = '<table style="border-collapse: collapse;"><tbody>';

  // Ligne pour les noms des mois
  html += '<tr>';
  for (const monthKey in weeksByMonth) {
    if (weeksByMonth.hasOwnProperty(monthKey)) {
      const [year, month] = monthKey.split('-');
      html += `<td colspan="3" style="border: 1px solid black; padding: 8px; text-align: center;">${getMonthName(parseInt(month))} ${year}</td>`;
    }
  }
  html += '</tr>';

  // Ligne pour les numéros de semaine
  html += '<tr>';
  for (const monthKey in weeksByMonth) {
    if (weeksByMonth.hasOwnProperty(monthKey)) {
      const monthWeeks = weeksByMonth[monthKey];
      monthWeeks.forEach(week => {
        html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">${week.weekNumber}</td>`;
      });
    }
  }
  html += '</tr>';

  html += '</tbody></table>';
  return html;
}

// Fonction pour obtenir le nom du mois à partir du numéro de mois (0-11)
function getMonthName(monthNumber) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthNumber];
}

// Calculate date range from today
const today = new Date();
const dateRange = calculateDateRange(today);
const { startDate, endDate } = dateRange;

// Generate weeks between startDate and endDate
const weeks = getWeeksBetween(startDate, endDate);

// Generate HTML table from weeks
const tableHtml = generateTable(weeks);

// Inject the generated table into the div with ID "table-container"
document.getElementById('table-container').innerHTML = tableHtml;
