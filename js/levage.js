
document.addEventListener("DOMContentLoaded", function() {
  initModalLeveur();
  initModalChantier();
});


window.semaineDebutGlobal = null;
window.nbrsemaine = null;
window.todaykey = null;

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

  window.semaineDebutGlobal = weeks[0]["startYear"] + "-" + weeks[0]["weekNumber"]
  window.nbrsemaine = weeks.length

  // Organiser les semaines par mois dans l'objet weeksByMonth
  weeks.forEach(week => {
    const key = `${week.startYear}-${week.startMonth}`;
    if (!weeksByMonth[key]) {
      weeksByMonth[key] = [];
    }
    weeksByMonth[key].push(week);
  });


  const day = today.getDate();
  const month = today.getMonth() + 1; // Les mois sont indexés à partir de 0, donc on ajoute 1
  const year = today.getFullYear();
  const weekNumber = getWeekNumber(today); // Assume que getWeekNumber est une fonction qui retourne le numéro de semaine
  window.todaykey = `${year}-${weekNumber}`;

  
  // Formater en jour/mois/année
  const formattedDate = `${day}/${month}/${year}`;


  // Générer le tableau HTML avec les mois et les semaines regroupées par colonnes
  let html = '<table id="tableauLeveur" style="border-collapse: collapse;"><tbody>';

  html += '<tr>';
  html += `<td>${formattedDate}</td>`;
  html += `<td colspan="1000"><h1>LEVAGE ${year}</h1></td>`;
  html += '<tr class="ligneVide"></tr>';

  html += '</tr>';

  // Ligne pour les noms des mois
  html += '<tr>';
  html += `<td colspan="9"></td>`;

  for (const monthKey in weeksByMonth) {
    if (weeksByMonth.hasOwnProperty(monthKey)) {
      const [year, month] = monthKey.split('-');
      var colspan = weeksByMonth[monthKey].length;

      const lastWeek = weeksByMonth[monthKey][weeksByMonth[monthKey].length - 1];

      if (month == 11 && lastWeek.weekNumber == 1) {
        colspan -= 1;
      }

      html += `<td colspan="${colspan}">${getMonthName(parseInt(month))} ${year}</td>`;
    }
  }
  html += '</tr>';

  // Ligne pour les numéros de semaine
  html += '<tr>';

  html += `<td>Levateur</td>`;
  html += `<td colspan="2">Action</td>`;
  html += `<td>N°</td>`;
  html += `<td>Chantier</td>`;
  html += `<td>Dep</td>`;
  html += `<td>MOA</td>`;
  html += `<td>MOE</td>`;
  html += `<td>Sem</td>`;

  for (const monthKey in weeksByMonth) {
    if (weeksByMonth.hasOwnProperty(monthKey)) {
      const monthWeeks = weeksByMonth[monthKey];
      monthWeeks.forEach(week => {
        if (week.weekNumber == 1 && week.startMonth == 11) {
          return;
        }
        html += `<td class="taillefix">${week.weekNumber}</td>`;
      });
    }
  }

  html += `<td>Action</td>`;

  html += '</tr>';

  html += defLevateur();

  html += '<tr class="ligneVide"></tr>';
  html += '<tr><td><button type="button" class="btn btn-primary" id="openmodalleveur">Ajouter un Leveur</button></td></tr>';


  html += '</tbody></table>';


  return html;
}




