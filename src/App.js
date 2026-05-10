import React, { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe("pk_test_51TVH0VC04moZOo0gzpxbfV9t3KN28qjK5Vxrcwt2X1Eh0Cvgi5FyOaWasr097tuYTDE1iH9biwxt9xvuelsU2HfF00uIUFIpn1");
export default function App() {
  const [noteType, setNoteType] = useState("progress");
  const [inputLanguage, setInputLanguage] = useState("auto");
  const [roughNotes, setRoughNotes] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [substanceMode, setSubstanceMode] = useState(false);

  const [sbarFields, setSbarFields] = useState({
    situation: "",
    background: "",
    assessment: "",
    recommendation: "",
  });
  const [activeSbarField, setActiveSbarField] = useState("situation");

  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Tap Start Dictation to speak.");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("Mic not supported here. Best results: iPhone Safari.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
  rec.lang = "en-US";
rec.maxAlternatives = 5;

if (inputLanguage === "auto") {
  rec.lang = "en-US";
} else if (inputLanguage === "english") {
  rec.lang = "en-US";
} else if (inputLanguage === "spanish") {
  rec.lang = "es-US";
} else if (inputLanguage === "french") {
  rec.lang = "fr-FR";
} else if (inputLanguage === "creole") {
  rec.lang = "fr-FR";
} else if (inputLanguage === "tagalog") {
  rec.lang = "fil-PH";
} else if (inputLanguage === "arabic") {
  rec.lang = "ar-SA";
} else if (inputLanguage === "portuguese") {
  rec.lang = "pt-BR";
} else if (inputLanguage === "hindi") {
  rec.lang = "hi-IN";
} else if (inputLanguage === "urdu") {
  rec.lang = "ur-PK";
} else if (inputLanguage === "mandarin") {
  rec.lang = "zh-CN";
} else if (inputLanguage === "vietnamese") {
  rec.lang = "vi-VN";
} else if (inputLanguage === "russian") {
  rec.lang = "ru-RU";
} else if (inputLanguage === "japanese") {
  rec.lang = "ja-JP";
} else if (inputLanguage === "korean") {
  rec.lang = "ko-KR";
} else if (inputLanguage === "german") {
  rec.lang = "de-DE";
} else if (inputLanguage === "italian") {
  rec.lang = "it-IT";
} else if (inputLanguage === "yoruba") {
  rec.lang = "en-US";
} else if (inputLanguage === "igbo") {
  rec.lang = "en-US";
}

    rec.onstart = function () {
      setIsListening(true);
      setStatus(
        noteType === "sbar"
          ? `Listening to ${activeSbarField}`
          : "Listening to rough notes"
      );
    };

    rec.onresult = function (event) {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      const finalText = cleanText(transcript.trim(), inputLanguage);
      if (!finalText) return;

      if (noteType === "sbar") {
        setSbarFields((prev) => ({
          ...prev,
          [activeSbarField]: prev[activeSbarField]
            ? prev[activeSbarField] + " " + finalText
            : finalText,
        }));
      } else {
        setRoughNotes((prev) => (prev ? prev + ", " + finalText : finalText));
      }

      setStatus("Dictation captured.");
    };

    rec.onerror = function () {
      setIsListening(false);
      setStatus("Dictation error.");
    };

    rec.onend = function () {
      setIsListening(false);
      setStatus("Stopped.");
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch (e) {}
    };
  }, [noteType, activeSbarField, inputLanguage]);

  const startListening = async function () {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      recognitionRef.current?.start();
    } catch (e) {
      setStatus("Microphone permission was denied or unavailable.");
    }
  };

  const stopListening = function () {
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
    setStatus("Stopped.");
  };

  const copyOutput = async function () {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      setCopied(false);
    }
  };

  const clearAll = function () {
    setRoughNotes("");
    setOutput("");
    setCopied(false);
    setSbarFields({
      situation: "",
      background: "",
      assessment: "",
      recommendation: "",
    });
    setActiveSbarField("situation");
    setStatus("Cleared.");
  };

  const pasteAndGenerate = async function () {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        setStatus("Clipboard is empty.");
        return;
      }
      setRoughNotes(text);
      setOutput(
        generateNoteFromText(
          text,
          noteType,
          substanceMode,
          sbarFields,
          inputLanguage
        )
      );
      setStatus("Clipboard pasted and note generated.");
      setCopied(false);
    } catch (e) {
      setStatus("Paste was blocked. Paste manually, then tap Generate.");
    }
  };

  const handleGenerate = async function () {
  setStatus("Generating...");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: roughNotes
      })
    });

   if (!response.ok) {
  const errText = await response.text();
  throw new Error(errText);
}

