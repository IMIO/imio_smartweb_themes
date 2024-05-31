const sites = [
  "ans",
  "arris",
  "ath",
  "attert",
  "base",
  "bastogne",
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
  "couvin",
  "demo",
  "enghien",
  "erezee",
  "estinnes",
  "ferrieres",
  "fexhelehautclocher",
  "flemalle",
  "fosseslaville",
  "frameries",
  "geer",
  "gerpinnes",
  "grezdoiceau",
  "hamoir",
  "havelange",
  "helecine",
  "honnelles",
  "iile",
  "juprelle",
  "lalouviereatl",
  "lens",
  "limbourg",
  "lobbes",
  "merbeslechateau",
  "mettet",
  "monspolemuseal",
  "nandrin",
  "nassogne",
  "neufchateau",
  "nivelles",
  "olln",
  "oupeye",
  "pepinster",
  "peruwelz",
  "philippeville",
  "profondeville",
  "quevy",
  "ramillies",
  "remicourt",
  "rochefort",
  "saintghislain",
  "saintnicolas",
  "sennevallee",
  "silly",
  "six_smartweb",
  "smartweb",
  "template",
  "theux",
  "thimister",
  "tubize",
  "vauxsursure",
  "villerslebouillet",
  "virton",
  "wasseiges",
  "wavrecpas",
  "wellin",
  "yvoir"
]

// let sitesbuild = "";
// sites.forEach(element => {
//     sitesbuild = sitesbuild + "pnpm --theme="+element+ " build" + " && "
// })
// console.log(sitesbuild);


const execSync = require('child_process').execSync;

sites.forEach(site => {
    let cmd = `pnpm --theme=${site} build`;
    let options = { stdio: 'inherit' };
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