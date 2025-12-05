# Projet 321 TimeTracker

Le projet TimeTracker est conçu comme un système distribué local-first, entièrement exécutable en local via Docker Compose.
Chaque composant du système fonctionne comme un service indépendant, communiquant au travers d’API REST ou d’un message broker.



## Schéma simplifié

```mermaid

flowchart TD

    FE[Frontend web - vuejs]
    GW[API Gateway - Traefik]
    KC[Auth Service - keycloak]
    TE[Time Entry Service - nodejs]
    MQ[(Event Broker - RabbitMQ)]
    RP[Reporting Service - nodejs]

    FE -- "HTTP / HTTPS" --> GW
    GW -- "HTTP OpenID Connect" --> KC
    GW -- "HTTP REST + JWT" --> TE
    TE -- "AMQP Events" --> MQ
    MQ -- "AMQP Consume" --> RP

```
## 🧩 Liste des services
### 1. Frontend Web
Interface utilisateur accessible depuis le navigateur.
Il communique uniquement avec l’API Gateway et utilise Keycloak pour l’authentification.

Technologies possibles : Vue.js, React, Svelte <br>
Responsabilités :
- Afficher les écrans de saisie et de reporting
- Gérer le login via Keycloak
- Envoyer des requêtes REST signées (JWT)

#### Détails :
 to complete ...


---

```mermaid
erDiagram
    ETUDIANT {
        int id_etudiant PK
        string nom
        string prenom
        date date_naissance
        string email
    }

    PROFESSEUR {
        int id_prof PK
        string nom
        string prenom
        string email
    }

    SALLE {
        int id_salle PK
        string nom_salle
        int capacite
    }

    COURS {
        int id_cours PK
        string nom_cours
        int credits
        int id_prof FK
        int id_salle FK
    }

    INSCRIPTION {
        int id_etudiant FK
        int id_cours FK
        date date_inscription
        float note_finale
    }

    PROFESSEUR ||--o{ COURS : "donne"
    SALLE ||--o{ COURS : "accueille"
    ETUDIANT ||--o{ INSCRIPTION : "s'inscrit"
    COURS ||--o{ INSCRIPTION : "contient"
```

### 2. API Gateway
Point d’entrée unique du système.
Il redirige le trafic vers les services internes et protège l’architecture.

Technologies possibles : Traefik, Caddy, Nginx <br>
Responsabilités :
- Router les requêtes vers Keycloak, Time Entry Service et Reporting
- Exposer les endpoints unifiés (ex. /api/…)
- Jouer le rôle de reverse proxy

#### Détails :
Lancement du docker compose up <br>
Tout se trouve dans le dossier traefik

---

### 3. Auth Service (Keycloak)
Service centralisé d’authentification et d’autorisation.
Il gère les utilisateurs et délivre les tokens JWT utilisés pour sécuriser les services backend.

Technologie : Keycloak <br>
Responsabilités :
- Authentifier les utilisateurs via OpenID Connect
- Gérer les rôles et permissions
- Émettre et valider les tokens JWT
<br>

#### Détails :
Accès sur : http://localhost:8081 (après le docker compose up) <br>
- Login : admin / admin
- Créer un realm timetracker : Menu en haut à gauche → “Create realm” - nom timetracker - save
- Créer un client pour le frontend - Aller dans le realm timetracker - 
    - Menu “Clients” → “Create client”
    - Client ID : timetracker-frontend
    - Type : OpenID Connect
    - “Root URL” (si demandé) : http://localhost:5173 (Vite)
- Ensuite, dans la config du client :
    - “Access type” : public
    - “Valid redirect URIs” : http://localhost:5173/*
    - “Web origins” : http://localhost:5173 ou * pour tester

---

### 4. Time Entry Service
Service métier principal chargé de la gestion des entrées de temps.
Il publie également des événements à destination du Reporting Service.

Technologies recommandées : Node.js (NestJS) + PostgreSQL <br>
Responsabilités :
- CRUD des entrées de temps
- Validation des tokens JWT
- Stockage des données dans PostgreSQL
- Publication d’événements AMQP vers RabbitMQ

<br>

#### Détails :
Tout dans le dossier time-entry-service

---

### 5. Event Broker (RabbitMQ)
Système de messagerie asynchrone assurant la communication entre les services.
Il implémente le modèle Publish/Subscribe.

Technologie : RabbitMQ (AMQP) <br>
Responsabilités :
- Transport des événements internes
- Gestion des files, des retries et de la résilience
- Découplage entre Time Entry Service et Reporting Service

#### Détails :
container rabbitmq sur port 5672


---

### 6. Reporting / Analytics Service
Service chargé de consommer les événements et de produire un modèle de lecture optimisé.

Technologies possibles : Node.js, Python, Redis ou PostgreSQL <br>
Responsabilités :
- Consommer les messages provenant de RabbitMQ
- Calculer les statistiques de temps
- Maintenir un read-model optimisé
- Exposer une API REST pour le reporting

#### Détails :
Tout dans le dossier reporting-service et container_name: reporting-service
