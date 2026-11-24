// Phrases that state or deny eligibility. The app may describe what a letter asks for,
// never whether the user qualifies (ADR-0005).
//
// This check fails closed. It also blocks some things a letter rightly says, such as
// "send proof that you are exempt": telling that apart from "we have proof that you are
// eligible" by pattern let real claims through every time it was tried (reviews of
// 2026-11-21). A blocked field is hidden with "check the letter or call", so the cost
// of over-blocking is a missing line, never a wrong one.
//
// Only a question is excused, and only with the word directly before "you":
// "if you qualify", "whether or not you are eligible", "unless you qualify".
const ASKED = String.raw`(?<!\b(?:if|whether|unless)\s(?:or\snot\s)?)`;
// One adverb used to be enough to slip past: "you are no longer eligible".
const SURELY = String.raw`still|now|currently|already|likely|very\slikely|probably|definitely|certainly|clearly|fully|automatically|again|soon|then|always`;
const ADV = String.raw`(?:not|no\slonger|never|${SURELY})`;
const ADVS = String.raw`(?:\s${ADV}){0,2}`;
const STATUS = String.raw`(?:eligible|ineligible|exempt(?:ed)?|approved|qualified|covered|denied|disqualified)`;
const COVERAGE = String.raw`\s(?:your\s)?coverage\b`;

const en = (patterns: string[]) =>
  patterns.map((p) => new RegExp(ASKED + p, "gi"));

const CLAIMS_EN = en([
  String.raw`\byou(?:'re|\sare|\saren't|\sremain)${ADVS}\s${STATUS}\b`,
  String.raw`\byou(?:'ll)?(?:\s(?:do|don't|do\snot|will|will\snot|won't|would|${ADV})){0,3}\squalify\b`,
  String.raw`\byou(?:'ve|\shave)(?:\s${ADV})?\s(?:been\s(?:${ADV}\s)?(?:found\s)?${STATUS}|qualified)\b`,
  String.raw`\byou\s(?:were|got)(?:\s${ADV})?\s(?:found\s)?${STATUS}\b`,
  String.raw`\byou\squalified\b`,
  String.raw`\byou(?:'ve|\shave)?\slost${COVERAGE}`,
  // "show that you meet…" is an instruction and "do you meet…?" a question, not claims.
  String.raw`(?<!\b(?:that|do)\s)\byou\s(?:meet|satisfy)\s(?:all\s)?(?:the\s)?(?:\w+\s)?requirements?\b`,
  // What will happen, good or bad.
  String.raw`\byou(?:'ll|\swill|\swon't)${ADVS}\s(?:be\s)?${STATUS}\b`,
  String.raw`\byou(?:'re|\sare|\saren't)${ADVS}\sgoing\sto\sbe\s${STATUS}\b`,
  String.raw`\byou(?:'re|\sare|\saren't)${ADVS}\s(?:going\sto\s)?(?:keep|lose)${COVERAGE}`,
  String.raw`\byou(?:'ll|\swill)(?:\s(?:${SURELY}))?\skeep${COVERAGE}`,
  String.raw`\byou(?:\swon't|\swill\snot)\slose${COVERAGE}`,
]);

// "You will lose your coverage" alone is a claim. With the reason in the same sentence
// ("If you do not renew by March 1, you will lose your coverage", "Renew by March 1
// or you will lose your coverage") it is the warning the person most needs, so it is
// let through. This excuse covers only these two patterns.
const LOSSES_EN = en([
  String.raw`\byou(?:'ll|\swill)(?:\s(?:${SURELY}))?\s(?:lose|be\slosing)${COVERAGE}`,
  String.raw`\byou(?:\swon't|\swill\snot)\skeep${COVERAGE}`,
]);

// Spanish (US-064). "si (usted) (todavía) califica" and "para saber si su hijo es
// elegible" are questions, not claims.
const ASKED_ES = [
  String.raw`(?<!\bsi\s(?:usted\s|tú\s)?(?:todavía\s|aún\s)?)`,
  String.raw`(?<!\bsi\s(?:su|sus)\s[\p{L}]+\s)`,
].join("");
const STATUS_ES = String.raw`(?:elegible|inelegible|exent[oa]|aprobad[oa]|calificad[oa])`;
const COBERTURA = String.raw`\s(?:su|tu|la)\scobertura\b`;
const SUBJECT = String.raw`(?:usted\s|tú\s)?`;

