function calculateDateRange(date) {
  // Convertit la chaîne de date en objet Date si nécessaire
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  // Récupère le mois et l'année de la date donnée
  let startMonth = date.getMonth() - 2; // 2 mois avant
  let endMonth = date.getMonth() + 10; // 10 mois après

  // Récupère également l'année pour gérer le changement d'année
  let year = date.getFullYear();

  // Gère le passage d'une année à l'autre
  if (startMonth < 0) {
    startMonth += 12;
    year--;
  }
  if (endMonth >= 12) {
    endMonth -= 12;
    year++;
  }

  // Crée les dates pour 2 mois avant et 10 mois après
  let twoMonthsBefore = new Date(year, startMonth, 1); // 1er jour du mois
  let tenMonthsAfter = new Date(year, endMonth, 1); // 1er jour du mois

  return {
    twoMonthsBefore: twoMonthsBefore,
    tenMonthsAfter: tenMonthsAfter
  };
}

// Exemple d'utilisation :
let currentDate = new Date(); // Date actuelle
let dateRange = calculateDateRange(currentDate);

console.log("Deux mois avant:", dateRange.twoMonthsBefore.toLocaleDateString());
console.log("Dix mois après:", dateRange.tenMonthsAfter.toLocaleDateString());
