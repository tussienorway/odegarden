/* Local-only enquiry builder: no network requests, analytics or browser storage. */
(function(root) {
  "use strict";
  function validContact(value) {
    const v = String(value || "").trim();
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ||
      /^(?:(?:\+47|0047)[\s-]?)?(?:\d[\s-]?){7}\d$/.test(v);
  }
  function buildBrief(data) {
    const get = key => String(data[key] || "").trim();
    for (const key of ["service", "place", "scope", "name", "contact"]) {
      if (!get(key)) throw new Error("Fyll inn alle feltene merket med *.");
    }
    if (!validContact(get("contact"))) throw new Error("Oppgi en gyldig e-postadresse eller et norsk telefonnummer.");
    return [
      "Prosjektforespørsel – " + get("service"), "",
      "Oppdragsgiver: " + get("customer"),
      "Bedrift / organisasjon: " + (get("company") || "Ikke oppgitt"),
      "Sted: " + get("place"),
      "Ønsket tidsrom: " + (get("timing") || "Avklares"),
      "", "Omfang:", get("scope"), "",
      "Kontaktperson: " + get("name"), "Kontakt: " + get("contact"), "",
      "Vi ønsker en avklaring av kapasitet, videre prosess og eventuelt behov for befaring.",
      "Dette er en forespørsel, ikke en bestilling."
    ].join("\n");
  }
  if (typeof module !== "undefined" && module.exports) module.exports = {buildBrief, validContact};
  if (!root.document) return;
  const doc = root.document, form = doc.getElementById("project-form");
  if (!form) return;
  const output = doc.getElementById("project-output"), field = doc.getElementById("project-text");
  form.addEventListener("submit", event => {
    event.preventDefault();
    const error = doc.getElementById("project-error");
    try {
      field.value = buildBrief(Object.fromEntries(new FormData(form)));
      error.textContent = "";
      doc.getElementById("project-status").textContent = "";
      output.hidden = false;
      field.focus();
      output.scrollIntoView({block: "nearest"});
    } catch (e) {
      output.hidden = true;
      error.textContent = e.message;
      form.elements.contact.focus();
    }
  });
  form.addEventListener("input", () => { output.hidden = true; });
  doc.getElementById("edit-project").addEventListener("click", () => {
    output.hidden = true;
    form.elements.service.focus();
  });
  doc.getElementById("copy-project").addEventListener("click", async () => {
    const status = doc.getElementById("project-status");
    try {
      await root.navigator.clipboard.writeText(field.value);
      status.textContent = "Kopiert. Lim teksten inn i e-posten din.";
    } catch (_) {
      field.focus(); field.select();
      status.textContent = "Teksten er markert. Velg Kopier på enheten din.";
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
