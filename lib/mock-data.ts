import type { Department, RegionSummary } from "@/types";

// Base data: [code, name, region, population, superficie, chef_lieu, etatFactor, terrFactor, hospFactor, encadrementPrimaire, vieillissement]
// etatFactor = agents FP État per 1000 hab, terrFactor = FP Territoriale, hospFactor = FP Hospitalière
const RAW: [string, string, string, number, number, string, number, number, number, number, number][] = [
  ["01","Ain","Auvergne-Rhône-Alpes",660000,5762,"Bourg-en-Bresse",36,29,17,24.2,0.24],
  ["02","Aisne","Hauts-de-France",533000,7369,"Laon",40,28,16,25.1,0.29],
  ["03","Allier","Auvergne-Rhône-Alpes",335000,7340,"Moulins",44,31,15,21.5,0.35],
  ["04","Alpes-de-Haute-Provence","Provence-Alpes-Côte d'Azur",165000,6925,"Digne-les-Bains",46,32,13,20.8,0.32],
  ["05","Hautes-Alpes","Provence-Alpes-Côte d'Azur",140000,5549,"Gap",48,31,14,19.5,0.30],
  ["06","Alpes-Maritimes","Provence-Alpes-Côte d'Azur",1083000,4299,"Nice",44,28,20,22.8,0.31],
  ["07","Ardèche","Auvergne-Rhône-Alpes",330000,5529,"Privas",38,30,13,21.2,0.32],
  ["08","Ardennes","Grand Est",276000,5229,"Charleville-Mézières",42,29,16,24.0,0.30],
  ["09","Ariège","Occitanie",154000,4890,"Foix",44,30,14,20.5,0.34],
  ["10","Aube","Grand Est",307000,6004,"Troyes",38,28,17,24.5,0.28],
  ["11","Aude","Occitanie",374000,6139,"Carcassonne",40,29,15,22.0,0.33],
  ["12","Aveyron","Occitanie",280000,8735,"Rodez",42,31,14,20.5,0.34],
  ["13","Bouches-du-Rhône","Provence-Alpes-Côte d'Azur",2047000,5087,"Marseille",52,27,22,24.5,0.27],
  ["14","Calvados","Normandie",696000,5548,"Caen",50,29,20,24.2,0.28],
  ["15","Cantal","Auvergne-Rhône-Alpes",144000,5726,"Aurillac",48,33,14,19.8,0.38],
  ["16","Charente","Nouvelle-Aquitaine",354000,5956,"Angoulême",40,29,17,22.5,0.31],
  ["17","Charente-Maritime","Nouvelle-Aquitaine",650000,6864,"La Rochelle",38,30,16,22.8,0.30],
  ["18","Cher","Centre-Val de Loire",300000,7235,"Bourges",42,30,16,22.0,0.31],
  ["19","Corrèze","Nouvelle-Aquitaine",237000,5857,"Tulle",44,31,15,20.5,0.35],
  ["2A","Corse-du-Sud","Corse",162000,4014,"Ajaccio",52,33,15,21.5,0.29],
  ["2B","Haute-Corse","Corse",181000,4666,"Bastia",48,31,14,21.0,0.28],
  ["21","Côte-d'Or","Bourgogne-Franche-Comté",538000,8763,"Dijon",50,30,20,23.5,0.28],
  ["22","Côtes-d'Armor","Bretagne",603000,6878,"Saint-Brieuc",38,29,17,22.5,0.32],
  ["23","Creuse","Nouvelle-Aquitaine",113000,5565,"Guéret",50,34,13,19.0,0.42],
  ["24","Dordogne","Nouvelle-Aquitaine",412000,9060,"Périgueux",40,30,15,21.5,0.36],
  ["25","Doubs","Bourgogne-Franche-Comté",541000,5234,"Besançon",48,29,22,24.0,0.26],
  ["26","Drôme","Auvergne-Rhône-Alpes",521000,6530,"Valence",38,28,18,23.5,0.28],
  ["27","Eure","Normandie",596000,6040,"Évreux",38,28,16,24.8,0.27],
  ["28","Eure-et-Loir","Centre-Val de Loire",433000,5880,"Chartres",40,28,17,24.5,0.27],
  ["29","Finistère","Bretagne",913000,6733,"Quimper",42,29,19,22.5,0.30],
  ["30","Gard","Occitanie",748000,5853,"Nîmes",40,28,18,24.0,0.28],
  ["31","Haute-Garonne","Occitanie",1422000,6309,"Toulouse",52,28,21,23.5,0.24],
  ["32","Gers","Occitanie",193000,6257,"Auch",42,31,14,20.5,0.37],
  ["33","Gironde","Nouvelle-Aquitaine",1643000,10000,"Bordeaux",48,28,21,23.5,0.25],
  ["34","Hérault","Occitanie",1167000,6101,"Montpellier",52,27,22,23.5,0.26],
  ["35","Ille-et-Vilaine","Bretagne",1081000,6775,"Rennes",50,28,21,23.0,0.23],
  ["36","Indre","Centre-Val de Loire",218000,6791,"Châteauroux",44,31,14,21.0,0.36],
  ["37","Indre-et-Loire","Centre-Val de Loire",608000,6127,"Tours",48,29,19,23.0,0.29],
  ["38","Isère","Auvergne-Rhône-Alpes",1271000,7431,"Grenoble",46,28,22,24.0,0.25],
  ["39","Jura","Bourgogne-Franche-Comté",257000,4999,"Lons-le-Saunier",40,30,15,21.5,0.31],
  ["40","Landes","Nouvelle-Aquitaine",414000,9243,"Mont-de-Marsan",42,30,16,22.5,0.29],
  ["41","Loir-et-Cher","Centre-Val de Loire",328000,6343,"Blois",40,30,15,22.0,0.32],
  ["42","Loire","Auvergne-Rhône-Alpes",767000,4781,"Saint-Étienne",44,29,19,24.0,0.28],
  ["43","Haute-Loire","Auvergne-Rhône-Alpes",227000,4977,"Le Puy-en-Velay",40,31,14,20.5,0.33],
  ["44","Loire-Atlantique","Pays de la Loire",1442000,6815,"Nantes",50,28,21,23.5,0.24],
  ["45","Loiret","Centre-Val de Loire",676000,6775,"Orléans",46,28,19,24.5,0.27],
  ["46","Lot","Occitanie",175000,5217,"Cahors",44,32,13,20.0,0.37],
  ["47","Lot-et-Garonne","Nouvelle-Aquitaine",330000,5361,"Agen",40,30,16,22.0,0.32],
  ["48","Lozère","Occitanie",76000,5167,"Mende",52,36,14,19.0,0.40],
  ["49","Maine-et-Loire","Pays de la Loire",816000,7166,"Angers",44,29,20,23.5,0.27],
  ["50","Manche","Normandie",493000,5938,"Saint-Lô",40,30,17,22.5,0.31],
  ["51","Marne","Grand Est",568000,8162,"Châlons-en-Champagne",48,29,19,24.5,0.27],
  ["52","Haute-Marne","Grand Est",173000,6211,"Chaumont",46,32,14,20.5,0.35],
  ["53","Mayenne","Pays de la Loire",307000,5175,"Laval",38,29,15,22.0,0.30],
  ["54","Meurthe-et-Moselle","Grand Est",733000,5246,"Nancy",50,29,21,24.5,0.27],
  ["55","Meuse","Grand Est",185000,6211,"Bar-le-Duc",46,32,14,20.5,0.33],
  ["56","Morbihan","Bretagne",754000,6823,"Vannes",40,29,17,22.0,0.31],
  ["57","Moselle","Grand Est",1044000,6216,"Metz",44,28,19,24.5,0.27],
  ["58","Nièvre","Bourgogne-Franche-Comté",207000,6817,"Nevers",46,32,15,21.0,0.37],
  ["59","Nord","Hauts-de-France",2612000,5742,"Lille",52,27,20,25.5,0.25],
  ["60","Oise","Hauts-de-France",826000,5860,"Beauvais",40,27,17,25.5,0.25],
  ["61","Orne","Normandie",280000,6103,"Alençon",40,30,15,21.5,0.33],
  ["62","Pas-de-Calais","Hauts-de-France",1475000,6671,"Arras",42,27,17,25.0,0.28],
  ["63","Puy-de-Dôme","Auvergne-Rhône-Alpes",661000,7970,"Clermont-Ferrand",50,29,21,23.5,0.27],
  ["64","Pyrénées-Atlantiques","Nouvelle-Aquitaine",690000,7645,"Pau",46,29,19,22.5,0.29],
  ["65","Hautes-Pyrénées","Occitanie",229000,4464,"Tarbes",44,30,17,21.5,0.32],
  ["66","Pyrénées-Orientales","Occitanie",476000,4116,"Perpignan",40,27,17,23.5,0.30],
  ["67","Bas-Rhin","Grand Est",1139000,4755,"Strasbourg",52,28,22,24.5,0.25],
  ["68","Haut-Rhin","Grand Est",764000,3525,"Colmar",44,28,20,24.0,0.27],
  ["69","Rhône","Auvergne-Rhône-Alpes",1888000,3249,"Lyon",56,27,24,24.0,0.23],
  ["70","Haute-Saône","Bourgogne-Franche-Comté",236000,5360,"Vesoul",40,30,14,22.0,0.30],
  ["71","Saône-et-Loire","Bourgogne-Franche-Comté",554000,8575,"Mâcon",40,29,17,22.5,0.32],
  ["72","Sarthe","Pays de la Loire",563000,6206,"Le Mans",42,29,18,23.5,0.29],
  ["73","Savoie","Auvergne-Rhône-Alpes",436000,6028,"Chambéry",44,30,18,22.5,0.27],
  ["74","Haute-Savoie","Auvergne-Rhône-Alpes",825000,4388,"Annecy",40,28,18,23.0,0.24],
  ["75","Paris","Île-de-France",2102000,105,"Paris",118,24,28,19.0,0.18],
  ["76","Seine-Maritime","Normandie",1267000,6278,"Rouen",48,27,21,25.0,0.27],
  ["77","Seine-et-Marne","Île-de-France",1432000,5915,"Melun",50,26,18,25.8,0.23],
  ["78","Yvelines","Île-de-France",1440000,2284,"Versailles",58,26,19,25.2,0.24],
  ["79","Deux-Sèvres","Nouvelle-Aquitaine",371000,6004,"Niort",40,29,17,22.5,0.30],
  ["80","Somme","Hauts-de-France",570000,6170,"Amiens",46,28,19,25.0,0.28],
  ["81","Tarn","Occitanie",387000,5758,"Albi",40,29,16,22.0,0.31],
  ["82","Tarn-et-Garonne","Occitanie",262000,3718,"Montauban",38,28,16,23.0,0.29],
  ["83","Var","Provence-Alpes-Côte d'Azur",1075000,5973,"Toulon",42,27,18,23.0,0.31],
  ["84","Vaucluse","Provence-Alpes-Côte d'Azur",562000,3567,"Avignon",40,27,18,23.5,0.29],
  ["85","Vendée","Pays de la Loire",690000,6720,"La Roche-sur-Yon",38,29,16,23.0,0.28],
  ["86","Vienne","Nouvelle-Aquitaine",438000,7044,"Poitiers",50,29,20,23.0,0.28],
  ["87","Haute-Vienne","Nouvelle-Aquitaine",374000,5520,"Limoges",50,30,20,22.5,0.29],
  ["88","Vosges","Grand Est",367000,5874,"Épinal",40,29,16,22.0,0.31],
  ["89","Yonne","Bourgogne-Franche-Comté",335000,7427,"Auxerre",40,30,15,22.5,0.32],
  ["90","Territoire de Belfort","Bourgogne-Franche-Comté",142000,609,"Belfort",48,29,22,24.5,0.27],
  ["91","Essonne","Île-de-France",1305000,1804,"Évry-Courcouronnes",52,26,19,25.5,0.23],
  ["92","Hauts-de-Seine","Île-de-France",1622000,176,"Nanterre",62,25,22,24.0,0.21],
  ["93","Seine-Saint-Denis","Île-de-France",1648000,236,"Bobigny",48,25,19,26.5,0.17],
  ["94","Val-de-Marne","Île-de-France",1392000,245,"Créteil",54,25,21,25.0,0.22],
  ["95","Val-d'Oise","Île-de-France",1242000,1246,"Cergy",46,25,18,26.0,0.22],
  ["971","Guadeloupe","Guadeloupe",384000,1628,"Basse-Terre",52,26,19,22.0,0.22],
  ["972","Martinique","Martinique",349000,1128,"Fort-de-France",54,26,18,22.5,0.25],
  ["973","Guyane","Guyane",303000,83534,"Cayenne",58,24,18,21.0,0.10],
  ["974","La Réunion","La Réunion",887000,2512,"Saint-Denis",56,25,21,21.5,0.17],
  ["976","Mayotte","Mayotte",327000,374,"Mamoudzou",52,22,16,22.0,0.06],
];

