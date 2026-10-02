// Objectif : produire un rapport hors ligne comparant les trois chemins de décision.
import { assessCampaignExpense } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const principal = {
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
};
const limite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-10-01"
  },
  "expenses": []
};
const revue = {
  "id": "revue-1",
  "text": "Libellé synthétique : « accompagnement stratégique annuel », sans période détaillée ni livrable permettant d’isoler la part liée à la campagne.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-10-01"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
const réponses = [{
  "model": "jev-1.13.0",
  "answers": {
    "decision": {
      "type": "choice",
      "choice": "category_supported",
      "probabilities": {
        "category_supported": 0.82,
        "review_required": 0.06,
        "category_weak": 0.06,
        "no_expense": 0.06
      },
      "confidence": 0.82
    }
  },
  "usage": {
    "input_tokens": 120,
    "output_tokens": 0
  }
}, {
  "model": "jev-1.13.0",
  "answers": {
    "decision": {
      "type": "choice",
      "choice": "review_required",
      "probabilities": {
        "category_supported": 0.1267,
        "review_required": 0.62,
        "category_weak": 0.1267,
        "no_expense": 0.1267
      },
      "confidence": 0.62
    }
  },
  "usage": {
    "input_tokens": 140,
    "output_tokens": 0
  }
}];
const provider = createFakeProvider(() => réponses.shift());
const résultats = [];
for (const [scénario, dossier] of [["principal", principal], ["limite déterministe", limite], ["revue humaine", revue]]) {
  const résultat = await assessCampaignExpense(dossier, provider);
  résultats.push({ scénario, décision: résultat.label, revueHumaine: résultat.review, déterministe: résultat.deterministic });
}
console.log(JSON.stringify({ dépôt: "jev-cnccfp-expense-review", résultats }, null, 2));
