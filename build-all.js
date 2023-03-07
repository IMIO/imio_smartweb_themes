const sites = [
    "attert",
    "base",
    "blegny",
    "boussu",
    "brainelechateau",
    "cancap",
    "celles",
    "chastre",
    "chatelet",
    "comineswarneton",
    "communemanage",
    "couvin",
    "erezee",
    "flemalle",
    "geer",
    "lens",
    "limbourg",
    "lobbes",
    "merbeslechateau",
    "nandrin",
    "nassogne",
    "philippeville",
    "ramillies",
    "saintghislain",
    "saintnicolas",
    "smartweb",
    "wasseiges",
    "wavrecpas",
    "wellin",
  ]

let sitesbuild = "";
sites.forEach(element => {
    sitesbuild = sitesbuild + "pnpm --theme="+element+ " build" + " &&"
})
console.log(sitesbuild);