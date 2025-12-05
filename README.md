Architecture (Environnement Local)

Le projet TimeTracker est conçu comme un système distribué local-first, entièrement exécutable en local via Docker Compose.
Chaque composant du système fonctionne comme un service indépendant, communiquant au travers d’API REST ou d’un message broker.

Cette architecture permet de couvrir les notions clés du module 321 :

microservices

systèmes distribués

message broker (pub/sub)

authentification centralisée (OpenID / OAuth2 / JWT)

résilience, idempotence, séparation des responsabilités

monitoring et documentation d’API

Vue d'ensemble du système

Le système est composé de six services principaux :

API Gateway — point d’entrée unique pour toutes les requêtes

Auth Service (Keycloak) — gestion des utilisateurs et des tokens JWT

Time Entry Service — service métier pour la saisie d’heures

Reporting Service — génération de statistiques via pub/sub

Message Broker (RabbitMQ) — transport des événements

Base de données — stockage persistant (PostgreSQL)

Schéma simplifié :


                     +-------------------+
                     |     Frontend      |
                     |   (React/Vue/etc) |
                     +---------+---------+
                               |
                               v
                       +-------+--------+
                       |   API Gateway  |
                       | (Traefik/Caddy)|
                       +-------+--------+
                               |
                +--------------+--------------+
                |                             |
                v                             v

        +---------------------------+   +---------------------------+
        |         Keycloak          |   |    Time Entry Service     |
        |   (Auth / Users / JWT)    |   |   (REST API + PostgreSQL) |
        +---------------------------+   +-------------+-------------+
                                                      |
                                                      |  Publie des événements :
                                                      |    - time.entry.created
                                                      |    - time.entry.updated
                                                      v
                                              +-------+-------+
                                              |   RabbitMQ    |
                                              | (Message Bus) |
                                              +-------+-------+
                                                      |
                                                      |  Diffuse les messages
                                                      v
                                         +-----------------------------+
                                         |     Reporting Service       |
                                         | (Stats / Read Model / API) |
                                         +-----------------------------+


flowchart TD

    %% Frontend
    FE[Frontend<br/>(Web App)] --> GW[API Gateway<br/>(Traefik / Caddy)]

    %% Gateway routes
    GW --> KC[Keycloak<br/>(Auth / Users / JWT)]
    GW --> TE[Time Entry Service<br/>(REST API + PostgreSQL)]

    %% Time Entry to MQ
    TE -->|Publie événements<br/>time.entry.created / updated| MQ[(RabbitMQ<br/>(Message Broker))]

    %% MQ to Reporting
    MQ --> RP[Reporting Service<br/>(Stats / Read Model / API)]
