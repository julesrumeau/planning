document.addEventListener("DOMContentLoaded", function() {
  let myChart = null;
  loadDataChantier();
  loadDataPersonnel();
  calculatedata();
});
window.todaykey = null;

// Fonction pour ajouter une ligne de chantier au tableau
function ajouterLigneChantier(nom = '', client = '', dateDebutAssemblage = '', nombreHeuresAtelier = '', estVendu = '', dateDebutLevage = '', nombreSemaineLevage = '', periodes = [], dep = '',moa = '',moe = '') {
  var newRow = `
    <tr class="chantier-row">
      <td><input type="text" class="form-control" value="${nom}" placeholder="Nom"></td>
      <td><input type="text" class="form-control" value="${client}" placeholder="Client"></td>
      <td><input type="date" class="form-control" value="${dateDebutAssemblage}" placeholder="Date de début de l'assemblage"></td>
      <td><input type="number" class="form-control" value="${nombreHeuresAtelier}" placeholder="Nombre d'heure atelier"></td>
      <td><input type="checkbox" class="form-check-input" ${estVendu ? 'checked' : 'checked'}></td>
      <td><input type="date" class="form-control" value="${dateDebutLevage}" placeholder="Date de début du levage"></td>
      <td><input type="number" class="form-control" value="${nombreSemaineLevage}" placeholder="Nombre semaine levage"></td>
      <td><input type="number" class="form-control" value="${dep}" placeholder="dep"></td>
      <td><input type="text" class="form-control" value="${moa}" placeholder="moa"></td>
      <td><input type="text" class="form-control" value="${moe}" placeholder="moe"></td>
      <td><button type="button" class="btn btn-danger" onclick="supprimerLigneChantier(this)">Supprimer</button></td>
    </tr>
    ${genererLignesPeriodes(periodes)}
    <tr>
      <td colspan="6" class="text-center">
        <button class="btn btn-secondary btn-sm" onclick="ajouterPeriode(this)">Ajouter période</button>
      </td>
    </tr>
  `;
  document.getElementById("tableBodyChantier").insertAdjacentHTML("beforeend", newRow);
}


// Fonction pour générer les lignes de périodes pour une ligne de chantier
function genererLignesPeriodes(periodes) {
  var periodesHTML = '';
  for (var i = 0; i < periodes.length; i++) {
    periodesHTML += `
      <tr class="periode-row">
        <td style="padding-left: 60px;"><input type="date" class="form-control" value="${periodes[i].dateDebut}" placeholder="Date de début"></td>
        <td><input type="number" class="form-control" value="${periodes[i].hommesMax}" placeholder="Hommes max"></td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="supprimerPeriode(this)">Supprimer</button></td>
      </tr>
    `;
  }
  return periodesHTML;
}
function ajouterPeriode(button) {
  // Trouver la ligne de chantier parente
  var chantierRow = button.closest("tr").previousElementSibling;

  // Vérifier que la ligne précédente est bien une ligne de chantier
  while (chantierRow && !chantierRow.classList.contains('chantier-row')) {
    chantierRow = chantierRow.previousElementSibling;
  }

  if (!chantierRow) {
    console.error("Ligne du chantier non trouvée.");
    return;
  }

  // Trouver toutes les lignes periode-row qui suivent la ligne de chantier
  var periodeRows = [];
  var nextRow = chantierRow.nextElementSibling;
  while (nextRow && nextRow.classList.contains('periode-row')) {
    periodeRows.push(nextRow);
    nextRow = nextRow.nextElementSibling;
  }

  // Déterminer où insérer la nouvelle période
  var insertAfterRow = periodeRows.length > 0 ? periodeRows[periodeRows.length - 1] : chantierRow;

  // Si le tableau de périodes est vide, définir la date de début
  var inputDateDebut = periodeRows.length === 0 ? chantierRow.querySelectorAll("td")[2].querySelector("input") : null;
  var dateDebutChantier = inputDateDebut ? inputDateDebut.value : '';

  var newPeriode = `
    <tr class="periode-row">
      <td style="padding-left: 60px;"><input type="date" class="form-control" ${periodeRows.length === 0 ? `value="${dateDebutChantier}"` : ''} placeholder="Date de début"></td>
      <td><input type="number" class="form-control" placeholder="Hommes max"></td>
      <td><button type="button" class="btn btn-danger btn-sm" onclick="supprimerPeriode(this)">Supprimer</button></td>
    </tr>
  `;

  // Insérer la nouvelle période après la dernière ligne periode-row
  insertAfterRow.insertAdjacentHTML('afterend', newPeriode);
}