function deleteLeveur(button) {
  var row = button.closest("tr");

  if (row) {
    // Essayer de trouver le premier td dans la ligne actuelle
    var firstTd = row.querySelector("td:first-child");

    // Si aucun premier td n'est trouvé ou s'il est vide, vérifier la ligne précédente
    while ((!firstTd || !firstTd.textContent.trim()) && row.previousElementSibling) {
      row = row.previousElementSibling;
      firstTd = row.querySelector("td:first-child");
    }

    // Afficher la valeur du premier td trouvé
    if (firstTd && firstTd.textContent.trim()) {
      console.log("Premier td: " + firstTd.textContent.trim()); // Afficher la valeur du premier td
    } else {
      console.log("Aucun premier <td> trouvé dans la ligne courante ou les lignes précédentes.");
    }

  } else {
    console.log("Aucun élément <tr> parent trouvé.");
  }


  var currentLeveur = firstTd.textContent.trim();


  
  var dataLeveur = JSON.parse(localStorage.getItem("dataLeveur")) || [];

  
  var newDataLeveur = [];
  
  
  for (var i = 0; i < dataLeveur.length; i++) {

    if (dataLeveur[i] != null && dataLeveur[i][0] != currentLeveur) {
      newDataLeveur[i] = [];
      newDataLeveur[i] = dataLeveur[i];
    }

  }


  localStorage.setItem("dataLeveur", JSON.stringify(newDataLeveur));
  window.location.reload();



}