const es = (patterns: string[]) =>
  patterns.map((p) => new RegExp(ASKED_ES + p, "giu"));

const CLAIMS_ES = es([
  String.raw`\b${SUBJECT}(?:no\s)?(?:es|eres|está|esta|estás|estas)\s(?:(?:ya|todavía|aún|ahora|actualmente)\s)?${STATUS_ES}\b`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:sigue|sigues)\ssiendo\s${STATUS_ES}\b`,
  // Not \b after an accented letter: \b only knows ASCII word characters.
  String.raw`\b${SUBJECT}(?:no\s)?(?:(?:ya|todavía|aún)\s)?(?:califica|calificas|calificó|calificaste|calificará|calificarás)(?![\p{L}\p{N}])`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:(?:ha|has)\ssido|fue|fuiste|quedó|quedaste)\s${STATUS_ES}\b`,
  // "está cubierto" and "fue denegada" also describe services and forms, so these
  // two need the person as the subject.
  String.raw`\b(?:usted|tú)\s(?:no\s)?(?:está|estás)\s(?:(?:ya|todavía|aún|ahora)\s)?cubiert[oa]\b`,
  String.raw`\b(?:usted|tú)\s(?:no\s)?(?:(?:ha|has)\ssido|fue|fuiste)\s(?:denegad[oa]|rechazad[oa])\b`,
  // "demostrar que cumple…" is an instruction and "¿cumple…?" a question, not claims.
  String.raw`(?<!(?:\bque\s|¿)(?:usted\s|tú\s)?)\b${SUBJECT}(?:no\s)?(?:cumple|cumples|reúne|reúnes)\s(?:con\s)?(?:todos\s)?(?:los|el)\srequisitos?\b`,
  // Not "derecho a una audiencia": appeal rights are fine to describe.
  String.raw`\b${SUBJECT}(?:no\s)?tienes?\sderecho\sa\s(?:medicaid|medi-cal|ohp|ahcccs|apple\shealth|(?:la\s|su\s)?cobertura|(?:una\s)?exención|beneficios)`,
  // What will happen, good or bad.
  String.raw`\b${SUBJECT}(?:no\s)?(?:será|serás|quedará|quedarás)\s${STATUS_ES}\b`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:va|vas)\sa\s(?:mantener|conservar)${COBERTURA}`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:va|vas)\sa\sperder\s(?:su|tu)\scobertura\b`,
  String.raw`\b${SUBJECT}(?:no\s)?(?:mantendrá|mantendrás|conservará|conservarás)${COBERTURA}`,
  String.raw`\b${SUBJECT}no\s(?:(?:va|vas)\sa\sperder\sla|perderá\s(?:su|tu|la)|perderás\s(?:su|tu|la))\scobertura\b`,
]);

const LOSSES_ES = es([
  String.raw`(?<!\bno\s)\b${SUBJECT}(?:(?:va|vas)\sa\sperder\sla|perderá\s(?:su|tu|la)|perderás\s(?:su|tu|la))\scobertura\b`,
]);

// A loss is excused only when its condition is something the person does or sends:
// "If you do not renew by March 1, you will lose your coverage". Any "if" was not
// enough: "If you ask me, you will lose your coverage" is a claim (review of #65).
const ACTION =
  /\b(?:renew(?:al|ed|s|ing)?|send|sent|reply|replied|respond|response|return(?:ed|s)?|report(?:ed|s|ing)?|submit(?:ted)?|complete[ds]?|sign(?:ed|s)?|forms?|paperwork|proof|papers?|documents?|information|pay(?:s|ing)?|paid|payment|premium|apply|application|hours|works?|worked|working|deadline|due\sdate|late|provide[ds]?|fill(?:ed)?\sout|turn(?:ed)?\sin|mail(?:ed)?|upload(?:ed)?|verify|review|packet|receive[ds]?|hear\sfrom\syou)\b|(?<![\p{L}])(?:renuev[ae]n?|renovación|renovar|envía|envíe|envie|enviar|envió|responde|responda|responder|respuesta|devuelve|devuelva|devolver|formularios?|reporta|reporte|reportar|informa|informe|completa|complete|completar|firma|firme|firmar|paga|pague|pagar|pago|prima|documentos?|pruebas?|información|horas|trabaj\p{L}*|solicitud|fecha\slímite|tarde|llen[ae]|llenar|mand[ae]|mandar|entreg(?:a|ue)|entregar|present[ae]|presentar|proporcion[ae]|proporcionar|paquete)(?![\p{L}])/iu;
