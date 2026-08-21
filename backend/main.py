import json
import os
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

load_dotenv()

BASE = Path(__file__).resolve().parent
DATA_FILE = BASE / "data" / "sections.json"
FRONTEND_DIST = BASE.parent / "frontend" / "dist"

app = FastAPI(title="TeachZen AI UI Generator", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ten_digit() -> str:
    return str(random.randint(1_000_000_000, 9_999_999_999))

def read_store() -> dict[str, Any]:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text('{"sections":[]}', encoding="utf-8")
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))

def write_store(data: dict[str, Any]) -> None:
    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

def fallback_ir(prompt: str) -> dict[str, Any]:
    """Deterministic offline generator that actually changes with the prompt."""
    raw = (prompt or "").strip()
    p = raw.lower()

    # Topic-aware presets. The prompt itself is also used to create a unique result,
    # so changing the prompt never leaves the preview stuck on the starter content.
    if any(x in p for x in ["finance", "bank", "investment", "money", "fintech"]):
        theme = "FINANCE INTELLIGENCE"
        headline = "See the signal behind every number."
        body = "Turn financial complexity into a calm, decision-ready experience with clear insights and focused actions."
        cta = "Explore the insights"
        stats = [("42%", "faster analysis"), ("18K", "decisions modeled"), ("99.8%", "data clarity")]
    elif any(x in p for x in ["health", "fitness", "wellness", "doctor", "medical"]):
        theme = "INTELLIGENT WELLNESS"
        headline = "A clearer way to care for yourself."
        body = "Bring routines, progress and meaningful signals into one focused experience designed around better decisions."
        cta = "Build my experience"
        stats = [("7d", "habit momentum"), ("86%", "routine consistency"), ("24/7", "guided support")]
    elif any(x in p for x in ["travel", "trip", "hotel", "tourism", "destination"]):
        theme = "CURATED TRAVEL"
        headline = "Turn the next trip into a story worth keeping."
        body = "Plan places, moments and practical details through an editorial travel experience that feels personal from the first click."
        cta = "Plan the journey"
        stats = [("12", "places curated"), ("4.9/5", "traveller signal"), ("1", "clear itinerary")]
    elif any(x in p for x in ["food", "restaurant", "recipe", "cooking", "chef"]):
        theme = "MODERN KITCHEN"
        headline = "Make every recipe feel effortless."
        body = "A focused culinary interface for discovering dishes, organizing ingredients and moving from idea to plate."
        cta = "Discover recipes"
        stats = [("120+", "recipes ready"), ("15m", "quick starts"), ("4.9", "community rating")]
    elif any(x in p for x in ["portfolio", "designer", "developer", "agency", "creative"]):
        theme = "DIGITAL CRAFT"
        headline = "Make the work impossible to scroll past."
        body = "A cinematic portfolio system that gives projects room to breathe while keeping the story, craft and action unmistakably clear."
        cta = "View the work"
        stats = [("24", "projects"), ("08", "case studies"), ("01", "clear point of view")]
    elif any(x in p for x in ["saas", "software", "dashboard", "product", "startup", "app"]):
        theme = "PRODUCT INTELLIGENCE"
        headline = "Complex software. One clear experience."
        body = "Turn product capability into a focused interface where users understand the value, trust the system and know what to do next."
        cta = "See the product"
        stats = [("3×", "faster setup"), ("92%", "task clarity"), ("24/7", "system access")]
    elif any(x in p for x in ["student", "education", "learning", "course", "school", "teacher"]):
        theme = "AI-ASSISTED LEARNING"
        headline = "Teach smarter. Learn deeper."
        body = "Turn lessons, notes and ideas into focused learning experiences students can actually use."
        cta = "Build a learning space"
        stats = [("3×", "faster setup"), ("24/7", "guided practice"), ("100%", "CMS editable")]
    else:
        # Generic mode still incorporates meaningful words from the user's prompt.
        words = [w.strip(".,!?;:()[]{}\"") for w in raw.split() if len(w.strip(".,!?;:()[]{}\"")) > 3]
        focus = " ".join(words[:4]) if words else "your idea"
        theme = "AI-ASSISTED EXPERIENCE"
        headline = f"A sharper interface for {focus}."
        body = f"Transform {focus} into a structured, responsive experience with clear hierarchy, useful content and a strong next step."
        cta = "Explore the experience"
        stats = [("01", "clear direction"), ("03", "content layers"), ("100%", "CMS ready")]

    accent = "cyan, magenta and warm peach"
    if "green" in p or "emerald" in p:
        accent = "emerald green and warm white"
    elif "blue" in p:
        accent = "electric blue and soft white"
    elif "orange" in p or "amber" in p:
        accent = "amber orange and warm white"

    return {
        "section": {
            "pageId": "home",
            "sectionType": "split-hero",
            "name": f"TeachZen — {theme.title()}",
            "version": 1,
            "status": "draft",
            "variation": "midnight",
            "variations": ["midnight", "sunrise"],
            "layout": {"columns": "1.05fr .95fr", "gap": "clamp(28px,5vw,88px)"},
            "allSectionsCss": "",
        },
        "elements": [
            {"type":"badge","key":"eyebrow","label":"Eyebrow","defaultValue":theme,"content":theme,"editable":True,"required":True},
            {"type":"text","key":"headline","label":"Headline","defaultValue":headline,"content":headline,"editable":True,"required":True},
            {"type":"text","key":"body","label":"Body","defaultValue":body,"content":body,"editable":True,"required":True},
            {"type":"button","key":"cta","label":"CTA","defaultValue":cta,"content":cta,"editable":True,"required":True},
            {"type":"cards","key":"stats","label":"Stats","defaultValue":"","content":"","editable":True,"required":False,"loop":True,
             "items":[{"value":v,"label":l} for v,l in stats]},
            {"type":"image","key":"visual","label":"Visual","defaultValue":theme.lower().replace(" ", "-"),"content":theme.lower().replace(" ", "-"),"editable":True,"required":False},
        ],
        "styleHint": f"Premium dark interface using {accent}. Cinematic glow, spacious typography, subtle glass surfaces. User intent: {raw[:180]}"
    }