export const DEPARTMENTS: Department[] = RAW.map(
  ([code, name, region, population, superficie, chef_lieu, etatF, terrF, hospF, encadrement, vieillissement]) => ({
    code,
    name,
    region,
    population,
    superficie,
    chef_lieu,
    agents_etat: Math.round((population * etatF) / 1000),
    agents_territoriale: Math.round((population * terrF) / 1000),
    agents_hospitaliere: Math.round((population * hospF) / 1000),
    taux_encadrement_primaire: encadrement,
    indice_vieillissement: vieillissement,
  })
);

export function getDepartmentByCode(code: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.code === code);
}

export function getRegionSummaries(): RegionSummary[] {
  const byRegion: Record<string, Department[]> = {};
  for (const d of DEPARTMENTS) {
    if (!byRegion[d.region]) byRegion[d.region] = [];
    byRegion[d.region].push(d);
  }
  return Object.entries(byRegion).map(([region, depts]) => {
    const population = depts.reduce((s, d) => s + d.population, 0);
    const agents_total = depts.reduce(
      (s, d) => s + d.agents_etat + d.agents_territoriale + d.agents_hospitaliere,
      0
    );
    return {
      region,
      population,
      agents_total,
      agents_pour_mille: (agents_total / population) * 1000,
      taux_vieillissement:
        depts.reduce((s, d) => s + d.indice_vieillissement * d.population, 0) / population,
      nb_departments: depts.length,
    };
  });
}

