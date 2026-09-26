# Give & Put

https://arsdashok.github.io/games/give-and-put/

Separate game; Town Trips is unchanged. Uses its character art and its patient
speech controller. Speak allows pauses, Stop keeps the draft, Go checks and runs
the complete instruction. No speech synthesis, audio storage or API key.

12 objects: ruler, bag, pen, pencil, book, cake, banana, water, trousers, boots,
teddy bear, pickaxe. Give to Timmy, Goose or Creeper; put on the bed, table, chair
or bag, or in the bag. Objects persist and move between destinations. Reset
cancels an animation and clears the scene. Words in the sidebar only build a
sentence; they cannot bypass grammar checks.

The parser uses the requested teaching structures, not general-purpose English
understanding. Singular objects need a/the. Water and plural nouns accept
some/the or bare forms; trousers/boots also accept a pair of. Shoes and pants are
recognised as alternatives. Incorrect word order, missing prepositions and
missing singular articles do not move anything. An object cannot go into itself.

Tests: `node give-and-put/checks.mjs`; shared speech tests:
`node town-trips/checks.mjs`. Live microphone recognition requires a browser
microphone check; automated tests use simulated speech events.

Artwork: `assets/objects.png` is a built-in ImageGen sprite atlas. See ASSETS.md
for the complete prompt. Existing character images remain unchanged.
