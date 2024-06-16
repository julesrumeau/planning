document.addEventListener("DOMContentLoaded", function() {
  loadDataChantier();
  loadDataPersonnel();
  calculatedata();
});

// Fonction pour ajouter une ligne de chantier au tableau
function ajouterLigneChantier(nom = '', client = '', dateDebut = '', nombreHeures = '', estVendu = '', periodes = []) {
  var newRow = `
    <tr class="chantier-row">
      <td><input type="text" class="form-control" value="${nom}" placeholder="Nom"></td>
      <td><input type="text" class="form-control" value="${client}" placeholder="Client"></td>
      <td><input type="date" class="form-control" value="${dateDebut}" placeholder="Date de début"></td>
      <td><input type="number" class="form-control" value="${nombreHeures}" placeholder="Nombre d'heures"></td>
      <td><input type="checkbox" class="form-check-input" ${estVendu ? 'checked' : 'checked'}></td>
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
function ajouterPeriode(button) { // TODOdefault dd periode
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

  var newPeriode = `
    <tr class="periode-row">
      <td style="padding-left: 60px;"><input type="date" class="form-control" placeholder="Date de début"></td>
      <td><input type="number" class="form-control" placeholder="Hommes max"></td>
      <td><button type="button" class="btn btn-danger btn-sm" onclick="supprimerPeriode(this)">Supprimer</button></td>
    </tr>
  `;

  // Insérer la nouvelle période directement après la ligne de chantier
  chantierRow.insertAdjacentHTML('afterend', newPeriode);
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
        dateDebut: cells[2].value,
        nombreHeures: cells[3].value,
        estVendu: cells[4].checked,
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

  console.log("Données saisies :", data);
  localStorage.setItem("dataChantier", JSON.stringify(data));
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
      ajouterLigneChantier(chantier.nom, chantier.client, chantier.dateDebut, chantier.nombreHeures, chantier.estVendu, chantier.periodes);
    });
  }
}










document.addEventListener("DOMContentLoaded", function() {
  loadDataPersonnel();
});

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

  console.log("Données saisies :", data);
  localStorage.setItem("dataPersonnel", JSON.stringify(data));
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

  console.log(allDays);

}


//TODO on load et  save  on appel ça 


const ctx = document.getElementById('myChart');

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});