// Fonction pour obtenir le nom du mois à partir du numéro de mois (0-11)
function getMonthName(monthNumber) {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
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

setcolortable();






function defLevateur() {
  var dataLeveur = JSON.parse(localStorage.getItem("dataLeveur")) || [];
  var dataChantier = JSON.parse(localStorage.getItem("dataChantier")) || [];

  var indexedDataChantier = {};
  var keyDebut = null;
  var keyDebutFin = null;



  dataChantier.forEach(obj => {
      indexedDataChantier[obj.nom] = obj;
  });


  const keyPersonnel = getAllKeySemainePersonnel();

  var html = "";

  var chantiers = null;
  dataLeveur.forEach((levateur, index) => {

    if (levateur == null) {
      return;

    }
      var rowspanValue = (levateur[1] && Array.isArray(levateur[1])) ? levateur[1].length : 1;

      html += '<tr class="ligneVide"></tr>';
      html += `<tr>
                  <td rowspan="${rowspanValue}">${levateur[0]}</td>
                  <td rowspan="${rowspanValue}"><button type="button" id="ajouterChantier" class="btn btn-primary openmodalchantier" data-leveur="${levateur[0]}"><i class="fa fa-plus"></i></button></td>
                  <td rowspan="${rowspanValue}"><button type="button" class="btn btn-danger" onclick="deleteLeveur(this)"><i class="fa fa-trash"></i></button></td>`;


      chantiers = levateur[1];
      if (typeof chantiers != 'undefined') {

        for (var i = 0; i < chantiers.length; i++) {

          if (chantiers[i] != null) {

            var semainedebut = new Date(indexedDataChantier[chantiers[i]]["dateDebutLevage"]);
            var numeroSemaine = getWeekNumber(semainedebut);
            var currentAnne = indexedDataChantier[chantiers[i]]["dateDebutLevage"].substring(0, 4);
            var keyDebut = currentAnne + "-" + numeroSemaine;
            
            let indexDernierTiret = window.semaineDebutGlobal.lastIndexOf("-");
            var anneDebut = window.semaineDebutGlobal.substring(0, 4);
            let numeroSemaineDebut = window.semaineDebutGlobal.substring(indexDernierTiret + 1);
            numeroSemaineDebut = parseInt(numeroSemaineDebut, 10);


            html += `<td></td>`;
            html += `<td>${chantiers[i]}</td>`;
            html += `<td>${indexedDataChantier[chantiers[i]]["dep"]}</td>`;
            html += `<td>${indexedDataChantier[chantiers[i]]["moa"]}</td>`;
            html += `<td>${indexedDataChantier[chantiers[i]]["moe"]}</td>`;

            if (indexedDataChantier[chantiers[i]]["estVendu"]) {
              html += `<td class="vendu">${numeroSemaine}</td>`;
            } else {
              html += `<td>${numeroSemaine}</td>`;
            }

            var nombreSemaineLevage =  indexedDataChantier[chantiers[i]]["nombreSemaineLevage"];
            nombreSemaineLevage = parseInt(nombreSemaineLevage, 10);
            var dureelevage =  (numeroSemaine + nombreSemaineLevage);
            var anneDebutLevage = indexedDataChantier[chantiers[i]]["dateDebutLevage"].substring(0, 4);
            keyDebutFin = anneDebutLevage + "-" + dureelevage;

            window.nbrsemaine
            var coloredClass = '';
            var hachureClass = '';
            var isBeforeToday = true;

            for (var j = 0; j < window.nbrsemaine - 1; j++) {
              
              if (numeroSemaineDebut % 52 == 1) {
                anneDebut = (parseInt(anneDebut) + 1).toString();
              }
              
              currentKey = anneDebut + "-" + numeroSemaineDebut;

              numeroSemaineDebut = numeroSemaineDebut % 52;
              numeroSemaineDebut += 1;

              if (currentKey == window.todaykey) {
                isBeforeToday = false;
              }

              if (currentKey == keyDebut) {
                coloredClass =  `case-colored-${levateur[0]}`;
                hachureClass = isBeforeToday ? 'hachure' : '';
              } 
              if (currentKey == keyDebutFin) {
                coloredClass = '';
              }
              if (currentKey == window.todaykey) {
                hachureClass = '';
              }
              
              var petitPointClass = keyPersonnel.includes(currentKey) ? '' : 'dots-background';

              html += `<td id="${currentKey}"class="${coloredClass} ${hachureClass} ${petitPointClass}"></td>`;
            }

            html += `<td><button type="button" id="retierChantier" class="btn btn-danger" onclick="retirerChantier(this)">Retirer</button></td>`;
            
            html += "</tr>";

          };
        }
      } else {
        html += "</tr>";
      }





      
  });

  return html;
}


function retirerChantier(button) {
  // Trouver la ligne (tr) parente de ce bouton
  var row = button.closest("tr");

  if (row) {
    // Essayer de trouver le premier td dans la ligne actuelle
    var firstTd = row.querySelector("td:first-child");
    var fourthTd = row.querySelector("td:nth-child(2)");
    var buttonInCell = fourthTd.querySelector("#ajouterChantier");

    if (buttonInCell) {
      fourthTd = row.querySelector("td:nth-child(5)");
    }


    // Si aucun premier td n'est trouvé ou s'il est vide, vérifier la ligne précédente
    while ((!firstTd || !firstTd.textContent.trim()) && row.previousElementSibling) {
      row = row.previousElementSibling;
      firstTd = row.querySelector("td:first-child");
    }

    // Afficher la valeur du premier td trouvé
    if (firstTd && firstTd.textContent.trim()) {
      console.log("Premier td: " + firstTd.textContent.trim()); // Afficher la valeur du premier td
    } else {
      console.log("Aucun premier <td> trouvé dans la ligne courante ou les lignes précédentes.");
    }

    // Afficher la valeur du quatrième td de la ligne courante
    if (fourthTd && fourthTd.textContent.trim()) {
      console.log("Quatrième td: " + fourthTd.textContent.trim()); // Afficher la valeur du quatrième td
    } else {
      console.log("Aucun quatrième <td> trouvé dans la ligne courante.");
    }
  } else {
    console.log("Aucun élément <tr> parent trouvé.");
  }


  var currentLeveur = firstTd.textContent.trim();
  var currentChantier = fourthTd.textContent.trim();

  var dataLeveur = JSON.parse(localStorage.getItem("dataLeveur")) || [];

  
  var newDataLeveur = [];
  
  
  for (var i = 0; i < dataLeveur.length; i++) {

    if (dataLeveur[i] != null) {
      newDataLeveur[i] = [];
      newDataLeveur[i][0] = dataLeveur[i][0];
      if (!newDataLeveur[i][1]) {
        newDataLeveur[i][1] = [];
      }

      if (typeof dataLeveur[i][1] != 'undefined') {
        for (var j = 0; j < dataLeveur[i][1].length; j++) {

          if (dataLeveur[i][1][j] != currentChantier || dataLeveur[i][0] != currentLeveur) {
          
            newDataLeveur[i][1].push(dataLeveur[i][1][j]);
          }

        } 
      }
    }

  }


  localStorage.setItem("dataLeveur", JSON.stringify(newDataLeveur));
  window.location.reload();

}

function getKeyYearAndWeek(dateStr) {
  // Convertir la chaîne en objet Date
  const date = new Date(dateStr);
  
  // Récupérer l'année
  const year = date.getFullYear();
  
  // Calculer le numéro de la semaine
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  
  // Récupérer le jour de la semaine pour le premier jour de l'année (0 = Dimanche, 6 = Samedi)
  const firstDayOfWeek = firstDayOfYear.getDay() || 7;

  // Calculer le numéro de la semaine
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfWeek) / 7);
  
  // Retourner la concaténation de l'année et du numéro de la semaine
  return `${year}-${weekNumber}`;
}

