# Privacy notice (draft)

> **Draft for review. Not published.** Every fact below matches the code on `main` as of 2026-11-06. Before this goes live as a page in the app:
>
> 1. Fill every `[BLANK: …]`.
> 2. Get a lawyer or pro bono clinic to review it, especially the Washington and Nevada sections (see [launch-readiness.md](../launch-readiness.md#4-legal-pages)).
> 3. Get a fluent Spanish speaker to review the Spanish version.
> 4. Re-check Anthropic's retention terms (linked at the end); they changed wording in 2026.
>
> Blanks: operator name, contact email, mailing address, effective date, and whether the production Anthropic organization has zero data retention (ZDR).

---

## English

**Coverage Keeper privacy notice**

Effective date: [BLANK: date]

Coverage Keeper is a free tool run by [BLANK: organization name]. It helps you understand a letter about your Medicaid coverage. It is not a government agency, and it does not decide whether you qualify for coverage. Only your state can do that.

### The short version

- We don't save your letter, your photos or the results.
- We don't use cookies, and we don't sell or share your information.
- To read your letter, we send it to an AI service (Anthropic). It doesn't use your letter to train its models.
- Your answers to the exemption questions, and any note to your doctor, stay on your phone or computer.

### What happens to your letter

1. You take photos of your letter, or choose a PDF.
2. Your device makes the photos smaller. Then it sends them to our server, with the language you chose (English or Spanish).
3. Our server checks the files and passes them to Anthropic, the company that runs the AI model that reads the letter. Anthropic sends back a summary: the type of letter, the deadline, what it asks you to do, the papers to send, the phone number to call, and which state sent it.
4. Our server checks the summary for statements about whether you qualify, then sends it back to your device.
5. Our server doesn't save your files or the summary. They exist only while the request is being handled.

The summary stays on your screen only until you close or reload the page. If you switch languages, your device sends the same photos again, so the letter can be read in the new language.

### What stays on your device

These never leave your phone or computer:

- your answers to the exemption questions
- the state you choose
- the note to your doctor, unless you copy or share it yourself

### What our server records

For each read, our server writes a short log line with:

- the time
- whether it worked (the status code)
- how long it took
- the AI model and prompt version
- the language you chose
- the number of pages
- whether a statement was blocked

The log line does not include your photos, the text of your letter, the summary, your name, your case number or your IP address.

To stop one person from sending too many requests, our server keeps your IP address in its memory while it counts your reads over one minute. After that minute, it is removed the next time anyone uses the service, or when the server shuts down. It is never written to a log or saved anywhere.

### Companies that process your information

**Anthropic** reads your letter. According to Anthropic's published terms:

- It does not use your letter to train its models.
- It may keep what we send and what it returns for up to 30 days, then deletes it. [BLANK: if the production organization has zero data retention, replace this with: "Anthropic does not keep what we send after it answers."]
- Content flagged by its safety systems may be kept for up to 2 years, and it may keep data where the law requires.

**Vercel** hosts this website. Your photos pass through Vercel's servers on their way to Anthropic. We don't ask Vercel to store them. Vercel also gives us page-view counts (Vercel Web Analytics), without cookies. For each page view this can include:

- the time
- the page address
- the site you came from
- your general location (country, region and city)
- your browser, operating system and type of device

Vercel identifies a visit using a code that it deletes after 24 hours. Every screen in the app has the same address, so these counts never show what your letter says or what result you got.

We use no other companies to process your information. We don't show ads.

### Your choices

- You don't have to use Coverage Keeper. You can always call the phone number on your letter instead.
- You can skip any exemption question.
- You can leave at any time. Closing the page removes the results from your screen.

Because we don't keep your letter or results, we have nothing to show you, correct or delete later. Anthropic's copy, if any, is deleted on the schedule above.

### Washington residents

[BLANK: Lawyer review. Washington's My Health My Data Act may treat a Medicaid letter as consumer health data. Confirm whether this notice can serve as the required consumer health data privacy policy, whether the consent screen is enough, and how a person can make a request (for example, to confirm or delete data, or withdraw consent) given that we keep nothing.]

### Nevada residents

[BLANK: Lawyer review. Nevada has a similar consumer health data law. Confirm what it requires.]

### Children

Coverage Keeper is meant for adults reading their own letters, or helping a family member with theirs.

### Changes to this notice

If we change how we handle your information, we will update this notice and its effective date before the change takes effect.

### Contact us

[BLANK: organization name]
Email: [BLANK: email]
Mail: [BLANK: mailing address]

Please don't send us photos of your letter. For questions about your coverage, call the phone number on your letter.

---

## Español

**Aviso de privacidad de Coverage Keeper**

Fecha de entrada en vigor: [BLANK: fecha]

Coverage Keeper es una herramienta gratuita de [BLANK: nombre de la organización]. Le ayuda a entender una carta sobre su cobertura de Medicaid. No es una agencia del gobierno y no decide si usted califica para la cobertura. Solo su estado puede hacerlo.

### En resumen

- No guardamos su carta, sus fotos ni los resultados.
- No usamos cookies y no vendemos ni compartimos su información.
- Para leer su carta, la enviamos a un servicio de IA (Anthropic). Ese servicio no usa su carta para entrenar sus modelos.
- Sus respuestas a las preguntas sobre exenciones, y cualquier nota para su médico, se quedan en su teléfono o computadora.

### Qué pasa con su carta

1. Usted toma fotos de su carta o elige un PDF.
2. Su dispositivo hace las fotos más pequeñas. Luego las envía a nuestro servidor, junto con el idioma que eligió (inglés o español).
3. Nuestro servidor revisa los archivos y los pasa a Anthropic, la empresa que opera el modelo de IA que lee la carta. Anthropic devuelve un resumen: el tipo de carta, la fecha límite, lo que le pide hacer, los documentos que debe enviar, el número al que debe llamar y el estado que la envió.
4. Nuestro servidor revisa que el resumen no diga si usted califica y luego lo envía a su dispositivo.
5. Nuestro servidor no guarda sus archivos ni el resumen. Solo existen mientras se atiende su solicitud.

El resumen se queda en su pantalla solo hasta que usted cierre o vuelva a cargar la página. Si cambia de idioma, su dispositivo envía las mismas fotos otra vez para leer la carta en el nuevo idioma.

### Lo que se queda en su dispositivo

Esto nunca sale de su teléfono o computadora:

- sus respuestas a las preguntas sobre exenciones
- el estado que usted elige
- la nota para su médico, a menos que usted mismo la copie o la comparta

### Lo que registra nuestro servidor

Por cada lectura, nuestro servidor escribe una línea breve con:

- la hora
- si funcionó (el código de estado)
- cuánto tardó
- el modelo de IA y la versión de las instrucciones
- el idioma que eligió
- el número de páginas
- si se bloqueó alguna afirmación

Esa línea no incluye sus fotos, el texto de su carta, el resumen, su nombre, su número de caso ni su dirección IP.

Para evitar que una persona envíe demasiadas solicitudes, nuestro servidor guarda su dirección IP en su memoria mientras cuenta sus lecturas durante un minuto. Después de ese minuto, se elimina la próxima vez que alguien use el servicio, o cuando el servidor se apague. Nunca se escribe en ningún registro ni se guarda en ningún lugar.

### Empresas que procesan su información

**Anthropic** lee su carta. Según los términos publicados por Anthropic:

- No usa su carta para entrenar sus modelos.
- Puede guardar lo que enviamos y lo que devuelve hasta por 30 días y luego lo elimina. [BLANK: si la organización de producción tiene retención cero de datos, reemplazar con: "Anthropic no guarda lo que enviamos después de responder."]
- El contenido que marcan sus sistemas de seguridad puede guardarse hasta 2 años, y puede guardar datos cuando la ley lo exige.

**Vercel** aloja este sitio web. Sus fotos pasan por los servidores de Vercel camino a Anthropic. No le pedimos a Vercel que las guarde. Vercel también nos da conteos de visitas (Vercel Web Analytics), sin cookies. Por cada visita esto puede incluir:

- la hora
- la dirección de la página
- el sitio del que llegó
- su ubicación general (país, región y ciudad)
- su navegador, sistema operativo y tipo de dispositivo

Vercel identifica una visita con un código que elimina después de 24 horas. Todas las pantallas de la aplicación tienen la misma dirección, así que estos conteos nunca muestran lo que dice su carta ni el resultado que recibió.

No usamos otras empresas para procesar su información. No mostramos anuncios.

### Sus opciones

- No tiene que usar Coverage Keeper. Siempre puede llamar al número que aparece en su carta.
- Puede saltarse cualquier pregunta sobre exenciones.
- Puede salir en cualquier momento. Al cerrar la página, los resultados desaparecen de su pantalla.

Como no guardamos su carta ni sus resultados, después no tenemos nada que mostrarle, corregir ni eliminar. La copia de Anthropic, si existe, se elimina según el plazo indicado arriba.

### Residentes de Washington

[BLANK: Revisión legal. Ver la nota de la versión en inglés.]

### Residentes de Nevada

[BLANK: Revisión legal. Ver la nota de la versión en inglés.]

### Menores

Coverage Keeper es para adultos que leen sus propias cartas o que ayudan a un familiar con las suyas.

### Cambios a este aviso

Si cambiamos la forma en que manejamos su información, actualizaremos este aviso y su fecha de entrada en vigor antes de que el cambio aplique.

### Contáctenos

[BLANK: nombre de la organización]
Correo electrónico: [BLANK: correo]
Correo postal: [BLANK: dirección]

Por favor, no nos envíe fotos de su carta. Si tiene preguntas sobre su cobertura, llame al número que aparece en su carta.

---

## Sources for each fact

| Statement                                                                        | Where it comes from                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nothing saved; results only on screen                                            | ADR-0004; `src/app/page.tsx` keeps results in React state; no `localStorage`, `sessionStorage`, IndexedDB or cookies in `src/`                                                                                                                                                                                                                                             |
| Only the files and language are sent                                             | `src/app/page.tsx`, the single `fetch("/api/read")`                                                                                                                                                                                                                                                                                                                        |
| Screening answers, chosen state and doctor note stay on the device               | `Screening.tsx`, `StatePicker.tsx` and `DoctorDraft.tsx` make no network calls                                                                                                                                                                                                                                                                                             |
| Log fields                                                                       | `log(...)` calls in `src/app/api/read/route.ts`                                                                                                                                                                                                                                                                                                                            |
| IP held only for the one-minute rate-limit count, not logged                     | `createRateLimiter({ max: 10, windowMs: 60_000 })` in `route.ts`, keyed by `x-forwarded-for`; expired keys are swept at least once per window (`src/lib/rate-limit.ts`, tested); IP isn't passed to `log`                                                                                                                                                                  |
| Guardrail checks every string                                                    | `enforceGuardrail` in `route.ts` (ADR-0005)                                                                                                                                                                                                                                                                                                                                |
| Anthropic: no training, up to 30 days, flagged content up to 2 years, ZDR option | [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention), [Is my data used for model training?](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training), [How long do you store my organization's data?](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) |
| Vercel Web Analytics fields, no cookies, 24-hour visitor hash                    | [Web Analytics privacy and compliance](https://vercel.com/docs/analytics/privacy-policy)                                                                                                                                                                                                                                                                                   |
| Every screen is at `/`                                                           | the app has one page route; `src/app/page.tsx` switches views in state                                                                                                                                                                                                                                                                                                     |
