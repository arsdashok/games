# Town Trips

https://arsdashok.github.io/games/town-trips/

Say a whole sentence with Speak, then press Go when ready. Pauses are allowed:
recognition is continuous, and browser-ended sessions restart while listening is
active. There is no app-imposed time limit. Stop preserves the draft without
starting a journey. Go waits briefly for any final speech result before checking
the sentence. Editing, resetting, hiding or leaving the page stops listening.

Use the teaching pattern **who → action → where → how**:
- Timmy goes to the swimming pool by bus.
- Goose walks to school.
- Creeper goes home by train.

Alternative word order is deliberately not accepted in this exercise. No grammar
errors are silently repaired. Incomplete and invalid commands never start a trip.

Voice uses the browser's SpeechRecognition service and may require an internet
connection. The app does not save audio or sentences. Browser support varies;
typing remains available. Live audio has not been tested by the automated checks.

Run `node town-trips/checks.mjs` from the repository root. The checks simulate
speech events and silence; they do not record microphone audio.

Goose and Timmy are taken from the owner's reference image. Other character and
transport images come from the owner's lesson assets. Place illustrations were
generated for this activity. No API keys, backend or external paid services are
required by the app.

API reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/continuous
and https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/end_event
