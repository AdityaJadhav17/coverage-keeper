import type { DeadlineStatus } from "@/lib/deadline";
import type { LetterExtraction } from "@/lib/schema";
import type { StateCode } from "@/lib/states";

export type Locale = "en" | "es";

// Spanish needs review by a fluent speaker before release (#16).
const en = {
  switchTo: "Español",
  switchLang: "es" as Locale,

  welcomeTitle: "Got a letter about your health coverage?",
  welcomeLead:
    "Take a photo. In about a minute you'll know what it asks for, when it's due, and what to send.",
  howItWorks: "How it works",
  steps: ["Photo", "What it means", "What to send"],
  beforeYouStart: "Before you start",
  facts: [
    "We don't save your photo. An AI service reads it for us.",
    "You decide what to send. We never contact the state for you.",
    "Free and independent. Not run by any state agency.",
    "Not legal advice. Only your state decides your coverage.",
  ],
  start: "Start with my letter",
  effort: "About a minute · No sign-up · Free",
  promiseLead: "Rather talk to a person?",
  promise: "Call the number on your letter. We show it on every screen.",

  captureTitle: "Photograph your letter",
  captureLead:
    "Lay each page flat near a window or lamp, and get all four corners in the frame.",
  scan: "Scan my letter",
  rejectTooLarge:
    "That photo is too large. Please take a new photo of your letter.",
  cantOpen: "This phone couldn't open that photo. Take a new one.",
  choose: "Choose photos or a PDF",
  chooseFolder: "Choose a folder",
  dropHere: "Drag your letter here",
  dropHint: "or click to choose files",
  pageN: (n: number) => `Page ${n}`,
  remove: "Remove",
  removePage: (n: number) => `Remove page ${n}`,
  addPage: "Add another page",
  // null: a PDF, whose page count we don't know.
  readPages: (n: number | null) =>
    n === null
      ? "Read my letter"
      : `Read my letter (${n} ${n === 1 ? "page" : "pages"})`,
  collectErrors: {
    onePdf: "Choose one PDF at a time.",
    pdfAndPhotos: "Use photos or one PDF, not both.",
    notPhotos:
      "That file isn't a photo or a PDF. Please pick a photo or PDF of your letter.",
    empty: "No files were found. Pick photos or a PDF of your letter.",
  } as Record<"onePdf" | "pdfAndPhotos" | "notPhotos" | "empty", string>,
  skipped: (n: number) =>
    `Skipped ${n} ${n === 1 ? "file" : "files"}. We read up to 10 photos or one PDF.`,
  pdfTooBig: "This PDF is too big. Take photos of each page instead.",
  pagesTooBig:
    "These pages are too big to send together. Remove a page, or take the photos from a little farther back.",
  badFile:
    "We couldn't open one of these files. Use photos or a PDF of your letter.",
  fromPage: (n: number) => `From page ${n}`,

  reading: "Reading your letter. This can take up to 30 seconds.",
  offlineTitle: "No connection. Your photo wasn't sent.",
  offlineText: "Check your signal or Wi-Fi, then try again.",
  errorTitle: "We couldn't finish reading your letter",
  errorTooBig:
    "That photo is too big to send. Take a new one from a little farther back.",
  errorService:
    "The reading service didn't answer. Your photo is still here, so you can try again.",
  tryAgain: "Try again",

  unclearTitle: "We couldn't read this clearly",
  unclearLead: "A new photo usually fixes it:",
  unclearTips: [
    "Turn on a light or move closer to a window.",
    "Lay the letter on a flat surface.",
    "Hold the phone straight above the page so it fills the frame.",
  ],
  newPhoto: "Take a new photo",

  notMedicaidTitle: "This doesn't look like a Medicaid letter",
  notMedicaidText: (phone: string) =>
    `If it came from your state's Medicaid program, call ${phone} and they can tell you what it means.`,
  resultTitle: "Here's what your letter says",
  askTitle: "What the letter asks you to do",
  papersTitle: "Papers to send",
  notSure: "Not sure. Check the letter or call.",
  checkExemptions: "Check exemptions",
  readAgain: "Read again in English",
  scanAnother: "Scan another letter",
  noticeLabels: {
    work_requirement_info: "Work rules information",
    work_requirement_verification: "Proof of work or activities",
    renewal: "Renewal",
    request_for_information: "Request for information",
    coverage_ending: "Coverage ending",
    approval_or_change: "Approval or change",
    other_medicaid: "Medicaid letter",
    not_medicaid: "Not a Medicaid letter",
  } as Record<LetterExtraction["notice_type"], string>,

  dueDate: "Due date",
  badge: (status: DeadlineStatus, days: number | null) =>
    status === "upcoming"
      ? `${days} ${days === 1 ? "day" : "days"} left`
      : status === "today"
        ? "Due today"
        : status === "passed"
          ? "Date has passed. Call now."
          : "Not sure of the date. Check the letter.",
  confirmDeadline: (phone: string) => `Call ${phone} to confirm your deadline.`,
  reapply: (phone: string) =>
    `Call ${phone} today to ask how to get your coverage back.`,
  source: (agency: string) => `Source: ${agency}`,
  checked: (date: string) => `, checked ${date}`,
  stale: "Rules may have changed.",
  letterNumber: "the number on your letter",

  stateLabel: "State that sent this letter",
  stateChoose: "Choose a state",
  stateNames: {
    WA: "Washington",
    OR: "Oregon",
    CA: "California",
    NV: "Nevada",
    AZ: "Arizona",
  } as Record<StateCode, string>,
  stateOther: "Another state",
  otherNote:
    "This check covers Washington, Oregon, California, Nevada and Arizona. For another state, call the number on your letter and ask about exemptions.",
  pendingText: (state: string, program: string, phone: string) =>
    `${state} hasn't published its list of exemptions yet. Call ${program} at ${phone} to ask whether one applies to you.`,

  screeningTitle: "Exemption questions",
  screeningLead: (program: string, agency: string) =>
    `Some ${program} members don't have to meet the work rule. These questions follow the list from the ${agency}. Skip any you'd rather not answer.`,
  yes: "Yes",
  no: "No",
  seeWhatMayApply: "See what may apply",
  askAboutTitle: "Exemptions to ask about",
  mayApply: (program: string) =>
    `This may apply to you. Ask ${program} about it.`,
  waysTitle: "Ways to meet the work rule",
  waysLead: "You can meet the rule with one of these:",
  back: "Back",

  draftOpen: "Draft a note to my doctor",
  draftLabel: "Note to your doctor. Edit it before you send it.",
  draftInEnglish: "",
  copy: "Copy",
  copied: "Copied",
  copyFailed: "Couldn't copy. Press and hold the text to copy it.",
  share: "Share",

  questions: "Questions? Call",
};