// Words that open a condition after them ("if you do not renew") or point back to one
// before them ("Renew by March 1, otherwise…"). "sí" (yes) is not "si" (if).
// "without" / "sin" count before a thing the person sends ("without your renewal
// form"), not before a manner ("without paying attention").
const FORWARD =
  /\b(?:if|unless)\b|\bwithout\s(?=(?:your|the|a|an|any)\s)|(?<![\p{L}])si\s|(?<![\p{L}])sin\s(?=(?:su|sus|el|la|los|las|un|una)\s)|\ba\smenos\sque\b/giu;
// After "if" / "si" the step must be one the person misses: "If you work full time,
// you will lose your coverage" states a fact about them, not a deadline.
const MISSED =
  /\b(?:not|never|fail(?:s|ed)?\sto|miss(?:es|ed)?|late)\b|n't\b|(?<![\p{L}])no(?![\p{L}])/iu;
const EVEN = /\b(?:even|aun|aún|incluso)\s$/iu;
// "If you don't, …" / "Si no lo hace, …" points back to the step before it.
const PRO_FORM =
  /^\s*(?:not|(?:you|we)\s(?:don't|do\snot|didn't|did\snot)|(?:usted\s)?no(?:\slo\shace)?)\s*$/iu;
// A date between commas ("If, by March 1, you do not renew") is part of the condition.
const TIME =
  /^\s*(?:(?:by|before|after|on|until|no\slater\sthan|antes\sdel?|para\sel|el)\b[^,;]*|\d{1,4}(?:st|nd|rd|th)?)?\s*$/iu;
const BACKWARD =
  /\b(?:otherwise|or)\b|(?<![\p{L}])o\s|\bde\slo\scontrario\b/giu;
