const axios = require("axios");
require("dotenv").config();

/**
 * Récupère l'URL d'un site depuis l'infradoc
 * @param {string} themeName - Le nom du thème (ex: "amay")
 * @returns {Promise<{url: string|null, error: string|null}>} - L'URL du site et le type d'erreur
 */
async function fetchSiteUrl(themeName) {
  const infradocApiUrl = process.env.INFRADOC_API_URL;
  const query = `
    query {
      instances(type: "smartweb") {
        name
        vhost_name
        server {
          environment
        }
      }
    }
  `;

  try {
    const response = await axios({
      url: infradocApiUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { query },
      timeout: 5000, // Timeout de 5 secondes
    });

    const instances = response.data.data.instances;
    const applicationName = `${themeName}_smartweb`;

    const site = instances.find(
      (instance) =>
        instance.name === applicationName &&
        instance.server[0].environment === "production",
    );

    if (site && site.vhost_name) {
      // Vérifier si l'URL contient déjà https:// ou http://
      let url;
      if (
        site.vhost_name.startsWith("http://") ||
        site.vhost_name.startsWith("https://")
      ) {
        url = site.vhost_name;
      } else {
        url = `https://${site.vhost_name}`;
      }
      return { url, error: null };
    }

    return { url: null, error: "not_found" };
  } catch (err) {
    // Vérifier si c'est un timeout
    if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
      return { url: null, error: "timeout" };
    }
    return { url: null, error: "connection" };
  }
}

module.exports = { fetchSiteUrl };