// Fonction pour valider les données saisies dans le tableau et les sauvegarder
function saveDataChantier() {
  var tableRows = document.getElementById("tableBodyChantier").getElementsByTagName("tr");
  var data = [];
  var chantierIndex = -1;

  for (var i = 0; i < tableRows.length; i++) {
    if (tableRows[i].classList.contains('chantier-row')) {
      chantierIndex++;
      var cells = tableRows[i].querySelectorAll("input");
      var rowData = {
        nom: cells[0].value,
        client: cells[1].value,
        dateDebutAssemblage: cells[2].value,
        nombreHeuresAtelier: cells[3].value,
        estVendu: cells[4].checked,
        dateDebutLevage: cells[5].value,
        nombreSemaineLevage: cells[6].value,
        dep: cells[7].value,
        moa: cells[8].value,
        moe: cells[9].value,
        periodes: []
      };
      data.push(rowData);
    } else if (tableRows[i].classList.contains('periode-row')) {
      var periodeCells = tableRows[i].getElementsByTagName("input");
      var periodeData = {
        dateDebut: periodeCells[0].value,
        hommesMax: periodeCells[1].value
      };
      data[chantierIndex].periodes.push(periodeData);
    }
  }

  localStorage.setItem("dataChantier", JSON.stringify(data));
  destroyChart()
  draw()
}

function supprimerPeriode(button) {
  var row = button.closest("tr"); // Trouver la ligne de période parente
  row.remove(); // Supprimer la ligne du tableau
  saveDataChantier();
}

// Fonction pour supprimer une ligne de chantier
function supprimerLigneChantier(button) {
  var row = button.closest("tr"); // Trouver la ligne parente du bouton
  var nom = row.querySelector("td:first-child input").value; // Accéder à la valeur de l'élément <input> dans la première cellule

  // Appeler la fonction de suppression par nom en passant le nom comme paramètre
  supprimerLigneChantierParNom(nom);
}

// Fonction pour supprimer une ligne de chantier par son nom
function supprimerLigneChantierParNom(nom) {
  var tableBodyChantier = document.getElementById("tableBodyChantier");
  var rows = tableBodyChantier.getElementsByTagName("tr");

  // Parcourir toutes les lignes du tableau
  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName("td");

    // Vérifier si le premier élément de la ligne est un input
    var firstInput = cells[0].querySelector("input");
    if (firstInput && firstInput.value === nom) {

      // Supprimer la ligne du tableau
      rows[i].remove(); // Supprimer la ligne du tableau
      var isFinish = false;

      if (rows[i].getElementsByTagName("td")[0].querySelector("button")) {
        rows[i].remove();
        isFinish = true;
      }
      while (!isFinish && rows[i].getElementsByTagName("td")[0].querySelector("input").type === "date") {
        rows[i].remove();
        if (rows[i].getElementsByTagName("td")[0].querySelector("button")) {
          rows[i].remove();
          isFinish = true;
        }
      }

      break; // Sortir de la boucle une fois que la ligne est supprimée
    }
  }

  // Enregistrer les données mises à jour dans localStorage
  saveDataChantier();
}



// Fonction pour supprimer les données d'une ligne de chantier dans le localStorage par son nom
function supprimerDonneesLocalStorageParNom(nom) {
  var dataChantier = JSON.parse(localStorage.getItem("dataChantier")) || [];

  // Filtrer les données pour supprimer l'élément correspondant au nom donné
  var newDataChantier = dataChantier.filter(function(item) {
    return item.nom !== nom;
  });

  // Mettre à jour les données dans le localStorage
  localStorage.setItem("dataChantier", JSON.stringify(newDataChantier));
}

// Fonction pour charger les données des chantiers depuis localStorage
function loadDataChantier() {
  var data = JSON.parse(localStorage.getItem("dataChantier"));

  if (!data || data.length === 0) {
    ajouterLigneChantier(); // Ajoute une ligne vide par défaut s'il n'y a pas de données
  } else {
    data.forEach(function(chantier) {
      ajouterLigneChantier(chantier.nom, chantier.client, chantier.dateDebutAssemblage, chantier.nombreHeuresAtelier, chantier.estVendu, chantier.dateDebutLevage, chantier.nombreSemaineLevage, chantier.periodes, chantier.dep, chantier.moa, chantier.moe);
    });
  }
}










