# Comment la décision est prise

Prépare la revue de libellés de dépenses électorales et rend visibles les rattachements ambigus.

Le code normalise la source et applique d’abord le cas déterministe documenté dans `src/index.mjs`. Pour les autres dossiers, Jev choisit la catégorie la plus prudente selon le rattachement du libellé aux catégories proposées, la finalité électorale explicitée et la présence d’indices vérifiables. Une confiance inférieure à `0.8` marque le résultat pour revue humaine.

Les montants, plafonds, dates et règles comptables explicites restent contrôlés par le code.

Les démonstrations ne contiennent que des probabilités synthétiques. Constituez un corpus français annoté, mesurez les erreurs par catégorie et fixez vos propres seuils avant un usage opérationnel.