def clean_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = text.replace("```json", "", 1).replace("```", "", 1).strip()
    return json.loads(text)

def generate_with_gemini(prompt: str, code: str, image_bytes: Optional[bytes], image_type: Optional[str]) -> dict[str, Any]:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    model = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
    system = """
You are TeachZen's UI generation engine for hackathon PS7.
Return ONLY valid JSON. Do not return markdown.
Your job is to transform prompt, existing code and optionally a wireframe into a CMS-ready React section IR.

Rules:
1. Output exactly an object with keys: section, elements, styleHint.
2. section must contain: pageId, sectionType, name, version, status, variation, variations, layout, allSectionsCss.
3. elements is an array. Every editable content field must be its own element.
4. Each element must contain: type, key, label, defaultValue, content, editable, required.
5. Supported types: badge, text, textfield, button, image, cards.
6. Repeatable content MUST use one type=cards element with loop=true and an items array of objects.
7. Never hard-code multiple repeated cards as unrelated elements.
8. Use semantic keys like eyebrow, headline, body, cta, visual, stats.
9. Keep defaults fictional and generic. Do not invent client brands.
10. Prefer 5-8 elements, responsive split-hero or another clearly structured section.
11. styleHint should describe the visual direction in one short sentence.
"""
    parts: list[Any] = [system, f"USER PROMPT:\n{prompt or '(none)'}", f"EXISTING CODE:\n{code or '(none)'}"]
    if image_bytes:
        parts.append(types.Part.from_bytes(data=image_bytes, mime_type=image_type or "image/png"))
        parts.append("WIRE FRAME IMAGE: infer the visible regions, hierarchy and approximate layout.")
    response = client.models.generate_content(
        model=model,
        contents=parts,
        config=types.GenerateContentConfig(
            temperature=0.45,
            max_output_tokens=2500,
            response_mime_type="application/json",
        ),
    )
    return clean_json(response.text)

def preserve_ids(ir: dict[str, Any], previous: Optional[dict[str, Any]]) -> dict[str, Any]:
    previous = previous or {}
    old_section = previous.get("section") or {}
    old_elements = previous.get("elements") or []
    old_by_key = {e.get("key"): e for e in old_elements if e.get("key")}

    section_id = old_section.get("sectionId") if old_section else None
    ir_section = ir.get("section") or {}
    ir_section["sectionId"] = section_id or ten_digit()
    ir_section["pageId"] = ir_section.get("pageId") or "home"
    ir_section["sectionType"] = ir_section.get("sectionType") or "split-hero"
    version = ir_section.get("version", 1)

    try:
        ir_section["version"] = int(float(version))
    except (TypeError, ValueError):
         ir_section["version"] = 1
    ir_section["status"] = ir_section.get("status") or "draft"
    ir_section["variation"] = ir_section.get("variation") or "midnight"
    ir_section["variations"] = ir_section.get("variations") or ["midnight", "sunrise"]

    elements = []
    for order, raw in enumerate(ir.get("elements") or [], start=1):
        key = str(raw.get("key") or f"field_{order}")
        old = old_by_key.get(key)
        element_id = old.get("elementId") if old else ten_digit()
        field_id = old.get("fieldId") if old else ten_digit()
        default = raw.get("defaultValue")
        content = raw.get("content")
        if default is None:
            default = content if content is not None else ""
        if content is None:
            content = default
        item = {
            "elementId": element_id,
            "sectionId": ir_section["sectionId"],
            "fieldId": field_id,
            "type": raw.get("type") or "text",
            "key": key,
            "label": raw.get("label") or key.replace("_", " ").title(),
            "defaultValue": default,
            "content": content,
            "editable": bool(raw.get("editable", True)),
            "required": bool(raw.get("required", False)),
            "binding": f"sections.{ir_section['sectionId']}.{field_id}",
            "order": order,
        }
        if raw.get("loop"):
            item["loop"] = True
            item["items"] = raw.get("items") or []
        elements.append(item)
    ir_section["elementIds"] = [e["elementId"] for e in elements]
    return {"section": ir_section, "elements": elements, "styleHint": ir.get("styleHint", "")}

