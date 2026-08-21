import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const starter = {
  section: {
    sectionId: "7419283650",
    pageId: "teachzenhome",
    sectionType: "split-hero",
    name: "TeachZen AI Learning Hero",
    version: 1,
    status: "draft",
    variation: "midnight",
    variations: ["midnight", "sunrise"],
    layout: { columns: "1.05fr .95fr", gap: "clamp(28px,5vw,88px)" },
    elementIds: [],
    allSectionsCss: ""
  },
  elements: [
    {
      elementId: "3817462059",
      sectionId: "7419283650",
      fieldId: "5127309481",
      type: "badge",
      key: "eyebrow",
      label: "Eyebrow",
      defaultValue: "AI-ASSISTED LEARNING",
      content: "AI-ASSISTED LEARNING",
      editable: true,
      required: true,
      binding: "sections.7419283650.5127309481",
      order: 1
    },
    {
      elementId: "1946283057",
      sectionId: "7419283650",
      fieldId: "6205174839",
      type: "text",
      key: "headline",
      label: "Headline",
      defaultValue: "Teach smarter. Learn deeper.",
      content: "Teach smarter. Learn deeper.",
      editable: true,
      required: true,
      binding: "sections.7419283650.6205174839",
      order: 2
    },
    {
      elementId: "6283159047",
      sectionId: "7419283650",
      fieldId: "7381046259",
      type: "text",
      key: "body",
      label: "Body",
      defaultValue:
        "Turn ideas, notes and course material into focused learning experiences your students can actually use.",
      content:
        "Turn ideas, notes and course material into focused learning experiences your students can actually use.",
      editable: true,
      required: true,
      binding: "sections.7419283650.7381046259",
      order: 3
    },
    {
      elementId: "9051736284",
      sectionId: "7419283650",
      fieldId: "8462051739",
      type: "button",
      key: "cta",
      label: "CTA",
      defaultValue: "Generate a learning space",
      content: "Generate a learning space",
      editable: true,
      required: true,
      binding: "sections.7419283650.8462051739",
      order: 4
    },
    {
      elementId: "2759184630",
      sectionId: "7419283650",
      fieldId: "9347206158",
      type: "cards",
      key: "stats",
      label: "Stats",
      defaultValue: "",
      content: "",
      editable: true,
      required: false,
      binding: "sections.7419283650.9347206158",
      loop: true,
      order: 5,
      items: [
        { value: "3×", label: "faster content setup" },
        { value: "24/7", label: "guided practice" },
        { value: "100%", label: "CMS editable" }
      ]
    },
    {
      elementId: "5162947308",
      sectionId: "7419283650",
      fieldId: "1057382649",
      type: "image",
      key: "visual",
      label: "Visual",
      defaultValue: "abstract",
      content: "abstract",
      editable: true,
      required: false,
      binding: "sections.7419283650.1057382649",
      order: 6
    }
  ]
};

const backgroundPresets = [
  {
    name: "Midnight",
    color: "#07080d",
    image: ""
  },
  {
    name: "Aurora",
    color: "#07151a",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=85"
  },
  {
    name: "Desert",
    color: "#21150f",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=85"
  },
  {
    name: "Mountains",
    color: "#10141c",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85"
  }
];

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
          }
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((n) => observer.observe(n));

    return () => observer.disconnect();
  }, []);
}

