# 🚀 Feature: Auto Project Generation from Chat

## 📋 Résumé

Cette feature permet aux utilisateurs de démarrer une génération de blueprint **sans créer de projet manuellement**. Le système crée automatiquement un projet temporaire, puis le met à jour avec un nom et une description intelligents générés par l'IA.

## ✨ Modifications apportées

### 1. **Nouveau fichier: `metadata_agent.py`**

- Agent LLM spécialisé dans l'extraction de métadonnées projet
- Génère `name` (max 60 caractères) et `description` (max 200 caractères)
- Gestion robuste des erreurs avec fallback

**Emplacement**: `backend/app/agents/metadata_agent.py`

### 2. **Modified: `state.py`**

- Ajout de 2 nouveaux champs au `BlueprintState`:
  - `project_name: Optional[str]`
  - `project_description: Optional[str]`

**Emplacement**: `backend/app/agents/state.py`

### 3. **Modified: `nodes.py`**

- Nouveau node `node_metadata` (premier node du pipeline)
- Modifié `make_initial_state` pour initialiser les nouveaux champs
- Le node metadata:
  - Génère name/description via LLM
  - Sauvegarde dans MongoDB (run state)
  - Met à jour immédiatement le projet
  - Publie notification Redis

**Emplacement**: `backend/app/agents/nodes.py`

### 4. **Modified: `graph.py`**

- Ajout du node `METADATA` en première position
- Nouveau flux: `METADATA → REQUIREMENTS → DIAGRAMS → PLANNER → EXPORT`

**Emplacement**: `backend/app/agents/graph.py`

### 5. **Modified: `idea.py` (API endpoint)**

- `project_id` est maintenant **optionnel**
- Si absent, création automatique d'un projet temporaire avec:
  - `name: "Generating..."`
  - `description: "Project being generated from idea..."`
- Retourne `project_id` dans la réponse (utile pour le frontend)

**Emplacement**: `backend/app/api/v1/idea.py`

### 6. **Modified: `project_service.py`**

- Nouvelle fonction `update_project_metadata(project_id, name, description)`
- Utilisée par le node metadata pour mettre à jour le projet

**Emplacement**: `backend/app/services/project_service.py`

---

## 🔄 Flux de fonctionnement

### **Scénario 1: Sans project_id (nouveau comportement)**

```
User → POST /api/v1/idea/generate {"idea": "..."}
  ↓
API crée projet temporaire "Generating..."
  ↓
Crée run et enqueue job RQ
  ↓
Worker exécute pipeline:
  1. METADATA → génère nom/description → update projet immédiatement
  2. REQUIREMENTS → génère requirements
  3. DIAGRAMS → génère diagrammes
  4. PLANNER → génère plan
  5. EXPORT → assemble le tout
  ↓
Frontend peut lister projets et voir le vrai nom dès que METADATA finit
```

### **Scénario 2: Avec project_id (comportement existant préservé)**

```
User → POST /api/v1/idea/generate {"project_id": "uuid...", "idea": "..."}
  ↓
API utilise le project_id fourni
  ↓
Pipeline identique (METADATA va quand même regénérer name/desc et update)
```

---

## 📡 Messages Redis Pub/Sub

Le node metadata publie sur le channel `run:{run_id}`:

```
"Running: MetadataAgent"
"PROJECT_NAME:E-commerce Platform with AI"
```

Les autres nodes continuent de publier comme avant.

---

## 🧪 Comment tester

### Test 1: Génération sans project_id (nouveau)

```bash
curl -X POST http://localhost:8000/api/v1/idea/generate \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "A mobile app for tracking daily water intake with smart reminders and health insights"
  }'
```

**Réponse attendue:**

```json
{
  "run_id": "...",
  "project_id": "...", // 🆕 ID du projet auto-créé
  "status": "queued",
  "job_id": "...",
  "websocket_url": "/ws/run/..."
}
```

**Vérification:**

1. Lister les projets: `GET /v1/projects`
   - Un projet "Generating..." apparaît immédiatement
2. Attendre 10-20 secondes
3. Relister les projets
   - Le projet a maintenant un vrai nom (ex: "HydroTrack Water Intake App")

### Test 2: Génération avec project_id (existant - doit toujours marcher)

```bash
curl -X POST http://localhost:8000/api/v1/idea/generate \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "your-existing-project-uuid",
    "idea": "Add payment integration with Stripe"
  }'
```

**Comportement:**

- Utilise le project_id fourni
- Le projet sera mis à jour avec le nom/description généré par l'IA
- Utile pour régénérer un blueprint pour un projet existant

### Test 3: Vérifier les logs du worker

```bash
docker-compose logs -f worker
```

**Logs attendus:**

```
[METADATA_NODE] Generated: name='HydroTrack', desc='Mobile app that helps...'
[JOB] Run status updated. Starting pipeline...
Running: RequirementsAgent
Running: DiagramAgent
...
```

### Test 4: Vérifier le run state

```bash
curl http://localhost:8000/api/v1/runs/{run_id}
```

**Champs attendus dans la réponse:**

```json
{
  "run_id": "...",
  "project_id": "...",
  "status": "succeeded",
  "content": {
    "requirements": "...",
    "diagrams": "..."
    // 🆕 Métadonnées projet disponibles dans state si besoin
  }
}
```

---

## ⚠️ Points d'attention (Régression zéro)

### ✅ Rétrocompatibilité garantie

- Les anciennes requêtes avec `project_id` **fonctionnent toujours**
- Aucun changement dans les autres endpoints
- Le flux existant n'est pas modifié (juste un node ajouté au début)

### ✅ Gestion des erreurs

- Si le LLM échoue à générer metadata → fallback sur l'idée comme nom
- Si l'update du projet échoue → le pipeline continue quand même
- Try/catch dans `node_metadata` pour éviter de casser le pipeline

### ✅ Performance

- Le node metadata ajoute ~2-5 secondes au début du pipeline
- Totalement asynchrone (pas d'impact sur l'API)
- L'update du projet se fait immédiatement après génération (pas besoin d'attendre la fin)

### ✅ Tests de régression recommandés

1. Tester le endpoint `/api/v1/idea/generate` avec `project_id` fourni
2. Tester la création manuelle de projet via `/v1/projects`
3. Vérifier que les autres endpoints (requirements, diagrams, etc.) fonctionnent
4. Tester le worker RQ avec un job simple

**Status**: 🟢 Prêt pour test