// A period inside "Feb. 15" or "5 p.m. on" does not end a sentence.
const SENTENCE_END = /[.!?;]["')\]]*(?=\s+[\p{Lu}¿¡"'(•-]|\s*$)/gu;
const CLAUSE_SPLIT = /[,;]/;

// Sentence boundaries [start, end) around position `at`, and the one before it.
function sentences(text: string, at: number) {
  let previous = 0;
  let start = 0;
  for (const m of text.matchAll(SENTENCE_END)) {
    if (m.index >= at) return { previous, start, end: m.index };
    previous = start;
    start = m.index + m[0].length;
  }
  return { previous, start, end: text.length };
}

function hasReason(text: string, at: number, length: number): boolean {
  const { previous, start, end } = sentences(text, at);
  const sentence = text.slice(start, end);
  const lossStart = at - start;
  const lossEnd = lossStart + length;
  // "if …" up to the next comma (past a date between commas), never into the loss.
  for (const m of sentence.matchAll(FORWARD)) {
    if (m.index >= lossStart && m.index < lossEnd) continue;
    if (EVEN.test(sentence.slice(0, m.index))) continue;
    const segments = sentence.slice(m.index + m[0].length).split(CLAUSE_SPLIT);
    let last = segments.shift() ?? "";
    let body = last;
    while (TIME.test(last) && segments.length) {
      last = segments.shift()!;
      body += "," + last;
    }
    let clause = m[0] + body;
    if (m.index < lossStart) clause = clause.slice(0, lossStart - m.index);
    const isIf = /^(?:if|si)\b/iu.test(m[0]);
    if (isIf && PRO_FORM.test(clause.slice(m[0].length))) {
      const earlier = sentence.slice(0, m.index).replace(/[\s,;]+$/, "");
      if (ACTION.test(earlier.trim() ? earlier : text.slice(previous, start)))
        return true;
      continue;
    }
    if (isIf && !MISSED.test(clause)) continue;
    if (ACTION.test(clause)) return true;
  }
  // "…, otherwise" and "… or" directly before the loss point back to what comes
  // before them, or to the previous sentence when they open this one.
  const before = sentence.slice(0, lossStart);
  for (const m of before.matchAll(BACKWARD)) {
    if (
      before
        .slice(m.index + m[0].length)
        .trim()
        .replace(/^,/, "")
        .trim()
    )
      continue;
    const clause = before.slice(0, m.index).trim()
      ? before.slice(0, m.index)
      : text.slice(previous, start);
    if (ACTION.test(clause)) return true;
  }
  return false;
}

// Words we must never use for Coverage Keeper itself (legal checklist "Banned terms", #50).
// Strict: no place anywhere in our own copy.
const STRICT_TERMS = [
  String.raw`notari[oa]s?(?:\s+p[uú]blic[oa]s?)?`,
  String.raw`licenciad[oa]s?`,
  String.raw`immigration\s+(?:consultant|assistant|specialist)s?`,
  String.raw`consultor(?:a|es|as)?\s+de\s+inmigraci[oó]n`,
  String.raw`abogad[oa]s?`,
  String.raw`lawyers?`,
  String.raw`paralegals?`,
  String.raw`navigators?`,
  String.raw`assisters?`,
  String.raw`certified\s+application\s+counselors?`,
  String.raw`enrollment\s+(?:counselor|facilitator)s?`,
  String.raw`community\s+partners?`,
  String.raw`nurses?`,
  String.raw`counselors?`,
  String.raw`consejer[oa]s?`,
  String.raw`therapists?`,
  String.raw`case\s*workers?`,
  String.raw`hipaa[\s-]+compliant`,
  String.raw`guaranteed`,
  String.raw`licensed`,
  String.raw`certified`,
];
// Fine when a letter or our copy names someone else ("ask your doctor", "the official
// helpline"); banned only as a description of us. The Spanish forms are our translations
// of the checklist's English terms.
const CONTEXT_TERMS = [
  String.raw`doctors?`,
  String.raw`legal\s+aid`,
  String.raw`legal\s+services`,
  String.raw`accurate`,
  String.raw`official`,
  String.raw`m[eé]dic[oa]s?`,
  String.raw`doctor(?:a|es|as)`,
  String.raw`enfermer[oa]s?`,
  String.raw`terapeutas?`,
  String.raw`oficial(?:es)?`,
  String.raw`garantizad[oa]s?`,
  String.raw`certificad[oa]s?`,
];
const END = String.raw`(?![\p{L}\p{N}])`;

export const STRICT_BANNED_TERMS: RegExp[] = STRICT_TERMS.map(
  (t) => new RegExp(String.raw`(?<![\p{L}\p{N}])(?:${t})${END}`, "iu"),
);

const ANY_TERM = `(?:${[...STRICT_TERMS, ...CONTEXT_TERMS].join("|")})${END}`;
// "We are (a team of) …", never "We are not …" or "We are sending your doctor …".
const SELF_DESCRIPTION_PATTERNS: RegExp[] = [
  String.raw`\b(?:i\s+am|i'm|we\s+are|we're|coverage\s+keeper\s+is|this\s+(?:app|tool|service|site|website)\s+is|our\s+(?:team|staff)\s+(?:is|are))(?!\s+(?:not|no|never)\b)\s+(?:(?:a|an|your|the)\s+(?:[\w-]+\s+){0,2}?)?${ANY_TERM}`,
  String.raw`\bas\s+your\s+${ANY_TERM}\s*,`,
  String.raw`(?<!\bno\s)\b(?:soy|somos|coverage\s+keeper\s+es|esta\s+(?:aplicaci[oó]n|herramienta|p[aá]gina)\s+es|nuestro\s+equipo\s+(?:es|est[aá]))\s+(?:(?:un|una|unos|unas|su|sus|el|la|los|las)\s+(?:[\p{L}-]+\s+){0,2}?)?${ANY_TERM}`,
  String.raw`\bcomo\s+su\s+${ANY_TERM}\s*,`,
].map((p) => new RegExp(p, "iu"));

// Cyrillic and Greek letters that look Latin, so "еligible" can't pass for "eligible".
const LOOKALIKE_FROM = "аеорсухіјѕԁԛԝАВЕКМНОРСТХІЈЅοαικνρτυχΑΒΕΖΗΙΚΜΝΟΡΤΥΧ";
const LOOKALIKE_TO = "aeopcyxijsdqwABEKMHOPCTXIJSoaikvptuxABEZHIKMNOPTYX";

// Health and mental health care: a diagnosis, medicine advice or a treatment to try
// (#49). Asking for a doctor's note and naming a "health condition" stay fine.
const HEALTH_CARE_PATTERNS: RegExp[] = [
  // "if you have a mental health condition, you may be exempt" names an exemption.
  String.raw`(?<!\b(?:if|whether|unless)\s)\byou\s+(?:may|might|could|probably|likely|seem\s+to|appear\s+to)?\s*(?:have|suffer\s+from)\s+(?:a\s+|an\s+)?(?:depression|anxiety|ptsd|bipolar|schizophrenia|(?:\w+\s+)?(?:disorder|mental\s+illness)|mental\s+(?:health\s+)?(?:condition|disorder|illness))\b`,
  String.raw`\b(?:stop|start|keep)\s+taking\s+(?:your\s+)?(?:medication|medicine|meds|pills|antidepressants)`,
  String.raw`\b(?:try|consider|start)\s+(?:therapy|counseling|antidepressants|medication)\b`,
  String.raw`(?<!\bsi\s)\busted\s+(?:podría\s+tener|tiene|probablemente\s+tiene|sufre\s+de)\s+(?:una\s+|un\s+)?(?:depresión|ansiedad|un\s+trastorno|trastorno|una\s+enfermedad\s+mental)`,
  String.raw`\b(?:deje|dejar|empiece|empezar|siga)\s+(?:de\s+|a\s+)?tomar\s+(?:su\s+)?(?:medicamento|medicina|pastillas|antidepresivos)`,
  String.raw`\bpruebe\s+(?:la\s+)?(?:terapia|consejería|medicación)`,
].map((p) => new RegExp(p, "iu"));

export const HEALTH_FALLBACK =
  "We can't give health or mental health advice. Ask your doctor. In a crisis, call or text 988.";

export const HEALTH_FALLBACK_ES =
  "No podemos dar consejos de salud ni de salud mental. Pregúntele a su médico. Si está en crisis, llame o envíe un mensaje de texto al 988.";

// Immigration advice: the person's status, public charge, visas, USCIS filings (#48).
// What a letter asks for ("we could not verify your immigration status", "send a copy
// of your green card") stays fine.
const IMMIGRATION_PATTERNS: RegExp[] = [
  String.raw`(?<!\b(?:if|whether|unless)\s)\byou(?:'re|\s+are)\s+(?:not\s+)?(?:a\s+|an\s+)?(?:lawful(?:ly)?\s+|legal(?:ly)?\s+)?(?:permanent\s+resident|undocumented|qualified\s+(?:non-?citizen|immigrant|alien)|refugee|asylee|lawfully\s+present|out\s+of\s+status)\b`,
  String.raw`\byour\s+(?:immigration\s+)?status\s+(?:is|will\s+(?:not\s+)?be|won't\s+be)\s+(?:not\s+)?(?:lawful|legal|valid|safe|fine|ok(?:ay)?|protected|affected|at\s+risk|in\s+danger)\b`,
  String.raw`\bpublic\s+charge\b`,
  String.raw`\byou\s+(?:can|could|should|need\s+to|must|may|will)\s+(?:not\s+)?(?:apply\s+for|get|renew|obtain|keep|lose)\s+(?:a\s+|an\s+|your\s+)?(?:visa|green\s+card|work\s+permit|citizenship|asylum|daca)\b`,
  String.raw`\b(?:file|submit|fill\s+out)\s+(?:a\s+|the\s+)?form\s+[IN]-\d`,
  // "You should file with USCIS", not "we check it with USCIS".
  String.raw`\byou\s+(?:can|could|should|need\s+to|must|may|will)\s+(?:not\s+)?(?:file|apply|submit)\b[^.]{0,40}\b(?:with|to)\s+(?:the\s+)?USCIS\b`,
  String.raw`^\s*(?:file|apply|submit)\b(?![^.]{0,40}\b(?:we|they|the\s+state)\b)[^.]{0,40}\b(?:with|to)\s+(?:the\s+)?USCIS\b`,
  String.raw`(?<!\bsi\s)\busted\s+(?:no\s+)?es\s+(?:un\s+|una\s+)?(?:residente\s+permanente|indocumentad[oa]|refugiad[oa]|inmigrante\s+calificad[oa])`,
  // "su estado" alone is "your state"; only "estado migratorio" is a status.
  String.raw`\bsu\s+(?:estatus(?:\s+migratorio)?|estado\s+migratorio)\s+(?:es|será|no\s+será)\s+(?:legal|válido|seguro|afectado)`,
  String.raw`\bcarga\s+pública`,
  String.raw`\b(?:puede|podría|debe|debería|necesita)\s+(?:solicitar|pedir|obtener|renovar)\s+(?:una\s+|la\s+|su\s+)?(?:visa|tarjeta\s+verde|green\s+card|ciudadanía|asilo|permiso\s+de\s+trabajo)`,
  String.raw`\b(?:presente|presentar|llene|llenar)\s+(?:el\s+)?formulario\s+[IN]-\d`,
  String.raw`\bante\s+(?:el\s+)?USCIS\b`,
].map((p) => new RegExp(p, "iu"));

export const IMMIGRATION_FALLBACK =
  "We can't give immigration advice. Call the number on your letter, or find free legal help at justice.gov/eoir.";

export const IMMIGRATION_FALLBACK_ES =
  "No podemos dar asesoría de inmigración. Llame al número de su carta o busque ayuda legal gratuita en justice.gov/eoir.";

// Legal strategy: whether to appeal, which option to pick, what the person "should" do
// about the case (#47). Rights a letter states ("you can ask for a hearing") and its
// instructions ("you must report your hours") stay fine.
// Only case strategy: signing, accepting or choosing a plan is what renewal letters ask.
const LEGAL_ACTION = String.raw`(?:appeal|ask\s+for\s+a\s+(?:fair\s+)?hearing|request\s+a\s+(?:fair\s+)?hearing|file\s+(?:an\s+appeal|a\s+complaint|a\s+grievance)|reapply|hire\s+a\s+lawyer|get\s+a\s+lawyer)`;
const ACCION_LEGAL = String.raw`(?:apel(?:ar|e)|pedir\s+una\s+audiencia|pida\s+una\s+audiencia|solicit(?:ar|e)\s+una\s+audiencia|present(?:ar|e)\s+una\s+(?:apelación|queja)|volver?\s+a\s+solicitar|vuelva\s+a\s+solicitar|contrat(?:ar|e)\s+a\s+un\s+abogado)`;
const LEGAL_STRATEGY_PATTERNS: RegExp[] = [
  String.raw`\byou\s+(?:should|ought\s+to|shouldn't|should\s+not)\s+(?:not\s+)?${LEGAL_ACTION}\b`,
  // "We recommend you keep a copy" is agency wording; only a strategy is advice.
  String.raw`\b(?:we|i)\s+(?:recommend|suggest|advise)\s+(?:that\s+)?(?:you\s+)?(?:to\s+)?(?:not\s+)?${LEGAL_ACTION}\b`,
  String.raw`\byour\s+best\s+(?:option|choice|bet|move)\s+is\b`,
  String.raw`\bthe\s+best\s+(?:option|choice)\s+(?:for\s+you\s+)?is\b`,
  String.raw`\bit(?:'s|\s+is|\s+would\s+be)\s+(?:best|better|wise|smart)\s+to\s+${LEGAL_ACTION}\b`,
  String.raw`\b(?:usted\s+)?(?:debería|deberías)\s+(?:no\s+)?${ACCION_LEGAL}`,
  String.raw`\b(?:le|te)\s+(?:recomendamos|recomiendo|aconsejamos|aconsejo|sugerimos|sugiero)\s+(?:que\s+)?(?:no\s+)?${ACCION_LEGAL}`,
  String.raw`\b(?:su|tu)\s+mejor\s+opción\s+es\b`,
  String.raw`\blo\s+mejor\s+(?:es|sería)\s+(?:que\s+)?${ACCION_LEGAL}`,
].map((p) => new RegExp(p, "iu"));

const LEGAL_HELP = "lsc.gov";

export const LEGAL_FALLBACK = `We can't tell you what to do about your case. Call the number on your letter, or find free legal aid at ${LEGAL_HELP}.`;

export const LEGAL_FALLBACK_ES = `No podemos decirle qué hacer con su caso. Llame al número de su carta o busque ayuda legal gratuita en ${LEGAL_HELP}.`;

export const SAFE_FALLBACK =
  "We can't decide if you qualify. Only the state can. Call the number on your letter to ask.";

export const SAFE_FALLBACK_ES =
  "No podemos decidir si usted califica. Solo el estado puede hacerlo. Llame al número que aparece en su carta para preguntar.";

// The text with full-width forms and look-alike letters folded. An invisible character
// (zero-width space, soft hyphen) may sit inside a word or between two words, so each
// text is checked both with it removed and with it read as a space.
function variants(text: string): string[] {
  const folded = text
    .normalize("NFKC")
    .replace(/./gu, (c) => {
      const i = LOOKALIKE_FROM.indexOf(c);
      return i < 0 ? c : LOOKALIKE_TO[i]!;
    })
    .replace(/[’‘]/g, "'");
  return [folded.replace(/\p{Cf}/gu, ""), folded.replace(/\p{Cf}/gu, " ")].map(
    (t) => t.replace(/\s+/g, " "),
  );
}

const findAll = (text: string, patterns: RegExp[]): string[] => {
  const texts = variants(text);
  return [
    ...new Set(
      patterns.flatMap((pattern) =>
        texts.flatMap((t) => {
          const match = t.match(pattern);
          return match ? [match[0]] : [];
        }),
      ),
    ),
  ];
};

// Both languages always: the model may answer in either one.
export function findForbiddenClaims(text: string): string[] {
  const claims = variants(text).flatMap((t) => [
    ...[...CLAIMS_EN, ...CLAIMS_ES].flatMap((pattern) =>
      [...t.matchAll(pattern)].map((m) => m[0]),
    ),
    ...[...LOSSES_EN, ...LOSSES_ES].flatMap((pattern) =>
      [...t.matchAll(pattern)]
        .filter((m) => !hasReason(t, m.index, m[0].length))
        .map((m) => m[0]),
    ),
  ]);
  return [...new Set(claims)];
}

// Text that presents us as a professional, as official or as guaranteed (#50).
export const findSelfDescriptions = (text: string): string[] =>
  findAll(text, SELF_DESCRIPTION_PATTERNS);

export const findHealthCare = (text: string): string[] =>
  findAll(text, HEALTH_CARE_PATTERNS);

export const findImmigrationAdvice = (text: string): string[] =>
  findAll(text, IMMIGRATION_PATTERNS);

export const findLegalStrategy = (text: string): string[] =>
  findAll(text, LEGAL_STRATEGY_PATTERNS);

// Each check with the sentence shown in place of a blocked text. The first hit wins.
const CHECKS: {
  find: (text: string) => string[];
  fallback: { en: string; es: string };
}[] = [
  {
    find: (t) => [...findForbiddenClaims(t), ...findSelfDescriptions(t)],
    fallback: { en: SAFE_FALLBACK, es: SAFE_FALLBACK_ES },
  },
  {
    find: findHealthCare,
    fallback: { en: HEALTH_FALLBACK, es: HEALTH_FALLBACK_ES },
  },
  {
    find: findImmigrationAdvice,
    fallback: { en: IMMIGRATION_FALLBACK, es: IMMIGRATION_FALLBACK_ES },
  },
  {
    find: findLegalStrategy,
    fallback: { en: LEGAL_FALLBACK, es: LEGAL_FALLBACK_ES },
  },
];

export function enforceGuardrail(
  text: string,
  locale: "en" | "es" = "en",
): {
  text: string;
  blocked: boolean;
} {
  const hit = CHECKS.find((check) => check.find(text).length > 0);
  return hit
    ? { text: hit.fallback[locale], blocked: true }
    : { text, blocked: false };
}

// Shown in place of a paper we had to hide. A plain pointer back to the letter.
export const HIDDEN_PAPER =
  "One paper on your letter can't be shown here. Check your letter.";
export const HIDDEN_PAPER_ES =
  "No podemos mostrar aquí uno de los papeles de su carta. Revise su carta.";

// A blocked quote or action is left out, so our fallback sentence is never shown as
// the letter's own words. The screen then says "Not sure. Check the letter or call."
export const shownOrNull = (text: string | null): string | null =>
  text && !enforceGuardrail(text).blocked ? text : null;

// A blocked paper keeps its place in the list, so the person knows one is missing.
export const paperOrNotice = (text: string, locale: "en" | "es" = "en") =>
  enforceGuardrail(text).blocked
    ? locale === "es"
      ? HIDDEN_PAPER_ES
      : HIDDEN_PAPER
    : text;
