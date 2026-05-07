import React, { useEffect, useRef, useState } from "react";

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
  boxSizing: "border-box",
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

function getSpeechLanguage(inputLanguage) {
  const map = {
    auto: "en-US",
    english: "en-US",
    spanish: "es-US",
    french: "fr-FR",
    creole: "fr-FR",
    tagalog: "fil-PH",
    filipino: "fil-PH",
    arabic: "ar-SA",
    portuguese: "pt-BR",
    hindi: "hi-IN",
    urdu: "ur-PK",
    mandarin: "zh-CN",
    vietnamese: "vi-VN",
    russian: "ru-RU",
    japanese: "ja-JP",
    korean: "ko-KR",
    german: "de-DE",
    italian: "it-IT",
    yoruba: "en-US",
    igbo: "en-US",
    pidgin: "en-US",
  };

  return map[inputLanguage] || "en-US";
}

export default function App() {
  const [noteType, setNoteType] = useState("progress");
  const [inputLanguage, setInputLanguage] = useState("auto");
  const [roughNotes, setRoughNotes] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [substanceMode, setSubstanceMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
      setStatus("Mic not supported in this browser. Try Chrome or Safari.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.lang = getSpeechLanguage(inputLanguage);

    rec.onstart = function () {
      setIsListening(true);
      setStatus(
        noteType === "sbar"
          ? `Listening to ${activeSbarField}.`
          : "Listening to rough notes."
      );
    };

    rec.onresult = function (event) {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      const finalText = transcript.trim();
      if (!finalText) return;

      if (noteType === "sbar") {
        setSbarFields((prev) => ({
          ...prev,
          [activeSbarField]: prev[activeSbarField]
            ? prev[activeSbarField] + " " + finalText
            : finalText,
        }));
      } else {
        setRoughNotes((prev) => (prev ? prev + " " + finalText : finalText));
      }

      setStatus("Dictation captured.");
    };

    rec.onerror = function () {
      setIsListening(false);
      setStatus("Dictation error. Check microphone permission.");
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
      setStatus("Copy failed. Please copy manually.");
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
      await handleGenerate(text);
    } catch (e) {
      setStatus("Paste was blocked. Paste manually, then tap Generate.");
    }
  };

  const handleGenerate = async function (overrideText) {
    const textToSend =
      noteType === "sbar"
        ? [
            `Situation: ${sbarFields.situation}`,
            `Background: ${sbarFields.background}`,
            `Assessment: ${sbarFields.assessment}`,
            `Recommendation: ${sbarFields.recommendation}`,
          ].join("\n")
        : overrideText || roughNotes;

    if (!textToSend.trim()) {
      setStatus("Please enter or dictate rough notes first.");
      return;
    }

    setIsGenerating(true);
    setStatus("Generating professional English note...");
    setCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToSend,
          noteType,
          inputLanguage,
          substanceMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setOutput(data.result || "");
      setStatus("Done.");
    } catch (error) {
      setStatus("Failed: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

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

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "420px",
          height: "420px",
          backgroundImage: "url('/NCPwatermark.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          opacity: 0.06,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #f3e8ff, #ffffff)",
          padding: 20,
          fontFamily: "Arial, sans-serif",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 1050,
            margin: "0 auto",
            background: "#fff",
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
                  style={{
                    margin: "6px 0 0 0",
                    color: "#6b7280",
                    fontSize: 14,
                  }}
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
              Secure AI Version
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
              <option value="wound">Wound Care</option>
              <option value="foley">Foley Note</option>
              <option value="hospice">Hospice Note</option>
              <option value="refusal">Chronic Refusal</option>
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
              <option value="creole">Haitian Creole</option>
              <option value="yoruba">Yoruba</option>
              <option value="igbo">Igbo</option>
              <option value="tagalog">Tagalog / Filipino</option>
              <option value="arabic">Arabic</option>
              <option value="portuguese">Portuguese</option>
              <option value="hindi">Hindi</option>
              <option value="urdu">Urdu</option>
              <option value="mandarin">Mandarin</option>
              <option value="vietnamese">Vietnamese</option>
              <option value="russian">Russian</option>
              <option value="japanese">Japanese</option>
              <option value="korean">Korean</option>
              <option value="german">German</option>
              <option value="italian">Italian</option>
              <option value="pidgin">Nigerian Pidgin</option>
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
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 16,
            }}
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

            <button
              onClick={() => handleGenerate()}
              style={{
                ...blackButton,
                opacity: isGenerating ? 0.7 : 1,
              }}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating..."
                : noteType === "sbar"
                ? "Build SBAR"
                : "Generate"}
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
            Input can be rough, accented, or mixed-language. Output stays in
            clean professional English.
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>Refined Output / Clean Note</label>
            <textarea
              value={output}
              readOnly
              style={{
                ...textareaStyle,
                background: "#f8fafc",
                minHeight: 220,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