export type Messages = typeof en;

const es: Messages = {
  switchTo: "English",
  switchLang: "en",

  welcomeTitle: "¿Recibió una carta sobre su cobertura de salud?",
  welcomeLead:
    "Tome una foto. En un minuto sabrá qué le pide la carta, para cuándo y qué tiene que enviar.",
  howItWorks: "Cómo funciona",
  steps: ["Foto", "Qué significa", "Qué enviar"],
  beforeYouStart: "Antes de empezar",
  facts: [
    "No guardamos su foto. Un servicio de IA la lee por nosotros.",
    "Usted decide qué enviar. Nunca nos comunicamos con el estado por usted.",
    "Gratis e independiente. No lo maneja ninguna agencia del estado.",
    "No es asesoría legal. Solo su estado decide sobre su cobertura.",
  ],
  start: "Empezar con mi carta",
  effort: "Un minuto · Sin registrarse · Gratis",
  promiseLead: "¿Prefiere hablar con una persona?",
  promise:
    "Llame al número que aparece en su carta. Lo mostramos en todas las pantallas.",

  captureTitle: "Tome fotos de su carta",
  captureLead:
    "Ponga cada página sobre una superficie plana, cerca de una ventana o lámpara, y que se vean las cuatro esquinas.",
  scan: "Escanear mi carta",
  rejectTooLarge:
    "Esa foto es demasiado grande. Tome una foto nueva de su carta, por favor.",
  cantOpen: "Este teléfono no pudo abrir esa foto. Tome otra.",
  choose: "Elegir fotos o un PDF",
  chooseFolder: "Elegir una carpeta",
  dropHere: "Arrastre su carta aquí",
  dropHint: "o haga clic para elegir archivos",
  pageN: (n) => `Página ${n}`,
  remove: "Quitar",
  removePage: (n) => `Quitar la página ${n}`,
  addPage: "Agregar otra página",
  readPages: (n) =>
    n === null
      ? "Leer mi carta"
      : `Leer mi carta (${n} ${n === 1 ? "página" : "páginas"})`,
  collectErrors: {
    onePdf: "Elija un solo PDF a la vez.",
    pdfAndPhotos: "Use fotos o un solo PDF, no ambos.",
    notPhotos:
      "Ese archivo no es una foto ni un PDF. Elija una foto o un PDF de su carta, por favor.",
    empty: "No encontramos archivos. Elija fotos o un PDF de su carta.",
  },
  skipped: (n) =>
    n === 1
      ? "Se omitió 1 archivo. Leemos hasta 10 fotos o un solo PDF."
      : `Se omitieron ${n} archivos. Leemos hasta 10 fotos o un solo PDF.`,
  pdfTooBig: "Este PDF es demasiado grande. Tome fotos de cada página.",
  pagesTooBig:
    "Estas páginas son demasiado grandes para enviarlas juntas. Quite una página o tome las fotos desde un poco más lejos.",
  badFile:
    "No pudimos abrir uno de estos archivos. Use fotos o un PDF de su carta.",
  fromPage: (n) => `De la página ${n}`,

  reading: "Leyendo su carta. Puede tardar hasta 30 segundos.",
  offlineTitle: "Sin conexión. Su foto no se envió.",
  offlineText: "Revise su señal o el wifi y vuelva a intentarlo.",
  errorTitle: "No pudimos terminar de leer su carta",
  errorTooBig:
    "Esa foto es demasiado grande para enviarla. Tome otra un poco más de lejos.",
  errorService:
    "El servicio de lectura no respondió. Su foto sigue aquí, así que puede volver a intentarlo.",
  tryAgain: "Intentar de nuevo",

  unclearTitle: "No pudimos leer esto con claridad",
  unclearLead: "Una foto nueva casi siempre lo soluciona:",
  unclearTips: [
    "Encienda una luz o acérquese a una ventana.",
    "Ponga la carta sobre una superficie plana.",
    "Sostenga el teléfono derecho sobre la página para que la llene.",
  ],
  newPhoto: "Tomar una foto nueva",

  notMedicaidTitle: "Esto no parece una carta de Medicaid",
  notMedicaidText: (phone: string) =>
    `Si la envió el programa de Medicaid de su estado, llame al ${phone} y le explicarán qué significa.`,
  resultTitle: "Esto es lo que dice su carta",
  askTitle: "Lo que la carta le pide",
  papersTitle: "Documentos para enviar",
  notSure: "No estamos seguros. Revise la carta o llame.",
  checkExemptions: "Revisar exenciones",
  readAgain: "Leer de nuevo en español",
  scanAnother: "Escanear otra carta",
  noticeLabels: {
    work_requirement_info: "Información sobre las reglas de trabajo",
    work_requirement_verification: "Prueba de trabajo o actividades",
    renewal: "Renovación",
    request_for_information: "Solicitud de información",
    coverage_ending: "Fin de la cobertura",
    approval_or_change: "Aprobación o cambio",
    other_medicaid: "Carta de Medicaid",
    not_medicaid: "No es una carta de Medicaid",
  },

  dueDate: "Fecha límite",
  badge: (status, days) =>
    status === "upcoming"
      ? days === 1
        ? "Queda 1 día"
        : `Quedan ${days} días`
      : status === "today"
        ? "Vence hoy"
        : status === "passed"
          ? "La fecha ya pasó. Llame ahora."
          : "No sabemos la fecha. Revise la carta.",
  confirmDeadline: (phone) =>
    `Llame al ${phone} para confirmar su fecha límite.`,
  reapply: (phone) =>
    `Llame al ${phone} hoy para preguntar cómo recuperar su cobertura.`,
  source: (agency) => `Fuente: ${agency}`,
  checked: (date) => `, revisado el ${date}`,
  stale: "Las reglas pueden haber cambiado.",
  letterNumber: "número que aparece en su carta",

  stateLabel: "Estado que envió la carta",
  stateChoose: "Elija un estado",
  stateNames: {
    WA: "Washington",
    OR: "Oregón",
    CA: "California",
    NV: "Nevada",
    AZ: "Arizona",
  },
  stateOther: "Otro estado",
  otherNote:
    "Esta revisión cubre Washington, Oregón, California, Nevada y Arizona. Si su carta es de otro estado, llame al número que aparece en su carta y pregunte por las exenciones.",
  pendingText: (state, program, phone) =>
    `${state} todavía no ha publicado su lista de exenciones. Llame a ${program} al ${phone} para preguntar si alguna le aplica.`,

  screeningTitle: "Preguntas sobre exenciones",
  screeningLead: (program, agency) =>
    `Algunos miembros de ${program} no tienen que cumplir la regla de trabajo. Estas preguntas siguen la lista de ${agency}. Puede saltarse las que prefiera no contestar.`,
  yes: "Sí",
  no: "No",
  seeWhatMayApply: "Ver qué podría aplicarle",
  askAboutTitle: "Exenciones que puede consultar",
  mayApply: (program) => `Esto podría aplicarle. Pregunte a ${program}.`,
  waysTitle: "Formas de cumplir la regla de trabajo",
  waysLead: "Puede cumplir la regla con una de estas opciones:",
  back: "Atrás",

  draftOpen: "Escribir una nota para mi médico",
  draftLabel: "Nota para su médico. Revísela antes de enviarla.",
  draftInEnglish: "La nota está en inglés para que su médico la pueda leer.",
  copy: "Copiar",
  copied: "Copiado",
  copyFailed: "No se pudo copiar. Mantenga presionado el texto para copiarlo.",
  share: "Compartir",

  questions: "¿Preguntas? Llame al",
};

export const messages: Record<Locale, Messages> = { en, es };

export function pickLocale(navigatorLanguage: string | undefined): Locale {
  return navigatorLanguage?.toLowerCase().startsWith("es") ? "es" : "en";
}
