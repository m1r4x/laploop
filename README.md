# Lap Tracker

Web app semplice per contare i giri di corsa di più studenti, pensata per uso su iPhone e uso outdoor.

## Funzioni principali
- gestione classe e studenti
- selezione rapido studente attivo
- bottone grande per registrare un giro
- calcolo di lap time e cumulative time
- persistenza locale con localStorage
- export JSON e CSV
- modalità offline dopo primo caricamento

## Avvio locale

### Opzione 1: semplice
Apri il file `index.html` direttamente nel browser, ma per avere una migliore esperienza usa un server locale.

### Opzione 2: server locale
```bash
cd /home/marcom/perFABIANA
python3 -m http.server 8000
```

Poi apri:
```text
http://localhost:8000
```

## Installazione su iPhone
1. Apri la pagina in Safari.
2. Tocca il pulsante con l’icona di condivisione.
3. Seleziona "Aggiungi alla schermata Home".
4. Usa l’app come una web app installata.

## Limiti
Questa è una web app, non un’app nativa iOS. È la scelta più realistica senza Mac e senza Apple Developer Program, ma non sostituisce una app SwiftUI nativa per massima velocità e integrazione del sistema.

## Dati
I dati vengono salvati nel browser locale (`localStorage`) e persistono anche dopo la chiusura della scheda o della finestra del browser.
