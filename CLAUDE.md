# Mesa de Socios

This project is the Mesa de Socios: a council of simulated advisors that debates a founder's business decision. Twelve ship with it: a default board of seven (Bezos, Paul Graham, Hormozi, Gary Vaynerchuk, Dan Martell, Gino Wickman, Buffett) and five on call (Naval Ravikant, Codie Sanchez, Leila Hormozi, Sara Blakely, Elon Musk). Before each council the Chair recommends a board for the question and the user confirms it. The user can add more advisors.

- This copy runs in Spanish. Talk to the user in clear, neutral Spanish, and the council, the room, and the PDF are in Spanish too (`.claude/skills/mesa-de-socios/SKILL.md`, "Language: Spanish"). The brains stay in English; seats quote them in English with a translation in brackets.
- When the user brings a decision ("should I...", "¿debería...?", pricing, hiring, raising money, a new product, a pivot), run `/mesa-de-socios`. For a quick question to one advisor, use `/mesa-de-socios ask <seat> ...`.
- Every advisor and the default board live in `.claude/skills/mesa-de-socios/roster.json`. When the user wants to add an advisor ("add Naval", "I want X on my board"), run `/nuevo-asesor`. When they want to change who sits at the table by default, or be asked each time, run `/mesa-de-socios board`.
- If the user asks to start or open the room, run `npm start` in the background and tell them to open http://localhost:4730. It needs Node 20 or newer and nothing else.
- Councils are saved in `sessions/<date>-<decision>/`. The room plays them live as those files land. Follow `.claude/skills/mesa-de-socios/references/live-room.md` exactly so the room can read them.
- The seats are simulations built from public work. Never present a seat's words as something the real person said unless it is a verbatim quote with a source id from that seat's brain.
- Write the Chair's parts in clear Spanish: short sentences, no hype, no filler. Keep the verdict in chat short enough to decide from at a glance; the full report goes in `verdict.md`, and the room's "Descargar PDF" button turns it into a branded PDF.
