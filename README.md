# Twitch_extension for Elrond 

## Développement d'une extension Twitch qui permet d'afficher les dons fait sur Maiar

## Installation

### Installer node js

> https://nodejs.org/fr/download/

### Installer les packages

Commande dans le terminal:

> npm init
>
> npm install --save elrondjs

### Execution

> node elrond

- Toutes les deux secondes, je fais une requêtes qui prends les 10 derniers Hash de transaction pour les mettre dans un tableau.
- Je compare avec un second tableau que je remplis au début avec les 10 derniers Hash de tx aussi.
- Si il y a une différence entre les deux tableaux je mets les transactions par ordre d'apparition dans une file (lastTransaction).
- Et j'affiche avec console.log les transactions jusqu'à que la file soit vide.

### Resultats 

L'image du résultat n'a pas été mis à jour.

<img src="images/results.PNG" width="700"> 

### Problèmes

- Je ne sais pas si les transactions qui ont échoué sont prises en compte.
- Je ne sais pas si c'est facile d'implémenter ces fonctions pour les utiliser dans une page HTML, formulaire et affichage des dons.

### Fonctionnalités à dév

- Faire une page HTML/CSS qui demande au streamer de saisir son adresse publique.
- Envoyer l'adresse publique dans un formulaire au fichier Javascript pour faire afficher les transactions.
- Stocker éventuellement dans une base de donnée l'adresse publique du streamer.
- Afficher avec un délai toutes les transactions reçus donc les transactions dans la file.