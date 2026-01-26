#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { fetchSiteUrl } = require("./fetch-site-url");

// Couleurs pour le terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, "red");
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, "green");
}

function info(message) {
  log(`ℹ️  ${message}`, "cyan");
}

function warning(message) {
  log(`⚠️  ${message}`, "yellow");
}

// Fonction principale async
async function createTheme() {
  // Récupérer le nom du thème depuis les arguments
  const themeName = process.argv[2];

  if (!themeName) {
    error("Usage: pnpm create-theme <nom-du-theme>");
  }

  // Validation du nom du thème
  if (!/^[a-z0-9-]+$/.test(themeName)) {
    error(
      "Le nom du thème doit contenir uniquement des lettres minuscules, chiffres et tirets",
    );
  }

  const rootDir = path.resolve(__dirname, "..");
  const templateDir = path.join(rootDir, "[template]");
  const targetDir = path.join(rootDir, themeName);

  // Vérifier que le template existe
  if (!fs.existsSync(templateDir)) {
    error(`Le dossier template n'existe pas: ${templateDir}`);
  }

  // Vérifier que le thème n'existe pas déjà
  if (fs.existsSync(targetDir)) {
    error(`Le thème "${themeName}" existe déjà!`);
  }

  log(`\n🎨 Création du thème "${themeName}"...\n`, "bright");

  // 1. Récupérer l'URL du site depuis l'infradoc
  info("Recherche de l'URL du site depuis l'infradoc...");
  let siteUrl = "https://";

  try {
    const result = await fetchSiteUrl(themeName);
    if (result.url) {
      siteUrl = result.url;
      success(`URL trouvée: ${siteUrl}`);
    } else {
      if (result.error === "timeout") {
        log(
          `⚠️  Impossible de se connecter à l'infradoc (timeout après 5s) !`,
          "red",
        );
        log(`   → Utilisation de "https://" par défaut`, "yellow");
      } else if (result.error === "connection") {
        log(`⚠️  Erreur de connexion à l'infradoc !`, "red");
        log(`   → Utilisation de "https://" par défaut`, "yellow");
      } else {
        // Site non trouvé dans l'infradoc - arrêter la création
        error(
          `Le site ${themeName}_smartweb n'existe pas dans l'infradoc. Création annulée.`,
        );
      }
    }
  } catch (err) {
    warning("Erreur lors de la récupération de l'URL: " + err.message);
  }

  // 2. Auto-détecter la version de base
  info("Détection de la version du thème base...");
  const basePackageJson = path.join(rootDir, "base", "package.json");
  let baseVersion = "0.3.7"; // Version par défaut

  try {
    const basePackage = JSON.parse(fs.readFileSync(basePackageJson, "utf8"));
    baseVersion = basePackage.version;
    success(`Version détectée: ${baseVersion}`);
  } catch (err) {
    warning(`Impossible de détecter la version, utilisation de ${baseVersion}`);
  }

  // 3. Copier récursivement le dossier template
  info("Copie des fichiers du template...");

  function copyRecursive(src, dest) {
    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
      // Ignorer certains dossiers
      const dirName = path.basename(src);
      if (
        dirName === "node_modules" ||
        dirName === "dist" ||
        dirName === ".git"
      ) {
        return;
      }

      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const files = fs.readdirSync(src);
      files.forEach((file) => {
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      // Copier le fichier
      fs.copyFileSync(src, dest);
    }
  }

  copyRecursive(templateDir, targetDir);
  success("Fichiers copiés");

  // 2.5. Copier le fichier variables.scss depuis base
  info("Copie de variables.scss depuis base...");
  const baseVariablesPath = path.join(
    rootDir,
    "base",
    "src",
    "scss",
    "variables.scss",
  );
  const targetVariablesPath = path.join(
    targetDir,
    "src",
    "scss",
    "variables.scss",
  );

  try {
    if (fs.existsSync(baseVariablesPath)) {
      // S'assurer que le dossier de destination existe
      const targetScssDir = path.dirname(targetVariablesPath);
      if (!fs.existsSync(targetScssDir)) {
        fs.mkdirSync(targetScssDir, { recursive: true });
      }
      fs.copyFileSync(baseVariablesPath, targetVariablesPath);
      success("variables.scss copié depuis base");
    } else {
      warning("Fichier variables.scss non trouvé dans base");
    }
  } catch (err) {
    warning("Erreur lors de la copie de variables.scss: " + err.message);
  }

  // 3. Remplacer les tokens dans les fichiers
  info("Remplacement des tokens...");

  const filesToProcess = ["package.json", "index.html", "manifest.cfg"];

  function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    let content = fs.readFileSync(filePath, "utf8");

    for (const [search, replace] of Object.entries(replacements)) {
      content = content.replace(new RegExp(search, "g"), replace);
    }

    fs.writeFileSync(filePath, content, "utf8");
  }

  const replacements = {
    "\\[theme_id\\]": themeName,
    "\\[THEME_ID\\]": themeName.toUpperCase(),
  };

  filesToProcess.forEach((file) => {
    const filePath = path.join(targetDir, file);
    replaceInFile(filePath, replacements);
  });

  success("Tokens remplacés");

  // 4. Mettre à jour la version de base dans package.json
  info("Mise à jour de la version du thème base...");

  const targetPackageJsonPath = path.join(targetDir, "package.json");
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(targetPackageJsonPath, "utf8"),
    );

    if (
      packageJson.devDependencies &&
      packageJson.devDependencies["@imiobe/plonetheme-smartweb-base"]
    ) {
      packageJson.devDependencies["@imiobe/plonetheme-smartweb-base"] =
        baseVersion;
    }

    // Réinitialiser la version à 1.0.0
    packageJson.version = "1.0.0";

    // Mettre à jour l'URL du site dans homepage uniquement
    if (packageJson.homepage !== undefined) {
      packageJson.homepage = siteUrl;
    }

    fs.writeFileSync(
      targetPackageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n",
      "utf8",
    );
    success(`Version de base mise à jour: ${baseVersion}`);
  } catch (err) {
    warning("Erreur lors de la mise à jour du package.json");
  }

  // 5. Installation des dépendances
  info("Installation des dépendances...");
  try {
    execSync("pnpm install", {
      cwd: targetDir,
      stdio: "inherit",
    });
    success("Dépendances installées");
  } catch (err) {
    warning(
      "Erreur lors de l'installation des dépendances. Exécutez manuellement: cd " +
        themeName +
        " && pnpm install",
    );
  }

  // 6. Message final
  log("\n" + "=".repeat(60), "green");
  success(`Thème "${themeName}" créé avec succès!`);
  log("=".repeat(60) + "\n", "green");

  log("📝 GOGOGOGOGOGO:", "bright");
}

// Lancer la fonction principale
createTheme().catch((err) => {
  error("Erreur fatale: " + err.message);
});
