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
void assessCampaignExpense(dossier, createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "category_supported", probabilities: { "category_supported": 0.82, "review_required": 0.06, "category_weak": 0.06, "no_expense": 0.06 }, confidence: 0.82 } } })));

// Ces erreurs attendues protègent le contrat des consommateurs TypeScript.
// @ts-expect-error — un fournisseur doit retourner une réponse Jev complète.
createFakeProvider(() => ({}));
const result = await assessCampaignExpense(dossier, createFakeProvider(() => ({ model: "jev-1.13.0", answers: {} })));
const review: boolean = result.review;
void review;
// @ts-expect-error — la revue humaine est un booléen.
const incorrect: string = result.review;
void incorrect;
