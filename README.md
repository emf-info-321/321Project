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

```mermaid

flowchart TD

    FE[Frontend VueJS]
    GW[API Gateway Traefik]
    KC[Keycloak Auth JWT]
    TE[Time Entry Service NestJS PostgreSQL]
    MQ[(RabbitMQ Broker)]
    RP[Reporting Service]

    FE -- "HTTP / HTTPS" --> GW
    GW -- "HTTP OpenID Connect" --> KC
    GW -- "HTTP REST JWT" --> TE
    TE -- "AMQP Publish" --> MQ
    MQ -- "AMQP Consume" --> RP