function getAllKeySemainePersonnel() {
  
  const allDays = calculatejours();

  //pas opti mais flemme
  var currentKey = "";
  var lastKey = "";
  var res = [];
  allDays.forEach(day => {
    currentKey = getKeyYearAndWeek(day);
    if (currentKey !== lastKey) {
      res.push(currentKey);
      lastKey = currentKey;
    } 
  });
  console.log(res);

  
  return res;

}



function ajouterLeveur() {
  var nom = document.getElementById('nameInput').value;
  var dataLeveur = JSON.parse(localStorage.getItem("dataLeveur")) || [];

  var currentleveur = [];
  currentleveur.push(nom);
  dataLeveur.push(currentleveur);

  localStorage.setItem("dataLeveur", JSON.stringify(dataLeveur));
  window.location.reload();
}

function ajouterChantier(leveur, chantier) {
  var dataLeveur = JSON.parse(localStorage.getItem("dataLeveur")) || [];

  // Parcourir les leveurs
  dataLeveur.forEach(l => {
    if (l == null) {
      return;
    }
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
  window.location.reload();

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

function getWeekNumber(date) {
  // Copier la date pour ne pas la modifier
  date = new Date(date);
  
  // Règle ISO 8601 pour déterminer la semaine
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  var yearStart = new Date(date.getFullYear(), 0, 1);
  var weekNumber = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  
  return weekNumber;
}

function stringToColor(str) {


  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  var color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
  return  '#' + Array(6 - color.length + 1).join('0') + color;

}





function setcolortable() {
  
  var dataLeveur = JSON.parse(localStorage.getItem("dataLeveur")) || [];
  
  
  dataLeveur.forEach(levateur => {
    if (levateur == null) {
      return;
    }
    let elements = document.querySelectorAll(`.case-colored-${levateur[0]}`);

    elements.forEach(element => {
        element.style.backgroundColor = stringToColor(levateur[0]);
    });

    if (elements.length === 0) {
        console.log(`Aucun élément avec la classe case-colored-${levateur[0]} n'a été trouvé.`);
    }
  });
  

} 




//code dupliqué mais flemme

function getDaysBetween(startDate, endDate) {
  const days = [];
  let currentDate = new Date(startDate);
  const semaineFin = new Date(endDate);
  
  while (currentDate <= semaineFin) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

function getAllDaysInPeriods(periods) {
  let allDays = [];
  
  periods.forEach(period => {
      const { semaineDebut, semaineFin } = period;
      allDays = allDays.concat(getDaysBetween(semaineDebut, semaineFin));
  });
  
  // Convertir les dates en chaînes de caractères
  allDays = allDays.map(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois de 0 à 11, donc ajouter 1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  });
  
  return allDays;
}

function calculatejours() {

  var listePeriodes = JSON.parse(localStorage.getItem("dataPersonnel"));

  const allDays = getAllDaysInPeriods(listePeriodes);

  return allDays;

}