function App() {
  const dispatch = useDispatch();
  const content = useSelector((s) => s.content);

  const [prompt, setPrompt] = useState(
    "Create a premium AI learning hero for university students. Keep it cinematic and minimal, use cyan, magenta and warm peach accents, include 3 stats and a strong CTA."
  );

  const [code, setCode] = useState("");
  const [wireframe, setWireframe] = useState(null);
  const [wirePreview, setWirePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Ready.");
  const [activePanel, setActivePanel] = useState("generate");

  const lastSection = useRef(null);

  // ------------------------------------------
  // VISUAL DESIGN CONTROLS
  // ------------------------------------------

  const [backgroundImage, setBackgroundImage] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#07080d");
  const [backgroundPosition, setBackgroundPosition] = useState("center");
  const [backgroundOverlay, setBackgroundOverlay] = useState(25);

  const [backgroundDraft, setBackgroundDraft] = useState("");

  const [backgroundMessage, setBackgroundMessage] = useState(
    "No custom background"
  );

  useReveal();

  useEffect(() => {
    if (!content.section) {
      dispatch({
        type: "content/setGenerated",
        payload: starter
      });
    }
  }, [content.section, dispatch]);

  const elements = content.elements?.length
    ? content.elements
    : starter.elements;

  const section = content.section || starter.section;

  const fieldMap = useMemo(
    () => Object.fromEntries(elements.map((e) => [e.key, e])),
    [elements]
  );

  const onFile = (file) => {
    setWireframe(file || null);

    if (file) {
      setWirePreview(URL.createObjectURL(file));
    } else {
      setWirePreview("");
    }
  };

  async function generate() {
    setLoading(true);
    setMessage("Teaching Gemini the layout…");

    try {
      const form = new FormData();

      form.append("prompt", prompt);
      form.append("code", code);

      form.append(
        "previous_section",
        JSON.stringify({
          section,
          elements
        })
      );

      if (wireframe) {
        form.append("wireframe", wireframe);
      }

      const response = await fetch(`${API}/api/generate`, {
        method: "POST",
        body: form
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Generation failed");
      }

      dispatch({
        type: "content/setGenerated",
        payload: {
          section: data.section,
          elements: data.elements
        }
      });

      lastSection.current = data;

      setMessage(
        data.mode === "gemini"
          ? "Generated with Gemini — prompt applied."
          : `Fallback generated — ${
              data.warning || "Gemini was unavailable."
            }`
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function edit(fieldId, value) {
    dispatch({
      type: "content/updateElement",
      payload: {
        fieldId,
        value
      }
    });
  }

  function download(name, text, type = "application/json") {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  async function save() {
    try {
      const data = {
        section,
        elements
      };

      const res = await fetch(
        `${API}/api/sections/${section.sectionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      const out = await res.json();

      setMessage(
        res.ok
          ? "Saved to the JSON document store."
          : out.detail || "Save failed"
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  const exportJson = () =>
    download(
      "teachzen-section.json",
      JSON.stringify(
        {
          section,
          elements
        },
        null,
        2
      )
    );

  const exportCode = () =>
    download(
      "TeachZenGeneratedSection.jsx",
      lastSection.current?.reactCode ||
        "// Generate a section first.",
      "text/plain"
    );

  // ------------------------------------------
  // BACKGROUND CONTROLS
  // ------------------------------------------

  function applyBackground() {
    const value = backgroundDraft.trim();

    setBackgroundImage(value);

    setBackgroundMessage(
      value ? "Custom image applied" : "Image cleared"
    );
  }

  function clearBackground() {
    setBackgroundDraft("");
    setBackgroundImage("");
    setBackgroundMessage("Custom image cleared");
  }

  function applyPreset(preset) {
    setBackgroundColor(preset.color);
    setBackgroundImage(preset.image);
    setBackgroundDraft(preset.image);

    setBackgroundMessage(`${preset.name} theme applied`);
  }

  function handleBackgroundKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyBackground();
    }
  }

  return (
    <div className="app">
      <div className="grain" />

      <header className="nav">
        <a
          className="brand"
          href="#top"
          aria-label="TeachZen home"
        >
          <span>teach</span>
          <i>zen</i>
          <b>•</b>
        </a>

        <nav>
          <a href="#practice">PRACTICE</a>
          <a href="#systems">SYSTEMS</a>
          <a href="#generator">GENERATOR</a>
          <a href="#proof">CMS PROOF</a>
        </nav>

        <a
          className="outline-btn"
          href="#generator"
        >
          REQUEST A GENERATION
        </a>
      </header>

      <aside className="side-tab">
        PS7 · BUILD <span>↗</span>
      </aside>

      <main id="top">
        {/* HERO */}

        <section className="hero">
          <div className="world-clock">
            <span className="live">
              <em /> BENGALURU <b>06:21</b>
            </span>

            <span>
              ABU DHABI <b>04:51</b>
            </span>

            <span>
              LONDON <b>02:51</b>
            </span>

            <span>
              TOKYO <b>10:51</b>
            </span>
          </div>

          <p className="kicker">
            INTELLIGENCE, <i>BEAUTIFULLY</i> MANAGED
          </p>

          <h1>
            teach<span>zen</span>
          </h1>

          <div className="hero-orb orb-a" />
          <div className="hero-orb orb-b" />
          <div className="hero-orb orb-c" />

          <div className="hero-bottom">
            <span>AI UI GENERATION</span>
            <span>CMS READY · REACT · JSON</span>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
        </section>

        {/* MANIFESTO */}

        <section
          className="manifesto reveal"
          id="practice"
        >
          <div className="section-index">
            01 / PRACTICE
          </div>

          <div>
            <p className="eyebrow">
              FROM IDEA TO INTERFACE
            </p>

            <h2>
              Give us a <i>wireframe.</i>
              <br />
              Give us a <i>thought.</i>
              <br />
              We make it usable.
            </h2>
          </div>

          <p className="manifesto-copy">
            TeachZen turns prompts, existing code and
            visual references into a structured React
            section — complete with stable CMS IDs,
            defaults, bindings and a live editable
            preview.
          </p>
        </section>

        {/* SYSTEMS */}

        <section
          className="systems reveal"
          id="systems"
        >
          <div className="section-index">
            02 / SYSTEMS
          </div>

          <div className="system-grid">
            {[
              [
                "01",
                "PROMPT",
                "Intent becomes a structured section schema."
              ],
              [
                "02",
                "WIRE",
                "Visual regions become semantic UI elements."
              ],
              [
                "03",
                "CODE",
                "Existing JSX becomes reusable CMS-ready output."
              ],
              [
                "04",
                "BIND",
                "Every editable field gets a stable 10-digit identity."
              ]
            ].map(([n, t, d]) => (
              <article
                className="system-card"
                key={n}
              >
                <small>{n}</small>
                <h3>{t}</h3>
                <p>{d}</p>
                <span>↗</span>
              </article>
            ))}
          </div>
        </section>

        {/* GENERATOR */}

        <section
          className="generator-section reveal"
          id="generator"
        >
          <div className="section-index">
            03 / GENERATOR
          </div>

          <div className="generator-head">
            <div>
              <p className="eyebrow">
                THE TEACHZEN ENGINE
              </p>

              <h2>
                Generate the <i>section.</i>
                <br />
                Own the content.
              </h2>
            </div>

            <p>
              One workspace for prompt + code +
              wireframe. The AI returns a CMS-ready IR
              instead of a pretty screenshot with
              hard-coded text.
            </p>
          </div>

          <div className="workspace">
            {/* INPUT */}

            <div className="input-panel">
              <div className="panel-top">
                <span>INPUTS</span>
                <small>{message}</small>
              </div>

              <label>
                Natural language prompt
              </label>

              <textarea
                value={prompt}
                onChange={(e) =>
                  setPrompt(e.target.value)
                }
                placeholder="Describe the section…"
              />

              <label>
                Existing code{" "}
                <small>optional</small>
              </label>

              <textarea
                className="code-input"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value)
                }
                placeholder="<section>…</section>"
              />

              <label>
                Wireframe{" "}
                <small>optional</small>
              </label>

              <div className="dropzone">
                <input
                  id="wire"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onFile(
                      e.target.files?.[0]
                    )
                  }
                />

                <label htmlFor="wire">
                  {wireframe
                    ? wireframe.name
                    : "Drop an image or browse"}
                </label>

                {wirePreview && (
                  <img
                    src={wirePreview}
                    alt="Wireframe preview"
                  />
                )}
              </div>

              <button
                className="generate-btn"
                onClick={generate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    GENERATING
                  </>
                ) : (
                  <>
                    GENERATE SECTION{" "}
                    <b>↗</b>
                  </>
                )}
              </button>
            </div>

            {/* PREVIEW */}

            <div className="preview-panel">
              <div className="panel-top">
                <span>LIVE PREVIEW</span>
                <small>
                  REDUX CONTENT SOURCE
                </small>
              </div>

              {/* DESIGN CONTROL */}

              <div className="design-controls">
                <div className="design-title">
                  <span>VISUAL CONTROL</span>
                  <small>
                    LIVE DESIGN OVERRIDE
                  </small>
                </div>

                <div className="preset-row">
                  {backgroundPresets.map(
                    (preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        className="preset-btn"
                        onClick={() =>
                          applyPreset(preset)
                        }
                      >
                        {preset.name}
                      </button>
                    )
                  )}
                </div>

                <label>
                  Background image URL

                  <input
                    type="url"
                    value={backgroundDraft}
                    onChange={(e) =>
                      setBackgroundDraft(
                        e.target.value
                      )
                    }
                    onKeyDown={
                      handleBackgroundKeyDown
                    }
                    placeholder="https://images.unsplash.com/..."
                  />

                  <small className="control-help">
                    Paste an image URL and press
                    Enter or Apply.
                  </small>
                </label>

                <div className="background-actions">
                  <button
                    type="button"
                    onClick={applyBackground}
                  >
                    APPLY BACKGROUND
                  </button>

                  <button
                    type="button"
                    onClick={clearBackground}
                  >
                    CLEAR
                  </button>
                </div>

                <div className="control-row">
                  <label>
                    Background color

                    <div className="color-control">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) =>
                          setBackgroundColor(
                            e.target.value
                          )
                        }
                      />

                      <span>
                        {backgroundColor}
                      </span>
                    </div>
                  </label>

                  <label>
                    Image position

                    <select
                      value={
                        backgroundPosition
                      }
                      onChange={(e) =>
                        setBackgroundPosition(
                          e.target.value
                        )
                      }
                    >
                      <option value="center">
                        Center
                      </option>

                      <option value="top">
                        Top
                      </option>

                      <option value="bottom">
                        Bottom
                      </option>

                      <option value="left">
                        Left
                      </option>

                      <option value="right">
                        Right
                      </option>
                    </select>
                  </label>
                </div>

                <label className="range-label">
                  Dark overlay

                  <div className="range-line">
                    <input
                      type="range"
                      min="0"
                      max="70"
                      value={
                        backgroundOverlay
                      }
                      onChange={(e) =>
                        setBackgroundOverlay(
                          Number(e.target.value)
                        )
                      }
                    />

                    <span>
                      {backgroundOverlay}%
                    </span>
                  </div>
                </label>

                <div className="background-status">
                  <span className="status-dot" />
                  {backgroundMessage}
                </div>
              </div>

              <GeneratedPreview
                elements={elements}
                backgroundImage={
                  backgroundImage
                }
                backgroundColor={
                  backgroundColor
                }
                backgroundPosition={
                  backgroundPosition
                }
                backgroundOverlay={
                  backgroundOverlay
                }
              />
            </div>
          </div>
        </section>

        {/* CMS */}

        <section
          className="cms reveal"
          id="proof"
        >
          <div className="section-index">
            04 / CMS PROOF
          </div>

          <div className="cms-head">
            <div>
              <p className="eyebrow">
                NO HAND-EDITING REQUIRED
              </p>

              <h2>
                Edit content.
                <br />
                <i>Not the component.</i>
              </h2>
            </div>

            <div className="actions">
              <button onClick={save}>
                SAVE JSON
              </button>

              <button onClick={exportJson}>
                EXPORT IR
              </button>

              <button onClick={exportCode}>
                EXPORT JSX
              </button>
            </div>
          </div>

          <div className="cms-layout">
            <div className="cms-preview">
              <GeneratedPreview
                elements={elements}
                backgroundImage={
                  backgroundImage
                }
                backgroundColor={
                  backgroundColor
                }
                backgroundPosition={
                  backgroundPosition
                }
                backgroundOverlay={
                  backgroundOverlay
                }
              />
            </div>

            <div className="editor">
              <div className="editor-title">
                CONTENT MODEL{" "}
                <span>
                  {
                    elements.filter(
                      (e) => e.editable
                    ).length
                  }{" "}
                  editable
                </span>
              </div>

              {elements
                .filter(
                  (e) =>
                    e.editable &&
                    e.type !== "cards"
                )
                .map((e) => (
                  <label
                    className="field"
                    key={e.fieldId}
                  >
                    <span>
                      {e.label}{" "}
                      <b>{e.fieldId}</b>
                    </span>

                    <input
                      value={e.content ?? ""}
                      onChange={(ev) =>
                        edit(
                          e.fieldId,
                          ev.target.value
                        )
                      }
                    />
                  </label>
                ))}

              {elements.find(
                (e) => e.type === "cards"
              ) && (
                <div className="mini-schema">
                  <span>
                    REPEATABLE BLOCK
                  </span>

                  <strong>cards[]</strong>

                  <p>
                    Loop schema preserved as one
                    CMS element instead of three
                    hard-coded cards.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER HERO */}

        <section className="footer-hero reveal">
          <p className="eyebrow">
            TEACHZEN · PS7
          </p>

          <h2>
            Interfaces that
            <br />
            <i>learn.</i>
          </h2>

          <a
            href="#generator"
            className="outline-btn big"
          >
            START AGAIN ↗
          </a>
        </section>
      </main>

      <footer>
        <span>© 2026 TEACHZEN</span>
        <span>
          REACT · FASTAPI · GEMINI · JSON
        </span>
        <span>
          BUILT FOR THE HACKATHON
        </span>
      </footer>
    </div>
  );
}

function GeneratedPreview({
  elements,
  backgroundImage = "",
  backgroundColor = "#07080d",
  backgroundPosition = "center",
  backgroundOverlay = 25
}) {
  const get = (
    key,
    fallback = ""
  ) =>
    elements.find(
      (e) => e.key === key
    )?.content || fallback;

  const stats =
    elements.find(
      (e) => e.type === "cards"
    )?.items || [];

  const visual = get(
    "visual",
    "abstract"
  );

  const overlay =
    Math.max(
      0,
      Math.min(100, Number(backgroundOverlay) || 0)
    ) / 100;

  const cardStyle = {
    backgroundColor,
    backgroundImage: backgroundImage
      ? `
        linear-gradient(
          rgba(0, 0, 0, ${overlay}),
          rgba(0, 0, 0, ${overlay})
        ),
        url("${backgroundImage}")
      `
      : undefined,
    backgroundSize: backgroundImage
      ? "cover"
      : undefined,
    backgroundPosition:
      backgroundPosition || "center",
    backgroundRepeat: "no-repeat"
  };

  return (
    <div
      className="generated-card"
      style={cardStyle}
    >
      <div className="generated-visual">
        <div
          className={`visual-art ${
            visual === "abstract"
              ? ""
              : "custom"
          }`}
        >
          <span className="visual-ring ring-one" />
          <span className="visual-ring ring-two" />
          <span className="visual-core" />

          <div className="visual-label">
            TEACHZEN / AI
          </div>
        </div>
      </div>

      <div className="generated-copy">
        <span className="generated-badge">
          {get(
            "eyebrow",
            "AI-ASSISTED LEARNING"
          )}
        </span>

        <h3>
          {get(
            "headline",
            "Teach smarter. Learn deeper."
          )}
        </h3>

        <p>
          {get(
            "body",
            "Turn ideas, notes and course material into focused learning experiences."
          )}
        </p>

        <button>
          {get(
            "cta",
            "Generate a learning space"
          )}{" "}
          <b>↗</b>
        </button>

        {stats.length > 0 && (
          <div className="stats-row">
            {stats
              .slice(0, 4)
              .map((s, i) => (
                <div key={i}>
                  <strong>
                    {s.value}
                  </strong>

                  <span>
                    {s.label}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;