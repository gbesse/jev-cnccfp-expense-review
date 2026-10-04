// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { campaignExpenseCase, assessCampaignExpense, DECISIONS } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-10-01"
  },
  "expenses": []
};
const casPrincipal = {
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
const casÀRevoir = {
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
test("exige une source", () => assert.throws(() => campaignExpenseCase({ id: "x", text: "y" }), /source/));
test("refuse une date de source invalide", () => assert.throws(() => campaignExpenseCase({ id: "x", text: "y", source: { url: "https://example.test", date: "impossible" } }), /date ISO/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await assessCampaignExpense(casLimite, provider)).decision, "no_expense");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({
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
}));
  const résultat = await assessCampaignExpense(casPrincipal, provider);
  assert.equal(résultat.decision, "category_supported");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({
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
}));
  const résultat = await assessCampaignExpense(casÀRevoir, provider);
  assert.equal(résultat.decision, "review_required");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
});

test("refuse les champs vides ou de mauvais type", () => {
  for (const field of ["id", "text"]) {
    for (const value of ["  ", 42, {}]) assert.throws(() => campaignExpenseCase({ ...casPrincipal, [field]: value }), TypeError);
  }
});
test("refuse les sources non HTTP et les dates impossibles", () => {
  for (const url of ["invalide", "file:///tmp/doc", "https://user:password@example.test/doc"]) assert.throws(() => campaignExpenseCase({ ...casPrincipal, source: { ...casPrincipal.source, url } }), /URL/);
  assert.throws(() => campaignExpenseCase({ ...casPrincipal, source: { ...casPrincipal.source, date: "2026-02-30" } }), /date ISO/);
});
test("conserve les métadonnées de provenance", () => {
  const record = campaignExpenseCase({ ...casPrincipal, source: { ...casPrincipal.source, licence: "Licence Ouverte", millésime: "2026" } });
  assert.equal(record.source.licence, "Licence Ouverte");
  assert.equal(record.source.millésime, "2026");
});
test("refuse une collection mal formée avant tout appel", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  await assert.rejects(assessCampaignExpense({ ...casPrincipal, expenses: {} }, provider), /tableau/);
  assert.equal(provider.calls, 0);
});
test("une revue demandée reste obligatoire même avec une forte confiance", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "review_required", probabilities: Object.fromEntries(Object.keys(DECISIONS).map((key) => [key, key === "review_required" ? 0.94 : 0.02])), confidence: 0.94 } } }));
  assert.equal((await assessCampaignExpense(casÀRevoir, provider)).review, true);
});
test("le seuil de confiance est inclusif à 0.8", async () => {
  for (const confidence of [0.799, 0.8]) {
    const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "category_supported", probabilities: Object.fromEntries(Object.keys(DECISIONS).map((key) => [key, key === "category_supported" ? 0.82 : 0.06])), confidence } } }));
    assert.equal((await assessCampaignExpense(casPrincipal, provider)).review, confidence < 0.8);
  }
});
test("valide aussi les réponses d’un fournisseur personnalisé", async () => {
  const provider = { decide: async () => ({ model: "personnalise", answers: { decision: { type: "choice", choice: "toString", confidence: 0.99, probabilities: {} } } }) };
  await assert.rejects(assessCampaignExpense(casPrincipal, provider), /Choix Jev invalide/);
});

test("une absence de données choisie par Jev exige une revue", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "no_expense", probabilities: Object.fromEntries(Object.keys(DECISIONS).map((key) => [key, key === "no_expense" ? 0.94 : 0.02])), confidence: 0.94 } } }));
  const résultat = await assessCampaignExpense(casPrincipal, provider);
  assert.equal(résultat.review, true);
  assert.equal(résultat.deterministic, false);
});

test("accepte une date historique et un horodatage avec décalage", () => {
  for (const date of ["1899-12-31", "0099-01-01", "2026-10-04T23:30:00-02:00"]) {
    assert.equal(campaignExpenseCase({ ...casPrincipal, source: { ...casPrincipal.source, date } }).source.date, new Date(date).toISOString());
  }
});