// National totals
export const NATIONAL_TOTALS = {
  population: DEPARTMENTS.reduce((s, d) => s + d.population, 0),
  agents_etat: DEPARTMENTS.reduce((s, d) => s + d.agents_etat, 0),
  agents_territoriale: DEPARTMENTS.reduce((s, d) => s + d.agents_territoriale, 0),
  agents_hospitaliere: DEPARTMENTS.reduce((s, d) => s + d.agents_hospitaliere, 0),
};

// Historical FP évolution data (national, 2010-2022)
export const HISTORICAL_FP = [
  { year: 2010, etat: 2390000, territoriale: 1830000, hospitaliere: 1120000 },
  { year: 2011, etat: 2380000, territoriale: 1850000, hospitaliere: 1130000 },
  { year: 2012, etat: 2370000, territoriale: 1870000, hospitaliere: 1140000 },
  { year: 2013, etat: 2380000, territoriale: 1890000, hospitaliere: 1150000 },
  { year: 2014, etat: 2390000, territoriale: 1900000, hospitaliere: 1160000 },
  { year: 2015, etat: 2400000, territoriale: 1910000, hospitaliere: 1170000 },
  { year: 2016, etat: 2420000, territoriale: 1920000, hospitaliere: 1180000 },
  { year: 2017, etat: 2440000, territoriale: 1930000, hospitaliere: 1190000 },
  { year: 2018, etat: 2460000, territoriale: 1940000, hospitaliere: 1200000 },
  { year: 2019, etat: 2470000, territoriale: 1950000, hospitaliere: 1210000 },
  { year: 2020, etat: 2490000, territoriale: 1950000, hospitaliere: 1220000 },
  { year: 2021, etat: 2500000, territoriale: 1960000, hospitaliere: 1230000 },
  { year: 2022, etat: 2510000, territoriale: 1960000, hospitaliere: 1240000 },
];

