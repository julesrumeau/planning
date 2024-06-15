document.addEventListener("DOMContentLoaded", function() {
  loadDataChantier();
});

// Fonction pour ajouter une ligne de chantier au tableau
function ajouterLigneChantier(nom = '', client = '', dateDebut = '', nombreHeures = '', estVendu = '', periodes = []) {
  var newRow = `
     <tr>
        <td><input type="text" class="form-control" value="${nom}" placeholder="Nom"></td>
        <td><input type="text" class="form-control" value="${client}" placeholder="Client"></td>
        <td><input type="date" class="form-control" value="${dateDebut}" placeholder="Date de début"></td>
        <td><input type="number" class="form-control" value="${nombreHeures}" placeholder="Nombre d'heures"></td>
        <td><input type="checkbox" class="form-check-input" ${estVendu ? 'checked' : ''}></td>
        <td>
          <table class="table">
            <thead>
              <tr>
                <th>Date de début</th>
                <th>Date de fin</th>
                <th>Hommes max</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="periode-body">
              ${genererLignesPeriodes(periodes)}
            </tbody>
          </table>    
          <button class="btn btn-secondary btn-sm" onclick="ajouterPeriode(this)">Ajouter période</button>
        </td>
        <td><button type="button" class="btn btn-danger" onclick="supprimerLigneChantier(this)">Supprimer</button></td>
      </tr>
  `;
  document.getElementById("tableBodyChantier").insertAdjacentHTML("beforeend", newRow);
}

// Fonction pour générer les lignes de périodes pour une ligne de chantier
function genererLignesPeriodes(periodes) {
  var periodesHTML = '';
  for (var i = 0; i < periodes.length; i++) {
    periodesHTML += `
      <tr>
        <td><input type="date" class="form-control" value="${periodes[i].dateDebut}" placeholder="Date de début"></td>
        <td><input type="date" class="form-control" value="${periodes[i].dateFin}" placeholder="Date de fin"></td>
        <td><input type="number" class="form-control" value="${periodes[i].hommesMax}" placeholder="Hommes max"></td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="supprimerPeriode(this)">Supprimer</button></td>
      </tr>
    `;
  }
  return periodesHTML;
}

// Fonction pour ajouter une période à une ligne de chantier
function ajouterPeriode(button) {
  var periodeBody = button.parentElement.querySelector('.periode-body');
  var newPeriode = `
    <tr>
      <td><input type="date" class="form-control" placeholder="Date de début"></td>
      <td><input type="date" class="form-control" placeholder="Date de fin"></td>
      <td><input type="number" class="form-control" placeholder="Hommes max"></td>
      <td><button type="button" class="btn btn-danger btn-sm" onclick="supprimerPeriode(this)">Supprimer</button></td>
    </tr>
  `;
  periodeBody.insertAdjacentHTML('beforeend', newPeriode);
}

// Fonction pour supprimer une période d'une ligne de chantier
function supprimerPeriode(button) {
  button.closest('tr').remove(); // Supprime la ligne de période du DOM
}

// Fonction pour valider les données saisies dans le tableau et les sauvegarder
function saveDataChantier() {
  var tableRows = document.getElementById("tableBodyChantier").getElementsByTagName("tr");
  var data = [];
  console.log(tableRows);

  for (var i = 0; i < tableRows.length - 1; i++) {
    var cells = tableRows[i].querySelectorAll("input"); // Sélectionne tous les input dans la ligne actuelle
    console.log(i);
    console.log(cells);

    var rowData = {
      nom: cells[0].value,
      client: cells[1].value,
      dateDebut: cells[2].value,
      nombreHeures: cells[3].value,
      estVendu: cells[4].checked,
      periodes: []
    };

    // Récupérer les périodes pour cette ligne de chantier
    var periodeRows = tableRows[i].querySelectorAll('.periode-body tr');
    periodeRows.forEach(function(row) {
      var periodeCells = row.getElementsByTagName("input");
      var periodeData = {
        dateDebut: periodeCells[0].value,
        dateFin: periodeCells[1].value,
        hommesMax: periodeCells[2].value
      };
      rowData.periodes.push(periodeData);
    });

    data.push(rowData);
  }

  console.log("Données saisies :", data);
  localStorage.setItem("dataChantier", JSON.stringify(data));
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
    var currentRow = rows[i];
    var cells = currentRow.getElementsByTagName("td");

    // Vérifier si le nom dans cette ligne correspond au nom donné
    if (cells[0].querySelector("input").value === nom) { // Supposons que le nom soit dans la première cellule
      currentRow.remove(); // Supprimer la ligne du tableau

      // Supprimer les données correspondantes dans le localStorage en utilisant le nom comme clé
      supprimerDonneesLocalStorageParNom(nom);
      break; // Sortir de la boucle une fois que la ligne est supprimée
    }
  }
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











//TODO on load et  save  on appel ça 


function listJour(){
  console.log()
}
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




