// récupérer tous les nomn des dossier pour creer l'objert dans le dossier src
// ls -d */ | sed 's:/$::' | jq -R -s 'split("\n") | map(select(length > 0))'
const sites = [
  "amay",
  "ans",
  "arlon",
  "arris",
  "ath",
  "attert",
  "awans",
  "bastogne",
  "beauvechain",
  "berloz",
  "blegny",
  "boussu",
  "brainelechateau",
  "braives",
  "bw",
  "cancap",
  "celles",
  "cerfontaine",
  "chastre",
  "chatelet",
  "comblainaupont",
  "comineswarneton",
  "communemanage",
  "courtsaintetienne",
  "couvin",
  "demo",
  "dison",
  "doische",
  "dour",
  "ellezelles",
  "enghien",
  "erezee",
  "estinnes",
  "ferrieres",
  "fexhelehautclocher",
  "flemalle",
  "fleurus",
  "florennes",
  "fosseslaville",
  "frameries",
  "froidchapelle",
  "geer",
  "gembloux",
  "gerpinnes",
  "grezdoiceau",
  "hamoir",
  "havelange",
  "helecine",
  "herbeumont",
  "heron",
  "herstal",
  "honnelles",
  "iile",
  "ittre",
  "juprelle",
  "lalouviere",
  "lalouviereatl",
  "lasne",
  "lens",
  "libramont",
  "limbourg",
  "lobbes",
  "martelange",
  "merbeslechateau",
  "mettet",
  "mons",
  "monspolemuseal",
  "montdelenclus",
  "montsaintguibert",
  "morlanwelz",
  "mouscron",
  "musson",
  "nandrin",
  "nassogne",
  "neufchateau",
  "nivelles",
  "nouveausite",
  "olln",
  "onhaye",
  "oreye",
  "orpjauche",
  "ouffet",
  "oupeye",
  "pecq",
  "pepinster",
  "peruwelz",
  "perwez",
  "philippeville",
  "profondeville",
  "quaregnon",
  "quevy",
  "ramillies",
  "rebecq",
  "remicourt",
  "rixensart",
  "rochefort",
  "sainteode",
  "saintgeorgessurmeuse",
  "saintghislain",
  "saintnicolas",
  "saintvith",
  "sambreville",
  "seneffe",
  "sennevallee",
  "silly",
  "six_smartweb",
  "soignies",
  "tellin",
  "theux",
  "thimister",
  "tintigny",
  "troisponts",
  "trooz",
  "tubize",
  "vauxsursure",
  "verlaine",
  "verviers",
  "vielsalm",
  "villerslaville",
  "villerslebouillet",
  "viroinval",
  "virton",
  "waimes",
  "walhain",
  "waremme",
  "wasseiges",
  "wavrecpas",
  "wellin",
  "yvoir",
];

// let sitesbuild = "";
// sites.forEach(element => {
//     sitesbuild = sitesbuild + "pnpm --theme="+element+ " build" + " && "
// })
// console.log(sitesbuild);

const execSync = require("child_process").execSync;

sites.forEach((site) => {
  let cmd = `pnpm --theme=${site} build`;
  let options = { stdio: "inherit" };
  execSync(cmd, options);
});

// get all site folders
// const fs = require('fs');
// const path = require('path');

// // Spécifiez le chemin du répertoire que vous voulez parcourir
// let directoryPath = path.join(__dirname, '/');

// // Lire le répertoire
// fs.readdir(directoryPath, function (err, files) {
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     }

//     // Parcourir tous les fichiers et dossiers
//     files.forEach(function (file) {
//         // Vérifiez si le fichier est un répertoire
//         if(fs.statSync(directoryPath + '/' + file).isDirectory()) {
//             console.log(file);
//         }
//     });
// });