def react_code(ir: dict[str, Any]) -> str:
    section = ir["section"]
    elements = ir["elements"]
    lines = [
        'import React from "react";',
        'import { useSelector } from "react-redux";',
        "",
        f'export default function GeneratedSection() {{',
        '  const elements = useSelector((state) => state.content.elements);',
        '  const get = (key) => elements.find((e) => e.key === key)?.content ?? "";',
        f'  // sectionId: "{section["sectionId"]}"',
        "  return (",
        f'    <section data-section-id="{section["sectionId"]}" className="generated-section">',
    ]
    for e in elements:
        if e["type"] == "cards":
            lines += [
                f'      <div data-field-id="{e["fieldId"]}" className="cards">',
                f'        {{elements.find((x) => x.key === "cards")?.items?.map((item, index) => (',
                f'          <article key={{index}}><strong>{{item.value}}</strong><span>{{item.label}}</span></article>',
                f'        ))}}',
                "      </div>",
            ]
        elif e["type"] == "image":
            lines.append(f'      <div data-field-id="{e["fieldId"]}" className="visual" aria-label={{get("visual")}} />')
        else:
            tag = "button" if e["type"] == "button" else ("span" if e["type"] == "badge" else "p")
            if e["key"] == "headline": tag = "h2"
            lines.append(f'      <{tag} data-field-id="{e["fieldId"]}>{{get("{e["key"]}")}}</{tag}>')
    lines += ["    </section>", "  );", "}"]
    return "\n".join(lines)

@app.get("/api/health")
def health():
    return {"ok": True, "service": "teachzen", "time": datetime.now(timezone.utc).isoformat(), "geminiConfigured": bool(os.getenv("GEMINI_API_KEY")), "model": os.getenv("GEMINI_MODEL", "gemini-3.7-flash")}

@app.get("/api/sections")
def list_sections():
    return read_store()

@app.get("/api/sections/{section_id}")
def get_section(section_id: str):
    store = read_store()
    for item in store["sections"]:
        if item["section"]["sectionId"] == section_id:
            return item
    raise HTTPException(404, "Section not found")

class SectionPayload(BaseModel):
    section: dict[str, Any]
    elements: list[dict[str, Any]]

@app.put("/api/sections/{section_id}")
def save_section(section_id: str, payload: SectionPayload):
    if payload.section.get("sectionId") != section_id:
        raise HTTPException(400, "sectionId does not match URL")
    store = read_store()
    doc = {"section": payload.section, "elements": payload.elements}
    found = False
    for i, item in enumerate(store["sections"]):
        if item["section"]["sectionId"] == section_id:
            store["sections"][i] = doc
            found = True
            break
    if not found:
        store["sections"].append(doc)
    write_store(store)
    return {"ok": True, **doc}

@app.post("/api/generate")
async def generate(
    prompt: str = Form(""),
    code: str = Form(""),
    previous_section: str = Form(""),
    wireframe: Optional[UploadFile] = File(None),
):
    previous = None
    if previous_section:
        try:
            previous = json.loads(previous_section)
        except json.JSONDecodeError:
            previous = None

    image_bytes = None
    image_type = None
    if wireframe:
        image_bytes = await wireframe.read()
        image_type = wireframe.content_type or "image/png"
        if len(image_bytes) > 8 * 1024 * 1024:
            raise HTTPException(413, "Wireframe is too large. Keep it under 8 MB.")

    mode = "fallback"
    try:
        if os.getenv("GEMINI_API_KEY"):
            ir = generate_with_gemini(prompt, code, image_bytes, image_type)
            mode = "gemini"
        else:
            ir = fallback_ir(prompt)
    except Exception as exc:
        # Never make the demo blank because of a model/network problem.
        ir = fallback_ir(prompt)
        mode = "fallback"
        ir["styleHint"] = f"{ir.get('styleHint','')} AI fallback used because Gemini returned an error: {type(exc).__name__}: {str(exc)[:180]}"

    final = preserve_ids(ir, previous)
    final["reactCode"] = react_code(final)
    final["generatedAt"] = datetime.now(timezone.utc).isoformat()

    store = read_store()
    store["sections"] = [x for x in store["sections"] if x["section"]["sectionId"] != final["section"]["sectionId"]]
    store["sections"].append({"section": final["section"], "elements": final["elements"]})
    write_store(store)

    return {"ok": True, "mode": mode, "warning": final.get("styleHint", "") if mode == "fallback" else "", **final}

# Optional single-service hosting after `npm run build` in frontend.
if FRONTEND_DIST.exists():
    from fastapi.staticfiles import StaticFiles
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

@app.get("/{full_path:path}")
def spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(404, "API route not found")
    index = FRONTEND_DIST / "index.html"
    if index.exists():
        return FileResponse(index)
    return {
        "service": "TeachZen",
        "message": "Frontend is not built. Run `cd frontend && npm install && npm run build`.",
        "api": "/docs",
    }
