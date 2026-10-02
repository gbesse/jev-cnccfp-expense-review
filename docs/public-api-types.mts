// Objectif : vérifier les types publiés depuis un projet consommateur.
import { campaignExpenseCase, assessCampaignExpense, DECISIONS } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = campaignExpenseCase({
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
});
void DECISIONS;
void assessCampaignExpense(dossier, createFakeProvider(() => ({})));
