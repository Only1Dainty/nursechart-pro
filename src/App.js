import React, { useMemo, useState } from "react";

export default function App() {
  const [language, setLanguage] = useState("en");

  const [noteFacts, setNoteFacts] = useState("");
  const [noteOutput, setNoteOutput] = useState("");

  const [situation, setSituation] = useState("");
  const [background, setBackground] = useState("");
  const [assessment, setAssessment] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [sbarOutput, setSbarOutput] = useState("");

  const text = useMemo(() => {
    const content = {
      en: {
        brand: "NurseChart Pro",
        badge: "Built for nurses",
        headline: "Chart Smarter. Finish Faster.",
        subheadline:
          "Create professional nursing notes and SBAR reports in seconds with a cleaner workflow.",
        noteTitle: "AI Nurse Note Writer",
        noteSubtitle:
          "Enter quick patient facts, actions taken, and response. Generate a polished note draft.",
        notePlaceholder:
          "Example: Patient complained of 8/10 lower back pain. BP 148/92. PRN pain medication given as ordered. Repositioned for comfort. MD notified. Patient resting in bed with call light in reach.",
        noteButton: "Generate Nurse Note",
        noteClear: "Clear",
        noteOutputTitle: "Generated Nursing Note",
        sbarTitle: "SBAR Generator",
        sbarSubtitle:
          "Fill in the key details and create a structured handoff report.",
        situation: "Situation",
        situationPlaceholder:
          "Example: Patient reports worsening shortness of breath during ambulation.",
        background: "Background",
        backgroundPlaceholder:
          "Example: History of CHF, admitted 2 days ago, on 2L oxygen via nasal cannula.",
        assessment: "Assessment",
        assessmentPlaceholder:
          "Example: Respirations labored, O2 sat 89% on 2L, crackles noted bilaterally.",
        recommendation: "Recommendation",
        recommendationPlaceholder:
          "Example: Request evaluation, possible oxygen adjustment, and further orders.",
        sbarButton: "Generate SBAR",
        sbarOutputTitle: "Generated SBAR Report",
        chooseLanguage: "Language",
        english: "English",
        creole: "Kreyòl Ayisyen",
        featuresTitle: "Why NurseChart Pro",
        feature1: "Faster documentation",
        feature2: "Cleaner handoff communication",
        feature3: "Built for real nursing workflow",
        footer: "NurseChart Pro • Documentation support for busy nurses",
        noteFallback:
          "Enter a few patient details first, then generate your nursing note.",
        sbarFallback:
          "Complete at least one SBAR section first, then generate your report.",
      },
      ht: {
        brand: "NurseChart Pro",
        badge: "Fèt pou enfimyè",
        headline: "Fè charting pi entelijan. Fini pi vit.",
        subheadline:
          "Kreye nòt enfimyè ak rapò SBAR byen òganize nan kèk segond ak yon workflow ki pi pwòp.",
        noteTitle: "Zouti pou Ekri Nòt Enfimyè",
        noteSubtitle:
          "Antre detay rapid sou pasyan an, sa ki fèt, ak repons pasyan an. Zouti a ap prepare yon bèl nòt pou ou.",
        notePlaceholder:
          "Egzanp: Pasyan an plenyen doulè 8/10 nan do anba. Tansyon 148/92. Medikaman doulè PRN bay jan yo te bay lòd. Pasyan an repositionnen pou konfò. Doktè a enfòme. Pasyan an ap repoze nan kabann ak bouton apèl la bò kote li.",
        noteButton: "Jenere Nòt Enfimyè",
        noteClear: "Efase",
        noteOutputTitle: "Nòt Enfimyè Jenere",
        sbarTitle: "Jeneratè SBAR",
        sbarSubtitle:
          "Ranpli enfòmasyon prensipal yo epi kreye yon rapò handoff ki byen estriktire.",
        situation: "Sitiyasyon",
        situationPlaceholder:
          "Egzanp: Pasyan an di souf li ap vin pi kout lè l ap mache.",
        background: "Background",
        backgroundPlaceholder:
          "Egzanp: Gen istwa CHF, admèt depi 2 jou, sou 2L oksijèn nan nen.",
        assessment: "Evalyasyon",
        assessmentPlaceholder:
          "Egzanp: Respirasyon difisil, O2 sat 89% sou 2L, gen crackles nan toude poumon.",
        recommendation: "Rekòmandasyon",
        recommendationPlaceholder:
          "Egzanp: Mande evalyasyon, petèt ajisteman oksijèn, ak lòt lòd.",
        sbarButton: "Jenere SBAR",
        sbarOutputTitle: "Rapò SBAR Jenere",
        chooseLanguage: "Lang",
        english: "Anglè",
        creole: "Kreyòl Ayisyen",
        featuresTitle: "Poukisa NurseChart Pro",
        feature1: "Dokimantasyon pi rapid",
        feature2: "Kominikasyon handoff pi klè",
        feature3: "Fèt pou workflow reyèl enfimyè yo",
        footer: "NurseChart Pro • Sipò dokimantasyon pou enfimyè ki okipe anpil",
        noteFallback:
          "Antre kèk detay sou pasyan an anvan ou jenere nòt la.",
        sbarFallback:
          "Ranpli omwen yon seksyon SBAR anvan ou jenere rapò a.",
      },
    };

    return content[language];
  }, [language]);

  function generateNote() {
    const cleaned = noteFacts.trim();

    if (!cleaned) {
      setNoteOutput(text.noteFallback);
      return;
    }

    if (language === "ht") {
      setNoteOutput(
        `Nòt Enfimyè:\n\nPasyan an te evalye epi obsève pandan swen an. Dapre enfòmasyon ki antre yo: ${cleaned}\n\nSwen ak entèvansyon yo te bay jan sa te apwopriye. Pasyan an te kontinye siveye pou chanjman nan kondisyon li, sekirite li, ak repons li ak swen yo. Plan swen an ap kontinye selon bezwen pasyan an ak lòd ki an plas.`
      );
      return;
    }

    setNoteOutput(
      `Nursing Note:\n\nPatient assessed and monitored during this shift. Based on the information provided: ${cleaned}\n\nAppropriate nursing interventions were implemented as indicated. Patient response was observed and ongoing monitoring will continue for changes in condition, safety, and comfort. Plan of care remains in progress per current orders and patient needs.`
    );
  }

  function generateSBAR() {
    const hasAnyInput =
      situation.trim() ||
      background.trim() ||
      assessment.trim() ||
      recommendation.trim();

    if (!hasAnyInput) {
      setSbarOutput(text.sbarFallback);
      return;
    }

    if (language === "ht") {
      setSbarOutput(
        `SBAR\n\n` +
          `Sitiyasyon:\n${situation.trim() || "Pa gen enfòmasyon antre."}\n\n` +
          `Background:\n${background.trim() || "Pa gen enfòmasyon antre."}\n\n` +
          `Evalyasyon:\n${assessment.trim() || "Pa gen enfòmasyon antre."}\n\n` +
          `Rekòmandasyon:\n${recommendation.trim() || "Pa gen enfòmasyon antre."}`
      );
      return;
    }

    setSbarOutput(
      `SBAR\n\n` +
        `Situation:\n${situation.trim() || "No information entered."}\n\n` +
        `Background:\n${background.trim() || "No information entered."}\n\n` +
        `Assessment:\n${assessment.trim() || "No information entered."}\n\n` +
        `Recommendation:\n${recommendation.trim() || "No information entered."}`
    );
  }

  function clearAll() {
    setNoteFacts("");
    setNoteOutput("");
    setSituation("");
    setBackground("");
    setAssessment("");
    setRecommendation("");
    setSbarOutput("");
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, #f4f8ff 0%, #eef6f3 50%, #ffffff 100%)",
      color: "#132238",
      fontFamily:
        'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: "24px",
    },
    shell: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    topbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "28px",
    },
    brandWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    badge: {
      display: "inline-block",
      background: "#dff4ea",
      color: "#155b3d",
      borderRadius: "999px",
      padding: "8px 14px",
      fontSize: "13px",
      fontWeight: 700,
      width: "fit-content",
    },
    brand: {
      margin: 0,
      fontSize: "32px",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    langBox: {
      background: "#ffffff",
      border: "1px solid #d9e4f2",
      borderRadius: "16px",
      padding: "14px",
      minWidth: "220px",
      boxShadow: "0 10px 30px rgba(19,34,56,0.06)",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 700,
      marginBottom: "8px",
      color: "#38506b",
    },
    select: {
      width: "100%",
      padding: "12px",
      borderRadius: "12px",
      border: "1px solid #cbd8e6",
      background: "#fff",
      fontSize: "15px",
    },
    hero: {
      background: "rgba(255,255,255,0.82)",
      border: "1px solid #e2ebf5",
      borderRadius: "24px",
      padding: "30px",
      boxShadow: "0 18px 50px rgba(19,34,56,0.08)",
      marginBottom: "24px",
    },
    headline: {
      margin: "0 0 12px 0",
      fontSize: "44px",
      lineHeight: 1.05,
      letterSpacing: "-0.03em",
      maxWidth: "720px",
    },
    subheadline: {
      margin: 0,
      fontSize: "18px",
      lineHeight: 1.6,
      color: "#49637f",
      maxWidth: "760px",
    },
    features: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "14px",
      marginTop: "24px",
    },
    featureCard: {
      background: "#f8fbff",
      border: "1px solid #dce8f4",
      borderRadius: "18px",
      padding: "16px",
      fontWeight: 600,
      color: "#1f3850",
    },
    toolGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "20px",
      marginTop: "20px",
    },
    card: {
      background: "#ffffff",
      border: "1px solid #dfe9f3",
      borderRadius: "24px",
      padding: "22px",
      boxShadow: "0 16px 40px rgba(19,34,56,0.06)",
    },
    cardTitle: {
      margin: "0 0 8px 0",
      fontSize: "24px",
      fontWeight: 800,
    },
    cardText: {
      margin: "0 0 16px 0",
      color: "#5a728d",
      lineHeight: 1.6,
      fontSize: "15px",
    },
    textarea: {
      width: "100%",
      minHeight: "140px",
      borderRadius: "16px",
      border: "1px solid #cad8e6",
      padding: "14px",
      fontSize: "15px",
      lineHeight: 1.5,
      resize: "vertical",
      boxSizing: "border-box",
      outline: "none",
      marginBottom: "14px",
    },
    smallTextarea: {
      width: "100%",
      minHeight: "96px",
      borderRadius: "14px",
      border: "1px solid #cad8e6",
      padding: "12px",
      fontSize: "15px",
      lineHeight: 1.5,
      resize: "vertical",
      boxSizing: "border-box",
      outline: "none",
      marginBottom: "12px",
    },
    buttonRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginBottom: "16px",
    },
    primaryBtn: {
      background: "#0f62fe",
      color: "#fff",
      border: "none",
      borderRadius: "14px",
      padding: "12px 18px",
      fontSize: "15px",
      fontWeight: 700,
      cursor: "pointer",
    },
    secondaryBtn: {
      background: "#eef4fb",
      color: "#1f3f63",
      border: "1px solid #cfdded",
      borderRadius: "14px",
      padding: "12px 18px",
      fontSize: "15px",
      fontWeight: 700,
      cursor: "pointer",
    },
    outputWrap: {
      background: "#f7fbff",
      border: "1px solid #dbe7f2",
      borderRadius: "18px",
      padding: "16px",
    },
    outputTitle: {
      margin: "0 0 10px 0",
      fontSize: "16px",
      fontWeight: 800,
      color: "#1c3854",
    },
    outputText: {
      margin: 0,
      whiteSpace: "pre-wrap",
      lineHeight: 1.7,
      color: "#23384d",
      fontSize: "15px",
    },
    footer: {
      textAlign: "center",
      color: "#5c728b",
      fontSize: "14px",
      marginTop: "28px",
      paddingBottom: "16px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topbar}>
          <div style={styles.brandWrap}>
            <span style={styles.badge}>{text.badge}</span>
            <h1 style={styles.brand}>{text.brand}</h1>
          </div>

          <div style={styles.langBox}>
            <label style={styles.label}>{text.chooseLanguage}</label>
            <select
              style={styles.select}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">{text.english}</option>
              <option value="ht">{text.creole}</option>
            </select>
          </div>
        </div>

        <section style={styles.hero}>
          <h2 style={styles.headline}>{text.headline}</h2>
          <p style={styles.subheadline}>{text.subheadline}</p>

          <div style={styles.features}>
            <div style={styles.featureCard}>{text.feature1}</div>
            <div style={styles.featureCard}>{text.feature2}</div>
            <div style={styles.featureCard}>{text.feature3}</div>
          </div>
        </section>

        <section style={styles.toolGrid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>{text.noteTitle}</h3>
            <p style={styles.cardText}>{text.noteSubtitle}</p>

            <textarea
              style={styles.textarea}
              placeholder={text.notePlaceholder}
              value={noteFacts}
              onChange={(e) => setNoteFacts(e.target.value)}
            />

            <div style={styles.buttonRow}>
              <button style={styles.primaryBtn} onClick={generateNote}>
                {text.noteButton}
              </button>
              <button style={styles.secondaryBtn} onClick={clearAll}>
                {text.noteClear}
              </button>
            </div>

            <div style={styles.outputWrap}>
              <h4 style={styles.outputTitle}>{text.noteOutputTitle}</h4>
              <p style={styles.outputText}>{noteOutput || "—"}</p>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>{text.sbarTitle}</h3>
            <p style={styles.cardText}>{text.sbarSubtitle}</p>

            <label style={styles.label}>{text.situation}</label>
            <textarea
              style={styles.smallTextarea}
              placeholder={text.situationPlaceholder}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            />

            <label style={styles.label}>{text.background}</label>
            <textarea
              style={styles.smallTextarea}
              placeholder={text.backgroundPlaceholder}
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />

            <label style={styles.label}>{text.assessment}</label>
            <textarea
              style={styles.smallTextarea}
              placeholder={text.assessmentPlaceholder}
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
            />

            <label style={styles.label}>{text.recommendation}</label>
            <textarea
              style={styles.smallTextarea}
              placeholder={text.recommendationPlaceholder}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
            />

            <div style={styles.buttonRow}>
              <button style={styles.primaryBtn} onClick={generateSBAR}>
                {text.sbarButton}
              </button>
              <button style={styles.secondaryBtn} onClick={clearAll}>
                {text.noteClear}
              </button>
            </div>

            <div style={styles.outputWrap}>
              <h4 style={styles.outputTitle}>{text.sbarOutputTitle}</h4>
              <p style={styles.outputText}>{sbarOutput || "—"}</p>
            </div>
          </div>
        </section>

        <div style={styles.footer}>{text.footer}</div>
      </div>
    </div>
  );
}