const data = await response.json();
setOutput(data.result || "");
setStatus("Done.");
} catch (error) {
setStatus("Failed: " + error.message);
}
  
};

  function cleanText(text, language) {
    let t = String(text || "")
      .trim()
      .toLowerCase();

    if (!t) return "";

    t = t.replace(/\s+/g, " ");

    // broken dictation cleanup
    t = t.replace(/reside\s*t/g, "resident");
    t = t.replace(/orie\s*nted|orie\s*ted/g, "oriented");
    t = t.replace(/de\s*ni(?:e)?s/g, "denies");
    t = t.replace(/pai\s*n/g, "pain");
    t = t.replace(/lu\s*ngs/g, "lungs");
    t = t.replace(/dimi\s*nished/g, "diminished");
    t = t.replace(/vita\s*s/g, "vitals");
    t = t.replace(/withi\s*n/g, "within");
    t = t.replace(/norma\s*l/g, "normal");
    t = t.replace(/limit\s*s/g, "limits");
    t = t.replace(/(\w)\.(\w)/g, "$1$2");
    t = t.replace(/[.]+/g, " ");
    t = t.replace(/\s+/g, " ");

    const apply = (pattern, replacement) => {
      t = t.replace(pattern, replacement);
    };

    if (language === "auto" || language === "spanish") {
      apply(/\bsin dolor\b/g, "denies pain");
      apply(/\bdolor\b/g, "pain");
      apply(/\bca[ií]da\b/g, "fall");
      apply(/\bsignos vitales\b/g, "vitals");
      apply(/\bdentro de l[ií]mites normales\b/g, "within normal limits");
      apply(/\bsin dificultad para respirar\b/g, "no sob");
      apply(/\bmedicamentos dados\b/g, "meds given");
      apply(/\bfamilia notificada\b/g, "family notified");
      apply(/\bproveedor notificado\b/g, "provider notified");
    }

    if (language === "auto" || language === "french") {
      apply(/\bpas de douleur\b/g, "denies pain");
      apply(/\bdouleur\b/g, "pain");
      apply(/\bchute\b/g, "fall");
      apply(/\bsignes vitaux\b/g, "vitals");
      apply(/\bpas de dyspn[ée]e\b/g, "no sob");
      apply(/\bfamille notifi[ée]e\b/g, "family notified");
      apply(/\bm[ée]decin notifi[ée]?\b/g, "provider notified");
    }

    if (language === "auto" || language === "filipino") {
      apply(/\bwalang sakit\b/g, "denies pain");
      apply(/\bsakit\b/g, "pain");
      apply(/\bwalang hingal\b/g, "no sob");
      apply(/\bnahulog\b/g, "fall");
      apply(/\bpamilya naabisuhan\b/g, "family notified");
    }

    if (language === "auto" || language === "mandarin") {
      apply(/\bbu teng\b/g, "denies pain");
      apply(/\bmei you tong\b/g, "denies pain");
      apply(/\bmei you hu xi kun nan\b/g, "no sob");
      apply(/\bdie dao\b/g, "fall");
    }

    if (language === "auto" || language === "yoruba") {
      apply(/\bko si irora\b/g, "denies pain");
      apply(/\birora\b/g, "pain");
      apply(/\bko si emi lile\b/g, "no sob");
      apply(/\bsubu\b/g, "fall");
    }

    if (language === "auto" || language === "igbo") {
      apply(/\benweghi mgbu\b/g, "denies pain");
      apply(/\bmgbu\b/g, "pain");
      apply(/\bdaara\b/g, "fall");
    }

    if (language === "auto" || language === "pidgin") {
      apply(/\bno pain\b/g, "denies pain");
      apply(/\be no get pain\b/g, "denies pain");
      apply(/\be dey stable\b/g, "vitals stable");
      apply(/\bno dey short of breath\b/g, "no sob");
      apply(/\bfall down\b/g, "fall");
    }

    return t.trim();
  }

  function titleCaseSentence(text) {
    const cleaned = cleanText(text, inputLanguage);
    if (!cleaned) return "";
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  function extractSmartPhrases(text, language) {
    const t = cleanText(text, language);
    const phrases = [];

    if (
      (t.includes("alert") || t.includes("oriented")) &&
      (t.includes("3") || t.includes("three"))
    ) {
      phrases.push("Resident alert and oriented x3.");
    }
    if (
      (t.includes("alert") || t.includes("oriented")) &&
      (t.includes("4") || t.includes("four"))
    ) {
      phrases.push("Resident alert and oriented x4.");
    }
    if (t.includes("denies pain") || t.includes("no pain")) {
      phrases.push("Denies pain.");
    }
    if (t.includes("no distress") || t.includes("no acute distress")) {
      phrases.push("No acute distress noted at time of assessment.");
    }
    if (t.includes("vitals") && t.includes("normal")) {
      phrases.push("Vital signs within normal limits.");
    } else if (
      t.includes("vitals") ||
      t.includes("vss") ||
      t.includes("vs stable")
    ) {
      phrases.push("Vital signs stable.");
    }
    if (
      t.includes("meds given") ||
      t.includes("medications given") ||
      t.includes("routine meds")
    ) {
      phrases.push("Routine medications administered as ordered.");
    }
    if (t.includes("pain med")) {
      phrases.push("Pain medication administered as ordered.");
    }
    if (t.includes("prn")) {
      phrases.push("PRN medication administered as ordered.");
    }
    if (t.includes("no sob") || t.includes("denies sob")) {
      phrases.push("No shortness of breath reported.");
    }
    if (t.includes("sob")) {
      phrases.push("Shortness of breath noted.");
    }
    if (
      t.includes("lungs diminished") ||
      t.includes("lung sounds diminished")
    ) {
      phrases.push("Lung sounds diminished.");
    }
    if (t.includes("crackles")) {
      phrases.push("Crackles noted on assessment.");
    }
    if (t.includes("wheezing")) {
      phrases.push("Wheezing noted on assessment.");
    }
    if (t.includes("cough")) {
      phrases.push("Cough noted.");
    }
    if (t.includes("poor appetite")) {
      phrases.push("Poor appetite noted.");
    }
    if (t.includes("ate well")) {
      phrases.push("Resident tolerated meals well.");
    }
    if (t.includes("incontinent")) {
      phrases.push("Resident incontinent of bowel and bladder.");
    }
    if (t.includes("continent")) {
      phrases.push("Resident continent of bowel and bladder.");
    }
    if (t.includes("foley intact")) {
      phrases.push("Foley catheter intact and patent.");
    }
    if (t.includes("foley patent")) {
      phrases.push("Foley catheter patent.");
    }
    if (t.includes("fluid restriction")) {
      phrases.push("Resident remains on fluid restriction as ordered.");
    }
    if (t.includes("turned and repositioned")) {
      phrases.push("Resident turned and repositioned as tolerated.");
    }
    if (t.includes("wound care")) {
      phrases.push("Wound care completed as ordered.");
    }
    if (t.includes("dressing changed")) {
      phrases.push("Dressing changed as ordered.");
    }
    if (
      t.includes("provider notified") ||
      t.includes("doctor notified") ||
      t.includes("md notified") ||
      t.includes("np notified")
    ) {
      phrases.push("Provider notified.");
    }
    if (
      t.includes("family notified") ||
      t.includes("family aware") ||
      t.includes("family made aware")
    ) {
      phrases.push("Family notified.");
    }
    if (t.includes("new order")) {
      phrases.push("New orders received.");
    }
    if (t.includes("monitor closely") || t.includes("continue to monitor")) {
      phrases.push("Continue to monitor resident closely.");
    }
    if (
      t.includes("fall") ||
      t.includes("found on floor") ||
      t.includes("found sitting on floor")
    ) {
      phrases.push("Resident experienced unwitnessed fall.");
    }
    if (t.includes("denies hitting head") || t.includes("did not hit head")) {
      phrases.push("Resident denies hitting head.");
    }
    if (t.includes("no injury") || t.includes("no apparent injury")) {
      phrases.push("No apparent injury noted.");
    }
    if (t.includes("neuro checks")) {
      phrases.push("Neuro checks initiated.");
    }
    if (
      t.includes("sent to er") ||
      t.includes("transfer to er") ||
      t.includes("transferred to er")
    ) {
      phrases.push("Resident transferred to ER for further evaluation.");
    }

    if (!phrases.length && t) {
      phrases.push(titleCaseSentence(t) + ".");
    }

    return [...new Set(phrases)];
  }

  function buildProgress(text, substance, language) {
    const phrases = extractSmartPhrases(text, language);
    let result = "Resident assessed this shift. " + phrases.join(" ");

    if (substance) {
      result +=
        " Vital signs reviewed and remain stable unless otherwise indicated. Care provided in accordance with current plan of care. Resident tolerated interventions without difficulty. No acute distress observed at time of assessment. Continue to monitor closely and report any changes in condition to provider as indicated.";
    }

    return result;
  }

  function deriveSbarFromSituation(situationText, language) {
    const t = cleanText(situationText, language);
    const background = [];
    const assessment = [];
    const recommendation = [];

    if (t.includes("fall")) {
      background.push("Resident found after reported fall event.");
      recommendation.push(
        "Provider notification and ongoing monitoring indicated."
      );
    }
    if (t.includes("denies pain")) {
      assessment.push("Denies pain.");
    }
    if (t.includes("denies hitting head")) {
      assessment.push("Resident denies hitting head.");
    }
    if (t.includes("no injury") || t.includes("no apparent injury")) {
      assessment.push("No apparent injury noted.");
    }
    if (t.includes("vitals") && t.includes("normal")) {
      assessment.push("Vital signs within normal limits.");
    } else if (t.includes("vitals")) {
      assessment.push("Vital signs stable.");
    }
    if (t.includes("provider notified")) {
      recommendation.push("Provider notified.");
    }
    if (t.includes("family notified") || t.includes("family aware")) {
      recommendation.push("Family notified.");
    }
    if (t.includes("neuro checks")) {
      recommendation.push("Neuro checks initiated.");
    }

    return {
      background: background.join(" "),
      assessment: assessment.join(" "),
      recommendation: recommendation.join(" "),
    };
  }

  function buildSBAR(fields, substance, language) {
    const derived = deriveSbarFromSituation(fields.situation, language);

    const bSource = fields.background || derived.background;
    const aSource = fields.assessment || derived.assessment;
    const rSource = fields.recommendation || derived.recommendation;

    const s =
      extractSmartPhrases(fields.situation, language).join(" ") ||
      "No situation entered.";
    const b =
      extractSmartPhrases(bSource, language).join(" ") ||
      "No background entered.";
    const a =
      extractSmartPhrases(aSource, language).join(" ") ||
      "No assessment entered.";
    const r =
      extractSmartPhrases(rSource, language).join(" ") ||
      "No recommendation entered.";

    let result = `Situation: ${s} Background: ${b} Assessment: ${a} Recommendation: ${r}`;

    if (substance) {
      result +=
        " Communication completed using SBAR format. Resident status and assessment findings were relayed clearly. Follow-up recommendations and monitoring needs remain in place.";
    }

    return result;
  }

  function buildChange(text, substance, language) {
    let result =
      "Change in Condition: " +
      extractSmartPhrases(text, language).join(" ") +
      " Provider follow-up and continued monitoring remain in place.";

    if (substance) {
      result +=
        " Resident reassessed following noted change in condition. Clinical findings reviewed and documented. Ongoing monitoring continues with provider notification as indicated.";
    }

    return result;
  }

  function buildFall(text, substance, language) {
    let result =
      "Fall Note: " +
      extractSmartPhrases(text, language).join(" ") +
      " Resident assessed following fall event. Appropriate notifications completed and monitoring initiated.";

    if (substance) {
      result +=
        " Post-fall assessment completed promptly. No additional complications noted unless otherwise stated above. Continue post-fall protocol and ongoing monitoring.";
    }

    return result;
  }

  function buildAdmission(text, substance, language) {
    let result =
      "Admission Note: Resident admitted to facility and assessed upon arrival. " +
      extractSmartPhrases(text, language).join(" ");

    if (substance) {
      result +=
        " Admission assessment completed head to toe. Baseline status established. Care plan initiated and resident will continue to be monitored for any changes in condition.";
    }

    return result;
  }

  function generateNoteFromText(text, type, substance, fields, language) {
    if (type === "sbar") return buildSBAR(fields, substance, language);

    const cleaned = cleanText(text, language);
    if (!cleaned) return "Please enter rough notes first.";

    if (type === "change") return buildChange(cleaned, substance, language);
    if (type === "fall") return buildFall(cleaned, substance, language);
    if (type === "admission")
      return buildAdmission(cleaned, substance, language);
    return buildProgress(cleaned, substance, language);
  }

  const inputStyle = (field) => ({
    width: "100%",
    minHeight: 95,
    borderRadius: 14,
    border:
      activeSbarField === field ? "2px solid #7c3aed" : "1px solid #d8b4fe",
    padding: 12,
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    background: activeSbarField === field ? "#faf5ff" : "#fff",
  });
const stripePromise = loadStripe("pk_test_51TVH0VC04moZOo0gzpxbfV9t3KN28qjK5Vxrcwt2X1Eh0Cvgi5FyOaWasr097tuYTDE1iH9biwxt9xvuelsU2HfF00uIUFIpn1");
  return (
    
<div
      style={{
        minHeight: "100vh",
        background:  "transparent",
        backgroundImage: 'url("/NCPwatermark.png")',
backgroundRepeat: "no-repeat",
backgroundPosition: "center",
backgroundSize: "420px",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1050,
          margin: "0 auto",
          background: 'rgba(255, 255, 255, 0.88)',
backgroundImage: 'url("/NCPwatermark.png")',
backgroundRepeat: "no-repeat",
backgroundPosition: "center",
backgroundSize: "420px",
          borderRadius: 28,
          padding: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          border: "1px solid #e9d5ff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 18,
                background: "linear-gradient(135deg, #9333ea, #4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              𝓝𝓒𝓟
            </div>
            <div>
              <h2 style={{ color: "#6b21a8", margin: 0 }}>
                Nurse Chart Pro 
              </h2>
              <p
                style={{ margin: "6px 0 0 0", color: "#6b7280", fontSize: 14 }}
              >
                Built by a nurse. Designed for nurses.
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#f5f3ff",
              color: "#6b21a8",
              padding: "8px 12px",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            NCP
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <label style={labelStyle}>Note Type</label>
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            style={selectStyle}
          >
            <option value="progress">Progress Note</option>
            <option value="sbar">SBAR</option>
            <option value="change">Change in Condition</option>
            <option value="fall">Fall Note</option>
            <option value="admission">Admission</option>
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Language Selector</label>
          <select
            value={inputLanguage}
            onChange={(e) => setInputLanguage(e.target.value)}
            style={selectStyle}
          >
            <option value="auto">Auto Detect</option>
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="filipino">Filipino</option>
            <option value="mandarin">Mandarin</option>
            <option value="yoruba">Yoruba</option>
            <option value="igbo">Igbo</option>
            <option value="pidgin">Nigerian Pidgin</option>
            <option value="creole">Haitian Creole</option>
          </select>
        </div>

        <div style={{ marginTop: 14 }}>
          <button
            onClick={() => setSubstanceMode(!substanceMode)}
            style={greenButton}
          >
            {substanceMode ? "Substance ON" : "Add Substance"}
          </button>
        </div>

        {noteType === "sbar" ? (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                marginBottom: 10,
                padding: 12,
                borderRadius: 14,
                background: "#faf5ff",
                border: "1px solid #e9d5ff",
                color: "#6b21a8",
                fontWeight: 600,
              }}
            >
              Active mic box: {activeSbarField}
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <div>
                <label style={labelStyle}>Situation</label>
                <textarea
                  value={sbarFields.situation}
                  onFocus={() => setActiveSbarField("situation")}
                  onClick={() => setActiveSbarField("situation")}
                  onChange={(e) =>
                    setSbarFields((prev) => ({
                      ...prev,
                      situation: e.target.value,
                    }))
                  }
                  placeholder="What is happening right now?"
                  style={inputStyle("situation")}
                />
              </div>

              <div>
                <label style={labelStyle}>Background</label>
                <textarea
                  value={sbarFields.background}
                  onFocus={() => setActiveSbarField("background")}
                  onClick={() => setActiveSbarField("background")}
                  onChange={(e) =>
                    setSbarFields((prev) => ({
                      ...prev,
                      background: e.target.value,
                    }))
                  }
                  placeholder="Relevant history or context"
                  style={inputStyle("background")}
                />
              </div>

              <div>
                <label style={labelStyle}>Assessment</label>
                <textarea
                  value={sbarFields.assessment}
                  onFocus={() => setActiveSbarField("assessment")}
                  onClick={() => setActiveSbarField("assessment")}
                  onChange={(e) =>
                    setSbarFields((prev) => ({
                      ...prev,
                      assessment: e.target.value,
                    }))
                  }
                  placeholder="What you found"
                  style={inputStyle("assessment")}
                />
              </div>

              <div>
                <label style={labelStyle}>Recommendation</label>
                <textarea
                  value={sbarFields.recommendation}
                  onFocus={() => setActiveSbarField("recommendation")}
                  onClick={() => setActiveSbarField("recommendation")}
                  onChange={(e) =>
                    setSbarFields((prev) => ({
                      ...prev,
                      recommendation: e.target.value,
                    }))
                  }
                  placeholder="What was done or needed"
                  style={inputStyle("recommendation")}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <label style={labelStyle}>Rough Notes / What You Say</label>
            <textarea
              value={roughNotes}
              onChange={(e) => setRoughNotes(e.target.value)}
              placeholder="Speak or type your rough note here..."
              style={textareaStyle}
            />
          </div>
        )}

        <div
          style={{
            marginTop: 14,
            borderRadius: 16,
            border: "1px solid #d8b4fe",
            background: "#f3e8ff",
            padding: 12,
            fontSize: 14,
            color: "#6b21a8",
            fontWeight: 600,
          }}
        >
          {status}
        </div>

        <div
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}
        >
          {!isListening ? (
            <button onClick={startListening} style={purpleButton}>
              🎤 Start Dictation
            </button>
          ) : (
            <button onClick={stopListening} style={darkPurpleButton}>
              Stop
            </button>
          )}

          <button onClick={handleGenerate} style={blackButton}>
            {noteType === "sbar" ? "Build SBAR" : "Generate"}
          </button>

          <button onClick={pasteAndGenerate} style={greenButton}>
            Paste + Generate
          </button>

          <button onClick={copyOutput} style={whiteButton}>
            {copied ? "Copied" : "Copy"}
          </button>

          <button onClick={clearAll} style={whiteButton}>
            Clear
          </button>
            <button
  onClick={() =>
    window.open("https://buy.stripe.com/dRm5kCeIF0Uy1Ky2Wb28800", "_blank")
  }
  style={greenButton}
>
  Subscribe Premium
</button>
        </div>

        <div
          style={{
            marginTop: 14,
            borderRadius: 16,
            border: "1px solid #fde68a",
            background: "#fffbeb",
            padding: 12,
            fontSize: 14,
            color: "#475569",
          }}
        >
          Input can be rough, accented, or mixed-language. Output stays in clean
          professional English.
        </div>

        <div style={{ marginTop: 20 }}>
          <label style={labelStyle}>Refined Output / Clean Note</label>
          <textarea
            value={output}
            readOnly
            style={{
              ...textareaStyle,
              background: "#f8fafc",
              minHeight: 200,
            }}
          />
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 8,
  fontWeight: 700,
  color: "#581c87",
};

const selectStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "1px solid #d8b4fe",
  fontSize: 14,
};

const textareaStyle = {
  width: "100%",
  minHeight: 180,
  borderRadius: 14,
  border: "1px solid #d8b4fe",
  padding: 12,
  fontSize: 14,
  boxSizing: "border-box",
};

const purpleButton = {
  background: "#9333ea",
  color: "#fff",
  padding: "12px 16px",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const darkPurpleButton = {
  background: "#6b21a8",
  color: "#fff",
  padding: "12px 16px",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const blackButton = {
  background: "#111827",
  color: "#fff",
  padding: "12px 16px",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const greenButton = {
  background: "#059669",
  color: "#fff",
  padding: "12px 16px",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const whiteButton = {
  background: "#fff",
  color: "#111827",
  padding: "12px 16px",
  border: "1px solid #d1d5db",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};



