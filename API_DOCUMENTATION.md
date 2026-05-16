# API Documentation — Gestion des Absences et Rattrapages des Enseignants

**Base URL:** `http://127.0.0.1:8000/api/v1`  
**Version:** 1.0.0  
**Auth:** Bearer Token (JWT) — include `Authorization: Bearer <token>` on all protected routes.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Departments](#3-departments)
4. [Groups](#4-groups)
5. [Subjects (Matières)](#5-subjects-matières)
6. [Rooms (Salles)](#6-rooms-salles)
7. [Timetables (Emplois du Temps)](#7-timetables-emplois-du-temps)
8. [Absences](#8-absences)
9. [Makeups (Rattrapages)](#9-makeups-rattrapages)
10. [Dashboard](#10-dashboard)
11. [Notifications](#11-notifications)
12. [Schemas](#12-schemas)

---

## Roles

| Role | Description |
|---|---|
| `admin_systeme` | Full system access |
| `administration` | University admin |
| `enseignant` | Teacher |
| `etudiant` | Student |

---

## Paginated Response Shape

All list endpoints return:

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "total_pages": 5
}
```

---

## 1. Authentication

**Base path:** `/auth`

### POST /auth/login

Authenticate and receive a JWT token. No auth required.

**Request Body** (`application/json`):
```json
{
  "email": "user@example.com",
  "mot_de_passe": "password123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Error 401:** Invalid credentials.

---

### GET /auth/me

Get the currently authenticated user's profile.

- **Access:** Any authenticated role

**Response 200:** `UtilisateurResponse`

---

### PUT /auth/me

Update own profile.

- **Access:** Any authenticated role

**Request Body** (`application/json`) — all fields optional:
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "new@email.com",
  "mot_de_passe": "newpassword"
}
```

**Response 200:** `UtilisateurResponse`  
**Error 400:** Email already taken.

---

## 2. Users

**Base path:** `/users`  
**Access:** `admin_systeme` only (all endpoints)

### GET /users/

List all users with optional filters.

| Query Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `per_page` | int | 20 | Max 100 |
| `role` | string | — | Filter by role enum |
| `actif` | bool | — | Filter by active status |
| `search` | string | — | Search by name/email |

**Response 200:** `PaginatedResponse[UtilisateurResponse]`

---

### POST /users/

Create a new user.

**Request Body:**
```json
{
  "nom": "Martin",
  "prenom": "Sophie",
  "email": "s.martin@univ.com",
  "role": "enseignant",
  "mot_de_passe": "password123",
  "actif": true
}
```

**Response 201:** `UtilisateurResponse`  
**Error 400:** Email already registered.

---

### GET /users/{user_id}

Get a user by ID.

**Response 200:** `UtilisateurResponse` | **Error 404**

---

### PUT /users/{user_id}

Update a user. Cannot modify own account.

**Request Body:** `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `actif` — all optional.

**Response 200:** `UtilisateurResponse`  
**Error 403:** Cannot modify own account. | **Error 404**

---

### DELETE /users/{user_id}

Delete a user. Cannot delete own account.

**Response 204** | **Error 403 / 404**

---

### PUT /users/{user_id}/activer

Activate a user account.

**Response 200:** `UtilisateurResponse`

---

### PUT /users/{user_id}/desactiver

Deactivate a user account.

**Response 200:** `UtilisateurResponse`

---

## 3. Departments

**Base path:** `/departements`

### GET /departements/

- **Access:** `admin_systeme`, `administration`

**Query Params:** `page`, `per_page`, `search`

**Response 200:** `PaginatedResponse[DepartementResponse]`

---

### POST /departements/

- **Access:** `admin_systeme` only

**Request Body:** `{ "nom": "Informatique" }`

**Response 201:** `DepartementResponse`

---

### PUT /departements/{departement_id}

- **Access:** `admin_systeme` only

**Request Body:** `{ "nom": "Nouveau nom" }` (optional)

**Response 200:** `DepartementResponse` | **Error 404**

---

### DELETE /departements/{departement_id}

- **Access:** `admin_systeme` only

**Response 204**  
**Error 400:** Has linked groups/subjects. | **Error 404**

---

## 4. Groups

**Base path:** `/groupes`

### GET /groupes/

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Query Params:** `page`, `per_page`, `search`

**Response 200:** `PaginatedResponse[GroupeResponse]`

---

### POST /groupes/

- **Access:** `admin_systeme`, `administration`

**Request Body:**
```json
{ "nom": "Groupe A", "departement_id": 1 }
```

**Response 201:** `GroupeResponse` | **Error 400:** Department not found.

---

### GET /groupes/{groupe_id}

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Response 200:** `GroupeResponse` | **Error 404**

---

### PUT /groupes/{groupe_id}

- **Access:** `admin_systeme`, `administration`

**Request Body:** `nom`, `departement_id` — both optional.

**Response 200:** `GroupeResponse` | **Error 404**

---

### DELETE /groupes/{groupe_id}

- **Access:** `admin_systeme` only

**Response 204**  
**Error 400:** Used in timetable. | **Error 404**

---

### GET /groupes/departement/{departement_id}

List groups for a department.

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Query Params:** `page`, `per_page`

**Response 200:** `PaginatedResponse[GroupeResponse]` | **Error 404**

---

### POST /groupes/{groupe_id}/etudiants

Add students to a group.

- **Access:** `administration` only

**Request Body:**
```json
{ "etudiants_ids": [3, 4, 5] }
```

**Response 200:** `{ "message": "...", "errors": [] }`  
**Error 409:** Students already in another group.

---

### DELETE /groupes/{groupe_id}/etudiants/{etudiant_id}

Remove a student from a group.

- **Access:** `administration` only

**Response 204** | **Error 404**

---

### GET /groupes/{groupe_id}/etudiants

List students in a group.

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Query Params:** `page`, `per_page`

**Response 200:** `PaginatedResponse[UtilisateurResponse]`

---

## 5. Subjects (Matières)

**Base path:** `/matieres`

### GET /matieres/

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Query Params:** `page`, `per_page`, `search`

**Response 200:** `PaginatedResponse[MatiereResponse]`

---

### POST /matieres/

- **Access:** `admin_systeme`, `administration`

**Request Body:**
```json
{
  "nom": "Algorithmique",
  "departement_id": 1,
  "enseignant_id": 3
}
```
`enseignant_id` is optional.

**Response 201:** `MatiereResponse`  
**Error 400:** Department or teacher invalid.

---

### GET /matieres/{matiere_id}

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Response 200:** `MatiereResponse` | **Error 404**

---

### PUT /matieres/{matiere_id}

- **Access:** `admin_systeme`, `administration`

**Request Body:** `nom`, `departement_id`, `enseignant_id` — all optional.

**Response 200:** `MatiereResponse` | **Error 404**

---

### DELETE /matieres/{matiere_id}

- **Access:** `admin_systeme` only

**Response 204** | **Error 404**

---

### GET /matieres/enseignant/{enseignant_id}

List subjects by teacher.

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Query Params:** `page`, `per_page`

**Response 200:** `PaginatedResponse[MatiereResponse]` | **Error 404**

---

## 6. Rooms (Salles)

**Base path:** `/salles`

### GET /salles/

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Query Params:** `page`, `per_page`, `search`

**Response 200:** `PaginatedResponse[SalleResponse]`

---

### GET /salles/disponibles

Find available rooms for a time slot.

- **Access:** All authenticated roles

**Required Query Params:**

| Param | Type | Description |
|---|---|---|
| `date` | date | YYYY-MM-DD |
| `heure_debut` | time | HH:MM |
| `heure_fin` | time | HH:MM |

**Optional:** `page`, `per_page`

**Response 200:** `PaginatedResponse[SalleResponse]`  
**Error 400:** Start must be before end.

---

### GET /salles/{salle_id}

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Response 200:** `SalleResponse` | **Error 404**

---

### POST /salles/

- **Access:** `admin_systeme`, `administration`

**Request Body:**
```json
{ "nom": "Salle A101", "capacite": 30 }
```

**Response 201:** `SalleResponse`

---

### PUT /salles/{salle_id}

- **Access:** `admin_systeme`, `administration`

**Request Body:** `nom`, `capacite` — both optional.

**Response 200:** `SalleResponse` | **Error 404**

---

### DELETE /salles/{salle_id}

- **Access:** `admin_systeme` only

**Response 204**  
**Error 400:** Has future bookings. | **Error 404**

---

## 7. Timetables (Emplois du Temps)

**Base path:** `/emplois-du-temps`

> `jour_semaine`: `0=Lundi, 1=Mardi, 2=Mercredi, 3=Jeudi, 4=Vendredi, 5=Samedi, 6=Dimanche`

### GET /emplois-du-temps/groupe/{groupe_id}

Timetable for a group. Students must be group members.

- **Access:** All roles

**Query Params:** `page`, `per_page`, `jour_semaine` (0–6, optional)

**Response 200:** `PaginatedResponse[EmploiDuTempsResponse]`

---

### GET /emplois-du-temps/etudiant

Timetable for the logged-in student.

- **Access:** `etudiant` only

**Query Params:** `page`, `per_page`, `jour_semaine`

**Response 200:** `PaginatedResponse[EmploiDuTempsResponse]`

---

### GET /emplois-du-temps/enseignant

Timetable for the logged-in teacher.

- **Access:** `enseignant` only

**Query Params:** `page`, `per_page`, `jour_semaine`

**Response 200:** `PaginatedResponse[EmploiDuTempsResponse]`

---

### GET /emplois-du-temps/salle/{salle_id}

- **Access:** `admin_systeme`, `administration`

**Query Params:** `page`, `per_page`, `jour_semaine`

**Response 200:** `PaginatedResponse[EmploiDuTempsResponse]`

---

### GET /emplois-du-temps/matiere/{matiere_id}

- **Access:** `admin_systeme`, `administration`, `enseignant`

**Query Params:** `page`, `per_page`, `jour_semaine`

**Response 200:** `PaginatedResponse[EmploiDuTempsResponse]`

---

### GET /emplois-du-temps/conflits-planning

Detect scheduling conflicts.

- **Access:** `admin_systeme`, `administration`

**Response 200:** List of conflict objects.

---

### POST /emplois-du-temps/

- **Access:** `admin_systeme`, `administration`

**Request Body:**
```json
{
  "groupe_id": 1,
  "matiere_id": 2,
  "salle_id": 3,
  "jour_semaine": 0,
  "heure_debut": "08:00",
  "heure_fin": "10:00"
}
```

**Response 201:** `EmploiDuTempsResponse`  
**Error 400:** Time conflict or invalid hours.

---

### PUT /emplois-du-temps/{id}

- **Access:** `admin_systeme`, `administration`

**Request Body:** All fields optional.

**Response 200:** `EmploiDuTempsResponse` | **Error 404**

---

### DELETE /emplois-du-temps/{id}

- **Access:** `admin_systeme`, `administration`

**Response 204**

---

## 8. Absences

**Base path:** `/absences`

### GET /absences/

List absences. Teachers see only their own.

- **Access:** `admin_systeme`, `administration`, `enseignant`

| Query Param | Type | Description |
|---|---|---|
| `page` | int | Default 1 |
| `per_page` | int | Default 20 |
| `statut` | string | `en_attente` / `valide` / `rejete` |
| `date_absence` | date | YYYY-MM-DD |

**Response 200:** `PaginatedResponse[AbsenceResponse]`

---

### GET /absences/en-attente

List absences awaiting review.

- **Access:** `admin_systeme`, `administration`

**Query Params:** `page`, `per_page`

**Response 200:** `PaginatedResponse[AbsenceResponse]`

---

### GET /absences/historique

Teacher's own absence history.

- **Access:** `enseignant` only

**Response 200:** `PaginatedResponse[AbsenceResponse]`

---

### GET /absences/{id}

- **Access:** All authenticated. Teachers see only their own.

**Response 200:** `AbsenceResponse` | **Error 403 / 404**

---

### POST /absences/

Declare a new absence (`multipart/form-data`).

- **Access:** `enseignant` only

| Field | Type | Required | Description |
|---|---|---|---|
| `matiere_id` | int | Yes | Subject ID |
| `date_absence` | date | Yes | YYYY-MM-DD |
| `motif` | string | Yes | Reason |
| `justificatif` | file | No | Supporting document |

**Business Rules:**
- Teacher must own the subject.
- Teacher must have a course scheduled on that day.
- Date cannot be in the past.
- No duplicate (same subject + date).

**Response 201:** `AbsenceResponse`  
**Error 400:** Rule violation. | **Error 403:** Not a teacher.

---

### PUT /absences/{id}

Update an absence (only while `en_attente`).

- **Access:** `enseignant` only (owner)

**Form Fields (all optional):** `matiere_id`, `date_absence`, `motif`, `justificatif`

**Response 200:** `AbsenceResponse`  
**Error 400:** Already validated/rejected. | **Error 403:** Not owner.

---

### PUT /absences/{id}/valider

Approve an absence.

- **Access:** `admin_systeme`, `administration`

**Response 200:** `AbsenceResponse`

---

### PUT /absences/{id}/rejeter

Reject an absence.

- **Access:** `admin_systeme`, `administration`

**Response 200:** `AbsenceResponse`

---

### DELETE /absences/{id}

Delete an absence (only while `en_attente`).

- **Access:** `enseignant` only (owner)

**Response 204**  
**Error 400:** Already validated/rejected.

---

## 9. Makeups (Rattrapages)

**Base path:** `/rattrapages`

### GET /rattrapages/

List all makeups. Teachers see only their own.

- **Access:** All authenticated roles

| Query Param | Type | Description |
|---|---|---|
| `page` | int | Default 1 |
| `per_page` | int | Default 20 |
| `statut` | string | `propose` / `valide` / `annule` |
| `absence_id` | int | Filter by absence |
| `date_from` | date | Start of range |
| `date_to` | date | End of range |

**Response 200:** `PaginatedResponse[RattrapageResponse]`

---

### GET /rattrapages/a-venir

Upcoming makeups. Teachers see their own, students see only validated ones.

- **Access:** All authenticated roles

**Response 200:** `PaginatedResponse[RattrapageResponse]`

---

### GET /rattrapages/{id}

- **Access:** All authenticated. Teachers see only their own.

**Response 200:** `RattrapageResponse` | **Error 403 / 404**

---

### POST /rattrapages/

Propose a makeup session.

- **Access:** `enseignant` only

**Request Body:**
```json
{
  "absence_id": 5,
  "salle_id": 2,
  "date_proposee": "2026-06-15",
  "heure_debut": "14:00",
  "heure_fin": "16:00"
}
```

**Business Rules:**
- Teacher must own the absence.
- Absence must be `valide`.
- Start before end.
- Makeup date must be after absence date.
- No existing active makeup for that absence.
- No room or teacher scheduling conflict.

**Response 201:** `RattrapageResponse`  
**Error 400:** Rule/conflict violation.

---

### PUT /rattrapages/{id}/valider

Validate a makeup.

- **Access:** `admin_systeme`, `administration`

**Response 200:** `RattrapageResponse`

---

### PUT /rattrapages/{id}/annuler

Cancel a makeup.

- **Access:** Owner (`enseignant`) or admins

**Response 200:** `RattrapageResponse` | **Error 403**

---

### PUT /rattrapages/{id}/affecter-salle

Reassign a room.

- **Access:** `admin_systeme`, `administration`

**Request Body:** `{ "salle_id": 4 }`

**Response 200:** `RattrapageResponse`  
**Error 400:** Room conflict.

---

### DELETE /rattrapages/{id}

Delete a makeup (not if validated).

- **Access:** Owner or admins

**Response 204**  
**Error 400:** Already validated. | **Error 403:** Not authorized.

---

## 10. Dashboard

**Base path:** `/dashboard`

### GET /dashboard/admin/stats

- **Access:** `admin_systeme`, `administration`

**Response 200:** `AdminStatsResponse`
```json
{
  "users": { "total": 14, "enseignants": 2, "etudiants": 10 },
  "absences": { "total": 5, "en_attente": 2, "validees": 3 },
  "rattrapages": { "total": 3, "valides": 1 },
  "salles_et_cours": { "total_salles": 5, "total_cours": 12 }
}
```

---

### GET /dashboard/enseignant/stats

- **Access:** `enseignant` only

**Response 200:** `TeacherStatsResponse`
```json
{
  "absences": { "total": 3, "en_attente": 1, "validees": 2 },
  "rattrapages": { "total": 2, "proposes": 1, "valides": 1 },
  "cours": { "total": 4 }
}
```

---

### GET /dashboard/etudiant/stats

- **Access:** `etudiant` only

**Response 200:** `StudentStatsResponse`
```json
{
  "cours": { "total": 6 },
  "absences_enseignants": { "total": 2 },
  "rattrapages": { "total": 1, "valides": 1 },
  "list_rattrapages_a_venir": []
}
```

---

## 11. Notifications

**Base path:** `/notifications`

### GET /notifications/

All notifications for the logged-in user.

- **Access:** All authenticated roles

**Query Params:** `page`, `per_page`

**Response 200:** `PaginatedResponse[NotificationResponse]`

---

### GET /notifications/non-lues

Unread notifications only.

- **Access:** All authenticated roles

**Response 200:** `PaginatedResponse[NotificationResponse]`

---

### GET /notifications/{id}

- **Access:** Owner only

**Response 200:** `NotificationResponse` | **Error 404**

---

### PUT /notifications/{id}/lire

Mark a notification as read.

- **Access:** Owner only

**Response 200:** `NotificationResponse`

---

### PUT /notifications/tout-lire

Mark all notifications as read.

- **Access:** All authenticated roles

**Response 200:**
```json
{
  "message": "Toutes les notifications ont été marquées comme lues",
  "updated_count": 5
}
```

---

### DELETE /notifications/{id}

- **Access:** Owner only

**Response 204**

---

## 12. Schemas

### UtilisateurResponse

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `nom` | string | max 100 |
| `prenom` | string | max 100 |
| `email` | email | max 150 |
| `role` | RoleUtilisateur | enum |
| `actif` | bool | default true |
| `created_at` | datetime | |
| `updated_at` | datetime | |

### AbsenceResponse

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `enseignant_id` | int | |
| `enseignant` | UtilisateurSimple | nullable |
| `matiere_id` | int | |
| `matiere` | MatiereSimple | nullable |
| `date_absence` | date | |
| `motif` | string | |
| `justificatif` | string | File path, nullable |
| `statut` | StatutAbsence | `en_attente`/`valide`/`rejete` |
| `created_at` | datetime | |
| `updated_at` | datetime | |

### RattrapageResponse

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `absence_id` | int | |
| `absence` | AbsenceSimple | nullable |
| `salle_id` | int | |
| `salle` | SalleSimple | nullable |
| `date_proposee` | date | |
| `heure_debut` | time | |
| `heure_fin` | time | |
| `statut` | StatutRattrapage | `propose`/`valide`/`annule` |
| `valide_par` | int | Admin ID, nullable |
| `created_at` | datetime | |
| `updated_at` | datetime | |

### NotificationResponse

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `titre` | string | |
| `message` | string | |
| `est_lu` | bool | |
| `created_at` | datetime | |

### Enumerations

| Enum | Values |
|---|---|
| `StatutAbsence` | `en_attente`, `valide`, `rejete` |
| `StatutRattrapage` | `propose`, `valide`, `annule` |
| `RoleUtilisateur` | `admin_systeme`, `administration`, `enseignant`, `etudiant` |

---

## Common HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request — business rule violation |
| 401 | Unauthorized — missing/invalid token |
| 403 | Forbidden — insufficient role |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity — validation error |
