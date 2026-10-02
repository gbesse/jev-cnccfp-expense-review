// Objectif : effectuer un appel Jev synthétique uniquement sur demande explicite.
import { createJevClient } from "../src/jev.mjs";
import { assessCampaignExpense } from "../src/index.mjs";
const client = createJevClient();
const résultat = await assessCampaignExpense({
  "id": "exemple-1",
  "text": "Facture synthétique : impression de 12 000 professions de foi distribuées pendant la campagne, avec date, fournisseur et référence de commande.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-10-01"
  },
  "details": {
    "territoire": "France — cas synthétique",
    "origine": "donnée synthétique"
  }
}, client);
console.log(JSON.stringify({ décision: résultat.decision, confiance: résultat.confidence, usage: résultat.usage }, null, 2));
