# Lap Tracker

Web app pensata per monitorare i giri di corsa di più studenti in modo rapido e pratico, soprattutto in ambito allenamento outdoor o scuola.

## Funzioni principali
- gestione di una classe con fino a 7 studenti
- selezione rapida dello studente attivo
- pulsante per ogni studente per registrare un giro
- timer attivo per ogni studente e visualizzazione del tempo totale
- chiusura corsa individuale con il pulsante "Fine"
- chiusura globale della corsa con "Fine corsa"
- persistenza dei dati in localStorage
- export completo in JSON
- export CSV del singolo studente attivo
- supporto offline tramite service worker e cache

## Flusso d’uso
1. Aggiungi gli studenti della classe.
2. Seleziona lo studente da monitorare.
3. Premi il bottone del ragazzo per registrare un giro.
4. Il tempo viene calcolato automaticamente come lap time e cumulative time.
5. Quando lo studente termina, usa "Fine" per chiudere la sua sessione.
6. Con "Fine corsa" puoi terminare tutte le sessioni attive in un solo click.

## Avvio locale

### Opzione 1: server locale
```bash
cd /home/marcom/perFABIANA
python3 -m http.server 8000
```

Poi apri:
```text
http://localhost:8000
```

### Opzione 2: apertura diretta
Puoi aprire anche il file HTML direttamente nel browser, ma il server locale è consigliato per evitare comportamenti incoerenti con cache e service worker.

## Installazione su iPhone
1. Apri la pagina in Safari.
2. Tocca il pulsante con l’icona di condivisione.
3. Seleziona "Aggiungi alla schermata Home".
4. Avvia l’app come una web app installata.

## Dati e export
- I dati sono salvati nel browser tramite localStorage.
- Il file JSON esporta tutto lo stato dell’app, inclusi tutti gli studenti e i loro dati.
- Il file CSV esporta solo i giri dello studente attivo/selezionato.
- Per forzare un refresh completo dell’app è disponibile il pulsante "Aggiorna app".

## Note
Questa è una web app installabile, non un’app nativa iOS. È una soluzione pratica per uso veloce in campo, senza bisogno di Apple Developer Program o distribuzione tramite App Store.