// Fonction pour ajouter une ligne au tableau
function ajouterLigneVidePersonnel() {

  var newRow = `
     <tr>
        <td><input type="date" class="form-control" placeholder="Semaine de début"></td>
        <td><input type="date" class="form-control" placeholder="Semaine de fin"></td>
        <td><input type="number" class="form-control" placeholder="Nombre d'hommes"></td>
        <td><input type="number" class="form-control" placeholder="Nombre d'heure"></td>
        <td><button type="button" class="btn btn-danger" onclick="supprimerLignePersonnel(this)">Supprimer</button></td>

      </tr>
  `;
  document.getElementById("tableBodyPersonnel").insertAdjacentHTML("beforeend", newRow);
}

function ajouterLigneRempliePersonnel(semaineDebut, semaineFin, nbrHomme, nbrHeure) {
  var newRow = `
     <tr>
        <td><input type="date" class="form-control" value="${semaineDebut}" placeholder="Semaine de début"></td>
        <td><input type="date" class="form-control" value="${semaineFin}" placeholder="Semaine de fin"></td>
        <td><input type="number" class="form-control" value="${nbrHomme}" placeholder="Nombre d'hommes"></td>
        <td><input type="number" class="form-control" value="${nbrHeure}" placeholder="Nombre d'heure"></td>
        <td><button type="button" class="btn btn-danger" onclick="supprimerLignePersonnel(this)">Supprimer</button></td>
      </tr>
  `;
  document.getElementById("tableBodyPersonnel").insertAdjacentHTML("beforeend", newRow);
}

// Fonction pour valider les données saisies dans le tableau
function saveDataPersonnel() {
  var tableRows = document.getElementById("tableBodyPersonnel").getElementsByTagName("tr");
  var data = [];

  for (var i = 0; i < tableRows.length; i++) {
    var cells = tableRows[i].getElementsByTagName("input");
    var rowData = {};
    rowData.semaineDebut = cells[0].value;
    rowData.semaineFin = cells[1].value;
    rowData.nbrHomme = cells[2].value;
    rowData.nbrHeure = cells[3].value;
    data.push(rowData);
  }

  localStorage.setItem("dataPersonnel", JSON.stringify(data));
  destroyChart()
  draw()
}
function destroyChart() {
  if (myChart) {
      myChart.destroy(); // Supprimer le graphique
      myChart = null; // Nettoyer la référence
  }
}
function loadDataPersonnel() {
  var data = JSON.parse(localStorage.getItem("dataPersonnel"));
  if (!data || data.length === 0) { // Si aucune donnée n'est disponible
    ajouterLigneVidePersonnel(); // Ajouter une ligne vide
  } else {
    for (var i = 0; i < data.length; i++) {
      ajouterLigneRempliePersonnel(data[i].semaineDebut, data[i].semaineFin, data[i].nbrHomme, data[i].nbrHeure);
    }
  }
}


function supprimerLignePersonnel(button) {
  var row = button.closest("tr"); // Trouver la ligne parente du bouton
  var semaineDebut = row.querySelector("td:first-child input").value; // Accéder à la valeur de l'élément <input> dans la première cellule

  // Appeler la fonction de suppression par semaineDebut en passant le semaineDebut comme paramètre
  supprimerLignePersonnelParsemaineDebut(semaineDebut);
}

function supprimerLignePersonnelParsemaineDebut(semaineDebut) {
  var tableBodyPersonnel = document.getElementById("tableBodyPersonnel");
  var rows = tableBodyPersonnel.getElementsByTagName("tr");

  // Parcourir toutes les lignes du tableau
  for (var i = 0; i < rows.length; i++) {
    var currentRow = rows[i];
    var cells = currentRow.getElementsByTagName("td");

    // Vérifier si le semaineDebut dans cette ligne correspond au semaineDebut donné
    if (cells[0].querySelector("input").value === semaineDebut) { // Supposons que le semaineDebut soit dans la première cellule
      currentRow.remove(); // Supprimer la ligne du tableau

      // Supprimer les données correspondantes dans le localStorage en utilisant le semaineDebut comme clé
      supprimerDonneesLocalStorageParSemaineDebut(semaineDebut);
      break; // Sortir de la boucle une fois que la ligne est supprimée
    }
  }
}

function supprimerDonneesLocalStorageParSemaineDebut(semaineDebut) {
  var dataPersonnel = JSON.parse(localStorage.getItem("dataPersonnel")) || [];

  // Filtrer les données pour supprimer l'élément correspondant au semaineDebut donné
  var newDataPersonnel = dataPersonnel.filter(function(item) {
    return item.semaineDebut !== semaineDebut;
  });

  // Mettre à jour les données dans le localStorage
  localStorage.setItem("dataPersonnel", JSON.stringify(newDataPersonnel));
}






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

