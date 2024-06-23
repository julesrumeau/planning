
document.addEventListener("DOMContentLoaded", function() {
  generateTable();
  initModalLeveur();
  initModalChantier();
});

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
function generateTable() {


  const today = new Date();
  const dateRange = calculateDateRange(today);
  const { startDate, endDate } = dateRange;

  // Generate weeks between startDate and endDate
  var weeks = getWeeksBetween(startDate, endDate);



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
  let html = '<table id="tableauLeveur" style="border-collapse: collapse;"><tbody>';

  // Ligne pour les noms des mois
  html += '<tr>';
  html += `<td colspan="8" style="border: 1px solid black; padding: 8px; text-align: center;"></td>`;

  for (const monthKey in weeksByMonth) {
    if (weeksByMonth.hasOwnProperty(monthKey)) {
      const [year, month] = monthKey.split('-');
      var colspan = weeksByMonth[monthKey].length;

      const lastWeek = weeksByMonth[monthKey][weeksByMonth[monthKey].length - 1];

      if (month == 11 && lastWeek.weekNumber == 1) {
        colspan -= 1;
      }

      html += `<td colspan="${colspan}" style="border: 1px solid black; padding: 8px; text-align: center;">${getMonthName(parseInt(month))} ${year}</td>`;
    }
  }
  html += '</tr>';

  // Ligne pour les numéros de semaine
  html += '<tr>';

  html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">Levateur</td>`;
  html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">Action</td>`;
  html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">N°</td>`;
  html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">Chantier</td>`;
  html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">Dep</td>`;
  html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">MOA</td>`;
  html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">MOE</td>`;
  html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">Sem</td>`;

  for (const monthKey in weeksByMonth) {
    if (weeksByMonth.hasOwnProperty(monthKey)) {
      const monthWeeks = weeksByMonth[monthKey];
      
      monthWeeks.forEach(week => {
        if (week.weekNumber == 1 && week.startMonth == 11) {
          return;
        }
        html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">${week.weekNumber}</td>`;
      });
    }
  }

  html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">Action</td>`;

  html += '</tr>';

  html += defLevateur();

  html += '<tr class="ligneVide"></tr>';
  html += '<tr><td><button type="button" class="btn btn-primary" id="openmodalleveur">Ajouter un Leveur</button></td></tr>';
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









function defLevateur() {
  var dataLeveur = JSON.parse(localStorage.getItem("dataLeveur")) || [];
  console.log(dataLeveur);

  var html = "";

  dataLeveur.forEach((levateur, index) => {
      html += '<tr class="ligneVide"></tr>';
      html += `<tr>
                  <td style="border: 1px solid black; padding: 8px; text-align: center;">${levateur[0]}</td>
                  <td><button type="button" class="btn btn-primary openmodalchantier" data-leveur="${levateur[0]}">Ajouter un Chantier</button></td>`;

      levateur.forEach((chantier) => {
        
        html += `<td style="border: 1px solid black; padding: 8px; text-align: center;">${chantier}</td>`;

      });

      
      html += "</tr>";
  });

  return html;
}



function ajouterLeveur() {
  var nom = document.getElementById('nameInput').value;
  var dataLeveur = JSON.parse(localStorage.getItem("dataLeveur")) || [];

  var currentleveur = [];
  currentleveur.push(nom);
  dataLeveur.push(currentleveur);

  localStorage.setItem("dataLeveur", JSON.stringify(dataLeveur));
  generateTable();
}

function ajouterChantier(leveur, chantier) {
  var dataLeveur = JSON.parse(localStorage.getItem("dataLeveur")) || [];

  // Parcourir les leveurs
  dataLeveur.forEach(l => {
      if (l[0] === leveur) {
          // Si le levageur a déjà une liste de chantiers, ajouter à cette liste
          // Sinon, créer une nouvelle liste de chantiers
          if (!l[1]) {
              l[1] = [];
          }
          l[1].push(chantier);
      }
  });

  // Sauvegarder les données mises à jour dans le localStorage
  localStorage.setItem("dataLeveur", JSON.stringify(dataLeveur));
}


function initModalLeveur() {
    document.getElementById('openmodalleveur').addEventListener('click', function() {
        $('#levageModal').modal('show');
    });

    document.querySelector('.close').addEventListener('click', function() {
        $('#levageModal').modal('hide');
    });

    document.getElementById('confirmBtn').addEventListener('click', function() {
        ajouterLeveur();
        $('#levageModal').modal('hide');
    });
}

function initModalChantier() {
  // Remplir la liste des chantiers
  var chantiers = JSON.parse(localStorage.getItem("dataChantier")) || [];
  var chantierSelect = document.getElementById('chantierSelect');
  chantierSelect.innerHTML = ""; // Clear existing options
  chantiers.forEach(chantier => {
      let option = document.createElement('option');
      option.value = chantier["nom"];
      option.text = chantier["nom"];
      chantierSelect.add(option);
  });

  // Utiliser l'événement délégué pour les boutons dynamiques
  document.getElementById('tableauLeveur').addEventListener('click', function(event) {
      if (event.target && event.target.classList.contains('openmodalchantier')) {
          var leveur = event.target.getAttribute('data-leveur');
          $('#chantierModal').modal('show');

          // Attacher l'événement de confirmation à la modal de chantier
          document.getElementById('confirmChantierBtn').onclick = function() {
              var chantierSelectionne = document.getElementById('chantierSelect').value;
              ajouterChantier(leveur, chantierSelectionne);
              $('#chantierModal').modal('hide');
          };
      }
  });

  document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', function() {
          $('#chantierModal').modal('hide');
      });
  });
}


 // Fonction pour générer une chaîne aléatoire
 function getRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


// Fonction pour remplir et afficher la modale
function showModalWithChoices() {
  // Vider la liste des choix
  choiceList.innerHTML = '';

  // Générer une liste de choix aléatoires
  const choices = [];
  for (let i = 0; i < 10; i++) {
    choices.push(getRandomString(8));
  }

  // Ajouter les choix à la liste
  choices.forEach(choice => {
    const li = document.createElement("li");
    li.innerHTML = `<label><input type="radio" name="choice" value="${choice}"> ${choice}</label>`;
    choiceList.appendChild(li);
  });

  // Afficher la modale
  modal.style.display = "block";
}
