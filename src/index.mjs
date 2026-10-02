// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "category_supported": "categorie_etayee",
  "review_required": "revue_requise",
  "category_weak": "categorie_peu_etayee",
  "no_expense": "aucune_depense_fournie"
});
const CRITERIA = Object.freeze({
  "category_supported": "categorie etayee",
  "review_required": "revue requise",
  "category_weak": "categorie peu etayee",
  "no_expense": "aucune depense fournie"
});
export function campaignExpenseCase(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function assessCampaignExpense(input, provider) {
  const record = campaignExpenseCase(input);
  if (Array.isArray(record.expenses) && record.expenses.length === 0) return { decision: "no_expense", label: DECISIONS["no_expense"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce dossier à partir des seuls éléments sourcés. Évaluez le rattachement du libellé aux catégories proposées, la finalité électorale explicitée et la présence d’indices vérifiables. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni règle applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-cnccfp-expense-review <dossier.json>");
  const dossier = campaignExpenseCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à assessCampaignExpense avec un fournisseur Jev configuré." }, null, 2));
}
