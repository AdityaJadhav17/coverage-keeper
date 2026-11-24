# Consumer health data privacy policy (draft)

> **Draft for review. Not published.** One policy written to meet both Washington ([RCW 19.373.020](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.020)) and Nevada ([NRS 603A.495](https://www.leg.state.nv.us/NRS/NRS-603A.html)). The [checklist](checklist.md#consumer-health-data-privacy-policy) keeps it separate from the [privacy notice](privacy-notice.md). Every fact matches the code on `main` as of 2026-11-23. Before it goes live:
>
> 1. Fill every `[BLANK: …]`.
> 2. Get a lawyer or pro bono clinic to review it. Open points are in [questions-for-counsel.md](questions-for-counsel.md#a-launch-blocking), especially whether sending a letter to Anthropic is "sharing" under Nevada law (question 7) and whether consent is needed before upload (questions 1 and 2).
> 3. Get a fluent Spanish speaker to review the Spanish version.
> 4. Link it from the home screen and every screen that collects data, as its own link, apart from the privacy notice (WA .020(1)(b), NV 603A.495(2); issue #51).
>
> The table at the end maps each section to the item of each law it answers.

---

## English

**Coverage Keeper consumer health data privacy policy**

Effective date: [BLANK: date]

This policy explains how Coverage Keeper, run by [BLANK: organization name], handles consumer health data. It applies to people in Washington and Nevada, and we follow it for everyone. Our [privacy notice](privacy-notice.md) covers everything else.

### 1. The health data we collect, and how we use it

A Medicaid letter can contain health data. When you photograph or upload your letter, we receive whatever is printed on it. That can include:

- your Medicaid coverage, program and member or case number
- a health condition, disability or medical exemption the letter mentions
- information about pregnancy, treatment or care the letter mentions

We use it for one thing only: to read your letter and show you what it asks for, when it is due and who to call. We don't use it for ads, we don't build a profile of you, and we don't sell it.

Your answers to the exemption questions (for example, whether you have a health condition) and any note to your doctor stay on your phone or computer. We never receive them.

### 2. Where the data comes from

Only from you: the photos or PDF of the letter you choose to send. We don't get health data about you from anyone else.

### 3. How the data is processed

1. Your device makes the photos smaller and sends them, with the language you chose, to our server.
2. Our server passes them to Anthropic, whose AI model reads the letter and returns a short summary.
3. Our server checks the summary for statements we never make (for example, whether you qualify, or medical or legal advice), then sends it back to your device.
4. Our server does not save your photos, your letter or the summary. They exist only while your request is being handled. The summary stays on your screen until you close or reload the page.

### 4. The health data that leaves Coverage Keeper, and who gets it

To read your letter, we send the photos or PDF of your letter, and receive the summary, through these companies. We send it to no one else, and we have no affiliates.

| Company   | What it does                             | What it receives                                                                                                                                                                                                                                                                                       |
| --------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Anthropic | Runs the AI model that reads your letter | Your photos or PDF and the summary it writes. It does not use them to train its models. It may keep them for up to 30 days, and content its safety systems flag for up to 2 years. [BLANK: if the production organization has zero data retention, say that Anthropic keeps nothing after it answers.] |
| Vercel    | Hosts the website                        | Your photos pass through its servers on the way to Anthropic. We don't ask it to store them.                                                                                                                                                                                                           |

### 5. Your rights, and how to use them

You can ask us to:

- confirm whether we collect, share or sell your consumer health data, and see it
- list the companies we shared it with
- delete it
- stop collecting or sharing it (withdraw consent)

Email [BLANK: email] with your request. You don't need an account, and we won't ask for your letter. We answer within 45 days; if we need more time, we tell you, and take at most 45 more days. When you ask us to delete your data, we delete it within 30 days and tell Anthropic to delete its copy.

Because we don't keep your letter or the summary, we will usually have nothing to show or delete. We still answer every request and pass every deletion request to Anthropic.

If we turn down your request, you can appeal: [BLANK: how to appeal]. If we turn down your appeal, we will tell you how to contact the Washington State Attorney General or the Nevada Attorney General.

### 6. Reviewing or changing your data

We don't keep any of your health data, so there is nothing to review or correct later. If you think something on your screen is wrong, read your letter again or call the number on it.

### 7. Tracking across websites

No other company can collect your health data over time or across other websites through Coverage Keeper. We use no cookies, ads or third-party trackers. Vercel counts page views without cookies, and every screen has the same address, so the counts never show what your letter says.

### 8. Changes to this policy

Before we change how we handle consumer health data, we will post the new policy here with a new effective date, and show a notice on the welcome screen. We will not collect, use or share health data in a new way, or with a new company, without first telling you and getting your consent.

### 9. Contact us

[BLANK: organization name]
Email: [BLANK: email]
Mail: [BLANK: mailing address]

Please don't send us photos of your letter. For questions about your coverage, call the phone number on your letter.

---

## Español

**Política de privacidad de datos de salud del consumidor de Coverage Keeper**

Fecha de entrada en vigor: [BLANK: fecha]

Esta política explica cómo Coverage Keeper, de [BLANK: nombre de la organización], maneja los datos de salud del consumidor. Aplica a las personas de Washington y Nevada, y la seguimos con todos. Nuestro [aviso de privacidad](privacy-notice.md#español) cubre todo lo demás.

### 1. Los datos de salud que recibimos y cómo los usamos

Una carta de Medicaid puede contener datos de salud. Cuando usted toma una foto de su carta o la sube, recibimos lo que esté impreso en ella. Eso puede incluir:

- su cobertura de Medicaid, su programa y su número de miembro o de caso
- una condición de salud, discapacidad o exención médica que mencione la carta
- información sobre embarazo, tratamiento o atención que mencione la carta

Los usamos para una sola cosa: leer su carta y mostrarle lo que pide, cuándo vence y a quién llamar. No los usamos para anuncios, no creamos un perfil suyo y no los vendemos.

Sus respuestas a las preguntas sobre exenciones (por ejemplo, si tiene una condición de salud) y cualquier nota para su médico se quedan en su teléfono o computadora. Nunca las recibimos.

### 2. De dónde vienen los datos

Solo de usted: las fotos o el PDF de la carta que usted decide enviar. No recibimos datos de salud suyos de nadie más.

### 3. Cómo se procesan los datos

1. Su dispositivo hace las fotos más pequeñas y las envía a nuestro servidor, junto con el idioma que eligió.
2. Nuestro servidor las pasa a Anthropic, cuyo modelo de IA lee la carta y devuelve un resumen breve.
3. Nuestro servidor revisa que el resumen no diga cosas que nunca decimos (por ejemplo, si usted califica, o consejos médicos o legales) y luego lo envía a su dispositivo.
4. Nuestro servidor no guarda sus fotos, su carta ni el resumen. Solo existen mientras se atiende su solicitud. El resumen se queda en su pantalla hasta que usted cierre o vuelva a cargar la página.

### 4. Los datos de salud que salen de Coverage Keeper y quién los recibe

Para leer su carta, enviamos las fotos o el PDF de su carta, y recibimos el resumen, a través de estas empresas. No los enviamos a nadie más y no tenemos empresas afiliadas.

| Empresa   | Qué hace                               | Qué recibe                                                                                                                                                                                                                                                                                                             |
| --------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anthropic | Opera el modelo de IA que lee su carta | Sus fotos o su PDF y el resumen que escribe. No los usa para entrenar sus modelos. Puede guardarlos hasta 30 días, y el contenido que marcan sus sistemas de seguridad hasta 2 años. [BLANK: si la organización de producción tiene retención cero de datos, decir que Anthropic no guarda nada después de responder.] |
| Vercel    | Aloja el sitio web                     | Sus fotos pasan por sus servidores camino a Anthropic. No le pedimos que las guarde.                                                                                                                                                                                                                                   |

### 5. Sus derechos y cómo usarlos

Puede pedirnos que:

- confirmemos si recopilamos, compartimos o vendemos sus datos de salud del consumidor, y se los mostremos
- le demos la lista de empresas con las que los compartimos
- los eliminemos
- dejemos de recopilarlos o compartirlos (retirar su consentimiento)

Escriba a [BLANK: correo] con su solicitud. No necesita una cuenta y no le pediremos su carta. Respondemos en un plazo de 45 días; si necesitamos más tiempo, se lo diremos, y tomaremos como máximo 45 días más. Cuando nos pide eliminar sus datos, los eliminamos en un plazo de 30 días y le pedimos a Anthropic que elimine su copia.

Como no guardamos su carta ni el resumen, normalmente no tendremos nada que mostrar ni eliminar. Aun así, respondemos cada solicitud y enviamos cada solicitud de eliminación a Anthropic.

Si rechazamos su solicitud, puede apelar: [BLANK: cómo apelar]. Si rechazamos su apelación, le diremos cómo comunicarse con la Oficina del Procurador General del Estado de Washington o con el Procurador General de Nevada.

### 6. Revisar o cambiar sus datos

No guardamos ninguno de sus datos de salud, así que después no hay nada que revisar ni corregir. Si cree que algo en su pantalla está mal, vuelva a leer su carta o llame al número que aparece en ella.

### 7. Rastreo en otros sitios web

Ninguna otra empresa puede recopilar sus datos de salud con el tiempo ni en otros sitios web a través de Coverage Keeper. No usamos cookies, anuncios ni rastreadores de terceros. Vercel cuenta las visitas sin cookies, y todas las pantallas tienen la misma dirección, así que esos conteos nunca muestran lo que dice su carta.

### 8. Cambios a esta política

Antes de cambiar la forma en que manejamos los datos de salud del consumidor, publicaremos aquí la nueva política con una nueva fecha de entrada en vigor y mostraremos un aviso en la pantalla de bienvenida. No recopilaremos, usaremos ni compartiremos datos de salud de una forma nueva, ni con una empresa nueva, sin antes decírselo y obtener su consentimiento.

### 9. Contáctenos

[BLANK: nombre de la organización]
Correo electrónico: [BLANK: correo]
Correo postal: [BLANK: dirección]

Por favor, no nos envíe fotos de su carta. Si tiene preguntas sobre su cobertura, llame al número que aparece en su carta.

---

## What each section answers

Statute text checked on the official pages on 2026-11-23.

| Section                        | Washington, RCW 19.373.020(1)(a)                               | Nevada, NRS 603A.495(1)                                                          |
| ------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1. Data collected and use      | (i) categories collected, purpose, how used                    | (a) categories collected and how used; (e) purposes                              |
| 2. Sources                     | (ii) categories of sources                                     | (b) categories of sources                                                        |
| 3. Processing                  | (i) how used                                                   | (f) how processed                                                                |
| 4. Data shared and who gets it | (iii) categories shared; (iv) third parties and affiliates     | (c) categories shared; (d) third parties and affiliates; (e) purposes of sharing |
| 5. Rights                      | (v) how to use the rights in .040                              | (g) how to submit a 603A.505 request                                             |
| 6. Review and changes          |                                                                | (h) process to review and request changes                                        |
| 7. Tracking across websites    |                                                                | (j) third-party collection across sites                                          |
| 8. Changes to this policy      | .020(1)(c), (d): no new categories or purposes without consent | (i) how material changes are announced; 603A.495(3)                              |
| Effective date                 |                                                                | (k) effective date                                                               |

| Fact                                                     | Where it comes from                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Only the files and the language are sent                 | `src/app/page.tsx`, the single `fetch("/api/read")`                                                    |
| Screening answers and the doctor note stay on the device | `Screening.tsx` and `DoctorDraft.tsx` make no network calls                                            |
| Nothing saved by our server                              | ADR-0004; no storage, database, cookies or browser storage in `src/`                                   |
| The summary is checked before it is shown                | `enforceGuardrail` in `src/app/api/read/route.ts` and `src/lib/guardrails.ts` (ADR-0005)               |
| Anthropic: no training, 30 days, flagged up to 2 years   | The Anthropic retention sources listed in [privacy-notice.md](privacy-notice.md#sources-for-each-fact) |
| No cookies; page views only, at one address              | `@vercel/analytics` in `src/app/layout.tsx`; the app has one page route                                |