// Projections baseline (2023-2040)
export const PROJECTIONS_BASELINE = [
  { year: 2023, etat: 2515000, territoriale: 1965000, hospitaliere: 1255000 },
  { year: 2025, etat: 2520000, territoriale: 1975000, hospitaliere: 1270000 },
  { year: 2027, etat: 2510000, territoriale: 1980000, hospitaliere: 1290000 },
  { year: 2030, etat: 2490000, territoriale: 1985000, hospitaliere: 1320000 },
  { year: 2032, etat: 2470000, territoriale: 1990000, hospitaliere: 1350000 },
  { year: 2035, etat: 2445000, territoriale: 1995000, hospitaliere: 1390000 },
  { year: 2037, etat: 2420000, territoriale: 2000000, hospitaliere: 1420000 },
  { year: 2040, etat: 2390000, territoriale: 2010000, hospitaliere: 1460000 },
];

// Féminisation taux (% femmes) by FP category 2010-2022
export const FEMINISATION = [
  { year: 2010, etat: 57.2, territoriale: 61.0, hospitaliere: 77.5 },
  { year: 2012, etat: 57.8, territoriale: 61.4, hospitaliere: 77.9 },
  { year: 2014, etat: 58.1, territoriale: 61.8, hospitaliere: 78.2 },
  { year: 2016, etat: 58.5, territoriale: 62.0, hospitaliere: 78.4 },
  { year: 2018, etat: 58.8, territoriale: 62.3, hospitaliere: 78.6 },
  { year: 2020, etat: 59.1, territoriale: 62.5, hospitaliere: 78.8 },
  { year: 2022, etat: 59.4, territoriale: 62.7, hospitaliere: 79.0 },
];

// Catégorie A/B/C distribution (%)
export const CATEGORIES_FP = {
  etat: { A: 54, B: 25, C: 21 },
  territoriale: { A: 9, B: 16, C: 75 },
  hospitaliere: { A: 28, B: 15, C: 57 },
};
