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
                       +---+--------+---+
                           |        |
                           |        |
         Auth              |        |    API
+----------------+         |        |
|   Keycloak     |<--------+        v
| (Auth Service) |              +---+------------------+
+----------------+              |  Time Entry Service  |
                                | (REST + PostgreSQL)  |
                                +---+------------------+
                                    |
                                    |  Publish events
                                    v
                           +-------------------+
                           |     RabbitMQ      |
                           | (Message Broker)  |
                           +---------+---------+
                                     |
                                     |  Subscribe events
                                     v
                     +-------------------------+
                     |    Reporting Service    |
                     | (Stats + Read Model)    |
                     +-------------------------+

Description des composants
1. API Gateway (Traefik ou Caddy)

Point d’entrée unique pour le système.