function calculatedata() {

  var listePeriodes = JSON.parse(localStorage.getItem("dataPersonnel"));

  const allDays = getAllDaysInPeriods(listePeriodes);


  draw()
}

function stringToColor(str) {


  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  var color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
  return  '#' + Array(6 - color.length + 1).join('0') + color;

}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  var color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
  return '#' + Array(6 - color.length + 1).join('0') + color;
}

// Fonction pour convertir une couleur hexadécimale en RGBA avec transparence
function hexToRgba(hex, opacity = 0.5) {
  // Supprimer le # s'il est présent
  hex = hex.replace('#', '');

  // Obtenir les valeurs R, G, B
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  // Retourner la couleur au format rgba
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

//TODO on load et  save  on appel ça 

// Function to generate weeks between two dates
function getWeeksBetween(startDate, endDate) {
  let weeks = [];
  let currentDate = new Date(startDate);
  personnelMax = []




  
  var dataPersonnel = JSON.parse(localStorage.getItem("dataPersonnel"));
  var dataChantier = JSON.parse(localStorage.getItem("dataChantier"));
  
  listeChantier =  []
  for (let i = 0; i < dataChantier.length; i++) {
    const chantier = dataChantier[i];
    listeChantier[i] = []
  }

  // Adjust to the Monday of the current week
  let day = currentDate.getDay();
  let diff = day <= 1 ? 1 - day : 8 - day;
  currentDate.setDate(currentDate.getDate() + diff);
  while (currentDate <= endDate) {

    valuePersonnelMax = 0;
    nbrHeure = null;
    nbrHomme = null;
    for (const personnel of dataPersonnel) {
      if (personnel.semaineDebut == '' || personnel.semaineFin == '') {
        continue;
      }

      semaineDebut = new Date(personnel.semaineDebut)
      semaineFin = new Date(personnel.semaineFin)
      semaineFin.setDate(semaineFin.getDate() + 7)
      if (semaineDebut <= currentDate && currentDate < semaineFin) {
        valuePersonnelMax = personnel.nbrHeure * personnel.nbrHomme * 5
        nbrHeure = personnel.nbrHeure * 5
      }
      continue;
    };
    var i = 0
    for (const chantier of dataChantier) {
      nbrHeureSemaine = 0
      if (valuePersonnelMax != 0) {
        for (const periode of chantier.periodes) { // TODO ça prend plusieur periode, la plus grande valide et toute les plus petites
          dateDebutPeriode = new Date(periode.dateDebut)
          if (dateDebutPeriode <= currentDate && chantier.nombreHeuresAtelier > 0) {
            if (periode.hommesMax * nbrHeure > chantier.nombreHeuresAtelier) {
              nbrHeureSemaine = chantier.nombreHeuresAtelier
              chantier.nombreHeuresAtelier = 0
            } else {
              nbrHeureSemaine = periode.hommesMax * nbrHeure
              chantier.nombreHeuresAtelier -= nbrHeureSemaine 
            }
          }
          
        }
      }
      listeChantier[i].push(nbrHeureSemaine)
      i += 1
    }



    personnelMax.push(valuePersonnelMax)

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

  chantiers = []
  for (let i = 0; i < dataChantier.length; i++) {
    const chantier = dataChantier[i];
    chantiers[i] = {
                nom: chantier.nom,
                data: listeChantier[i],
                estVendu: chantier.estVendu,
              }
  }


  
  return weeks;
}

// Fonction pour obtenir le nom du mois à partir du numéro de mois (0-11)
function getMonthName(monthNumber) {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return months[monthNumber];
}


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

// Function to get ISO week number
function getISOWeekNumber(date) {
  const d = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNum + 3);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNumber;
}
function getMonth () {
  

  const today = new Date();
  const dateRange = calculateDateRange(today);
  const { startDate, endDate } = dateRange;

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

  allmonth = [] 
  allPosition = []
  for (const monthKey in weeksByMonth) {
    if (weeksByMonth.hasOwnProperty(monthKey)) {
      const [year, month] = monthKey.split('-');
      var colspan = weeksByMonth[monthKey].length;

      const lastWeek = weeksByMonth[monthKey][weeksByMonth[monthKey].length - 1];

      if (month == 11 && lastWeek.weekNumber == 1) {
        colspan -= 1;
      }
      allPosition.push(colspan);
      allmonth.push(getMonthName(parseInt(month)));
    }
  }
  allsemaine = [] 
  for (const monthKey in weeksByMonth) {
    if (weeksByMonth.hasOwnProperty(monthKey)) {
      const monthWeeks = weeksByMonth[monthKey];
      monthWeeks.forEach(week => {
        if (week.weekNumber == 1 && week.startMonth == 11) {
          return;
        }
        allsemaine.push(week.weekNumber);
      });
    }
  }
  allPosition = allPosition.map((sum => value => sum += value)(0));

  return [allmonth, allsemaine, allPosition];


}

function createDiagonalPattern(backgroundColor = 'red') {
  // Create a 10x10 px canvas for the pattern's base shape
  let shape = document.createElement('canvas');
  shape.width = 10;
  shape.height = 10;

  // Get the context for drawing
  let c = shape.getContext('2d');

  // Draw background color (fill the entire canvas with a solid color)
  c.fillStyle = backgroundColor;
  c.fillRect(0, 0, shape.width, shape.height);

  // Draw hatching lines on top of the background
  c.strokeStyle = 'black';
  c.lineWidth = 2;

  // Draw the first line of the shape (diagonal)
  c.beginPath();
  c.moveTo(2, 0);
  c.lineTo(10, 8);
  c.stroke();

  // Draw the second line of the shape (diagonal)
  c.beginPath();
  c.moveTo(0, 8);
  c.lineTo(2, 10);
  c.stroke();

  // Create the pattern from the shape
  return c.createPattern(shape, 'repeat');
}

function draw() {
  const ctx = document.getElementById('myChart').getContext('2d');
  
  res  = getMonth();
  //liste des 12 mois de l'année
  allmonth = res[0];
  //liste des 56 semaine de l'année
  allsemaine = res[1];
  allPosition = res[2];
  allPosition[allPosition.length -1] = 55


  console.log(chantiers)
  // Préparation des datasets
  chantiers.forEach(chantier => {
    chantier.label = chantier.nom;
    chantier.data = chantier.data;
    // chantier.backgroundColor = hexToRgba(stringToColor(chantier.nom), 0.5); // Couleur avec transparence
    chantier.backgroundColor = chantier.estVendu ? stringToColor(chantier.nom) : createDiagonalPattern(stringToColor(chantier.nom)); // Couleur avec transparence
    chantier.borderWidth = 1;
    chantier.type = 'bar';
    chantier.order = 2;
  });
  
  
  
  const liste490 = Array(personnelMax.length).fill(490);
  chantiers.push(
    {
              label: 'Nbr homme max',
              data: personnelMax,  // Valeurs maximales pour la ligne de suivi
              type: 'line',
              borderColor: 'green',
              borderWidth: 2,
              fill: false,
              pointRadius: 0,
              order: 1
            },
    // {
    //       label: '35 heures à 14',
    //       data: liste490,  // Valeurs maximales pour la ligne de suivi
    //       type: 'line',
    //       borderColor: 'red',
    //       borderWidth: 2,
    //       fill: false,
    //       pointRadius: 0,
    //       borderDash: [5, 5],
    //       order: 1
    //     }
  )
  

  // Plugin pour ajouter des labels au-dessus (mois)
  const monthPlugin = {
    id: 'monthPlugin',
    beforeDraw: (chart) => {
        const {ctx, scales: {x, y}} = chart;

        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';

        // Définir où positionner les mois (au-dessus des semaines)
        let currentMonth = 0;

        // Dessiner les labels des mois au-dessus des semaines
        allPosition.forEach((position, index) => {
            const start = index > 0 ? allPosition[index - 1] + 1 : 0;
            const end = position;
            const xPosition = (x.getPixelForTick(start) + x.getPixelForTick(end)) / 2;
            
            ctx.fillText(allmonth[currentMonth], xPosition, y.top +10);
            currentMonth++;
        });

        ctx.restore();
    }
  };
  myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: allsemaine,  // Numéro des semaines
          datasets: chantiers
      },
      options: {
          plugins: {
              title: {
                  display: true,
                  text: 'PLAN DE CHARGE ASSEMBLAGE (Semaines et Mois)'
              }
          },
          scales: {
            x: {
                stacked: true,  // Empiler uniquement les barres
                beginAtZero: true,
            },
            y: {
                stacked: true,  // Empiler uniquement les barres
                beginAtZero: true,
            },
          },
          responsive: true
      },
      plugins: [monthPlugin]  // Utilisation du plugin pour les mois
  });
}



