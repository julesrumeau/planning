



document.addEventListener("DOMContentLoaded", function() {
  loadDataChantier();
});

// Fonction pour ajouter une ligne au tableau
function ajouterLigneVideChantier() {

  var newRow = `
     <tr>
        <td><input type="text" class="form-control" placeholder="Nom"></td>
        <td><input type="text" class="form-control" placeholder="Client"></td>
        <td><input type="date" class="form-control" placeholder="Date de début"></td>
        <td><input type="number" class="form-control" placeholder="Nombre d'heures"></td>
        <td><input type="checkbox" class="form-check-input" placeholder="Est vendu" checked="true"></td>
        <td><button type="button" class="btn btn-danger" onclick="supprimerLigneChantier(this)">Supprimer</button></td>
      </tr>
  `;
  document.getElementById("tableBodyChantier").insertAdjacentHTML("beforeend", newRow);
}

function ajouterLigneRemplieChantier(nom, client, dateDebut, nombreHeures, estVendu) {
  var newRow = `
     <tr>
        <td><input type="text" class="form-control" value="${nom}" placeholder="Nom"></td>
        <td><input type="text" class="form-control" value="${client}" placeholder="Client"></td>
        <td><input type="date" class="form-control" value="${dateDebut}" placeholder="Date de début"></td>
        <td><input type="number" class="form-control" value="${nombreHeures}" placeholder="Nombre d'heures"></td>
        <td><input type="checkbox" class="form-check-input" value="${estVendu}" placeholder="Est vendu"></td>
        <td><button type="button" class="btn btn-danger" onclick="supprimerLigneChantier(this)">Supprimer</button></td>
      </tr>
  `;
  document.getElementById("tableBodyChantier").insertAdjacentHTML("beforeend", newRow);
}

// Fonction pour valider les données saisies dans le tableau
function saveDataChantier() {
  var tableRows = document.getElementById("tableBodyChantier").getElementsByTagName("tr");
  var data = [];

  for (var i = 0; i < tableRows.length; i++) {
    var cells = tableRows[i].getElementsByTagName("input");
    var rowData = {};
    rowData.nom = cells[0].value;
    rowData.client = cells[1].value;
    rowData.dateDebut = cells[2].value;
    rowData.nombreHeures = cells[3].value;
    rowData.estVendu = cells[4].value;
    data.push(rowData);
  }

  console.log("Données saisies :", data);
  localStorage.setItem("dataChantier", JSON.stringify(data));
}

function loadDataChantier() {
  var data = JSON.parse(localStorage.getItem("dataChantier"));
  
  if (!data || data.length === 0) { // Si aucune donnée n'est disponible
    ajouterLigneVideChantier(); // Ajouter une ligne vide
  } else {
    for (var i = 0; i < data.length; i++) {
      ajouterLigneRemplieChantier(data[i].nom, data[i].client, data[i].dateDebut, data[i].nombreHeures, data[i].estVendu);
    }
  }
}


function supprimerLigneChantier(button) {
  var row = button.closest("tr"); // Trouver la ligne parente du bouton
  var nom = row.querySelector("td:first-child input").value; // Accéder à la valeur de l'élément <input> dans la première cellule
  console.log("ze")
  // Appeler la fonction de suppression par nom en passant le nom comme paramètre
  supprimerLigneChantierParNom(nom);
}

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

function supprimerDonneesLocalStorageParNom(nom) {
  var dataChantier = JSON.parse(localStorage.getItem("dataChantier")) || [];

  // Filtrer les données pour supprimer l'élément correspondant au nom donné
  var newDataChantier = dataChantier.filter(function(item) {
    return item.nom !== nom;
  });

  // Mettre à jour les données dans le localStorage
  localStorage.setItem("dataChantier", JSON.stringify(newDataChantier));
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

function ajouterLigneRempliePersonnel(nom, client, dateDebut, nombreHeures, estVendu) {
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




