import { useEffect, useRef, useState } from "react";
import api from "../api";

const DEFAULT_CFG = {
  brandName: "Chat with us",
  welcomeHeading: "Chat with us",
  welcomeTagline: "<p>Kumusta! Paano ka namin matutulungan ngayon?</p>",
  statusText: "Nandito kami",
  footnoteText: "Karaniwang sumasagot sa loob ng ilang minuto",
  accentColor: "#E8A33D",
  bgColor: "#1B2129",
  messagesBgColor: "#12151A",
  teal: "#5CC8C2",
  position: "bottom-right",
  size: "medium",
  bubbleType: "standard",
  enableGreeting: true,
  enableEmailCollect: false,
  allowMessagesAfterResolved: true,
  enableContinuityViaEmail: false,
  chips: [
    { label: "I-track ang order", msg: "Gusto kong i-track ang order ko" },
    { label: "Billing", msg: "May tanong ako tungkol sa billing" },
    { label: "Mag-report ng issue", msg: "May issue akong na-encounter" },
  ],
};

const SIZES = {
  small: { w: 280, h: 380 },
  medium: { w: 320, h: 440 },
  large: { w: 360, h: 500 },
};

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{hint}</div>}
      </div>
      <label style={{ position: "relative", display: "inline-block", width: 38, height: 22, flexShrink: 0, marginLeft: 12 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: checked ? "var(--pine)" : "#3a4149",
            borderRadius: 999,
            transition: "background .15s ease",
            cursor: "pointer",
          }}
          onClick={() => onChange(!checked)}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: checked ? 19 : 3,
              width: 16,
              height: 16,
              background: "#fff",
              borderRadius: "50%",
              transition: "left .15s ease",
            }}
          />
        </span>
      </label>
    </div>
  );
}

function RichTextEditor({ html, onChange }) {
  const ref = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML = html || "";
      initialized.current = true;
    }
  }, [html]);

  const exec = (cmd, value) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    onChange(ref.current.innerHTML);
  };

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) exec("createLink", url);
  };

  return (
    <div style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 4, padding: 6, background: "#232B35", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <button type="button" className="btn" style={{ padding: "4px 9px", fontWeight: 700 }} onClick={() => exec("bold")}>
          B
        </button>
        <button type="button" className="btn" style={{ padding: "4px 9px", fontStyle: "italic" }} onClick={() => exec("italic")}>
          I
        </button>
        <button type="button" className="btn" style={{ padding: "4px 9px" }} onClick={addLink}>
          🔗
        </button>
        <button type="button" className="btn" style={{ padding: "4px 9px" }} onClick={() => exec("undo")}>
          ↺
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        style={{ minHeight: 70, padding: "10px 12px", background: "#1B2129", color: "#EDEAE1", fontSize: 13, outline: "none" }}
      />
    </div>
  );
}

export default function WidgetSettings() {
  const [inboxes, setInboxes] = useState([]);
  const [inboxId, setInboxId] = useState("");
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/inboxes").then((res) => {
      setInboxes(res.data);
      if (res.data.length > 0) setInboxId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!inboxId) return;
    api.get(`/inboxes/${inboxId}`).then((res) => {
      setCfg({ ...DEFAULT_CFG, ...(res.data.widgetConfig || {}) });
    });
  }, [inboxId]);

  const set = (key, value) => {
    setCfg((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const setChip = (i, field, value) => {
    setCfg((prev) => {
      const chips = [...prev.chips];
      chips[i] = { ...chips[i], [field]: value };
      return { ...prev, chips };
    });
    setSaved(false);
  };

  const addChip = () => {
    setCfg((prev) => ({ ...prev, chips: [...prev.chips, { label: "Bagong chip", msg: "" }] }));
  };
  const removeChip = (i) => {
    setCfg((prev) => ({ ...prev, chips: prev.chips.filter((_, idx) => idx !== i) }));
  };

  const save = async () => {
    if (!inboxId) return;
    setSaving(true);
    try {
      await api.patch(`/inboxes/${inboxId}`, { widgetConfig: cfg });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const size = SIZES[cfg.size] || SIZES.medium;
  const isLeft = cfg.position === "bottom-left";

  return (
    <>
      <div className="topbar">
        <h1>Widget Settings</h1>
        {inboxes.length > 0 && (
          <select value={inboxId} onChange={(e) => setInboxId(e.target.value)} className="btn">
            {inboxes.map((ib) => (
              <option key={ib.id} value={ib.id}>
                {ib.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {inboxes.length === 0 && (
        <div style={{ padding: 20, color: "var(--muted)", fontSize: 13 }}>
          Wala ka pang inbox/channel. Gumawa muna ng isa sa Channels page.
        </div>
      )}

      {inboxId && (
        <div style={{ display: "flex", gap: 24, padding: 20, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 380px", display: "flex", flexDirection: "column", gap: 14 }}>
            <label>
              Brand name
              <input type="text" value={cfg.brandName} onChange={(e) => set("brandName", e.target.value)} style={inputStyle} />
            </label>

            <label>
              Welcome Heading
              <input type="text" value={cfg.welcomeHeading} onChange={(e) => set("welcomeHeading", e.target.value)} style={inputStyle} />
            </label>

            <div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>Welcome Tagline</div>
              <RichTextEditor html={cfg.welcomeTagline} onChange={(html) => set("welcomeTagline", html)} />
            </div>

            <label>
              Status text
              <input type="text" value={cfg.statusText} onChange={(e) => set("statusText", e.target.value)} style={inputStyle} />
            </label>
            <label>
              Footnote text
              <input type="text" value={cfg.footnoteText} onChange={(e) => set("footnoteText", e.target.value)} style={inputStyle} />
            </label>

            <div style={{ display: "flex", gap: 12 }}>
              <label style={{ flex: 1 }}>
                Accent color
                <input type="color" value={cfg.accentColor} onChange={(e) => set("accentColor", e.target.value)} style={{ ...inputStyle, height: 38, padding: 4 }} />
              </label>
              <label style={{ flex: 1 }}>
                Teal / highlight
                <input type="color" value={cfg.teal} onChange={(e) => set("teal", e.target.value)} style={{ ...inputStyle, height: 38, padding: 4 }} />
              </label>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <label style={{ flex: 1 }}>
                Panel background
                <input type="color" value={cfg.bgColor} onChange={(e) => set("bgColor", e.target.value)} style={{ ...inputStyle, height: 38, padding: 4 }} />
              </label>
              <label style={{ flex: 1 }}>
                Messages background
                <input type="color" value={cfg.messagesBgColor} onChange={(e) => set("messagesBgColor", e.target.value)} style={{ ...inputStyle, height: 38, padding: 4 }} />
              </label>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <label style={{ flex: 1 }}>
                Position
                <select value={cfg.position} onChange={(e) => set("position", e.target.value)} style={inputStyle}>
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                </select>
              </label>
              <label style={{ flex: 1 }}>
                Size
                <select value={cfg.size} onChange={(e) => set("size", e.target.value)} style={inputStyle}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
              <label style={{ flex: 1 }}>
                Bubble Type
                <select value={cfg.bubbleType} onChange={(e) => set("bubbleType", e.target.value)} style={inputStyle}>
                  <option value="standard">Standard</option>
                  <option value="expanded">Expanded</option>
                </select>
              </label>
            </div>

            <div>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Channel Preferences</div>
              <ToggleRow
                label="Enable channel greeting"
                hint="Auto-send ng welcome message pag nagsimula ng conversation ang customer."
                checked={cfg.enableGreeting}
                onChange={(v) => set("enableGreeting", v)}
              />
              <ToggleRow
                label="Enable email collect box"
                hint="Hihilingin sa customer ang email bago sila makapagsimula. (Kailangan pa ng karagdagang backend wiring.)"
                checked={cfg.enableEmailCollect}
                onChange={(v) => set("enableEmailCollect", v)}
              />
              <ToggleRow
                label="Allow messages after conversation resolved"
                hint="Kapag naka-off, hindi na makakapag-message ang customer kapag naka-'resolved' na ang usapan."
                checked={cfg.allowMessagesAfterResolved}
                onChange={(v) => set("allowMessagesAfterResolved", v)}
              />
              <ToggleRow
                label="Enable conversation continuity via email"
                hint="Magpapatuloy ang usapan sa email kung meron nang email ang contact. (Kailangan pa ng email-sending setup.)"
                checked={cfg.enableContinuityViaEmail}
                onChange={(v) => set("enableContinuityViaEmail", v)}
              />
            </div>

            <div>
              <div style={{ marginBottom: 6, fontSize: 13 }}>Quick reply chips</div>
              {cfg.chips.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input type="text" placeholder="Label" value={c.label} onChange={(e) => setChip(i, "label", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <input type="text" placeholder="Message" value={c.msg} onChange={(e) => setChip(i, "msg", e.target.value)} style={{ ...inputStyle, flex: 2 }} />
                  <button className="btn" onClick={() => removeChip(i)}>
                    ✕
                  </button>
                </div>
              ))}
              <button className="btn" onClick={addChip}>
                + Add chip
              </button>
            </div>

            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Sina-save..." : saved ? "Saved ✓" : "Save changes"}
            </button>
          </div>

          <div
            style={{
              flex: "0 0 auto",
              position: "relative",
              width: 420,
              height: 560,
              background: "#0b0e12",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 20,
                [isLeft ? "left" : "right"]: 20,
                width: size.w,
                height: size.h,
                background: cfg.bgColor,
                borderRadius: 14,
                boxShadow: "0 24px 60px rgba(0,0,0,.5)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <div style={{ padding: "14px 16px 12px", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#EDEAE1" }}>{cfg.brandName}</div>
                  <div style={{ fontSize: 11, color: "#A9A79E", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.teal }} />
                    {cfg.statusText}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: cfg.accentColor, border: `1px solid ${cfg.accentColor}55`, borderRadius: 6, padding: "3px 6px", height: "fit-content" }}>
                  BAGO
                </span>
              </div>
              <div style={{ flex: 1, background: cfg.messagesBgColor, padding: 14, display: "flex", flexDirection: "column" }}>
                {cfg.enableGreeting && (
                  <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                    <div style={{ fontSize: 9, color: cfg.teal, marginBottom: 3, textTransform: "uppercase" }}>AI Agent</div>
                    <div style={{ background: "#232B35", color: "#EDEAE1", padding: "9px 12px", borderRadius: 12, borderBottomLeftRadius: 4, fontSize: 12.5 }}>
                      <strong>{cfg.welcomeHeading}</strong>
                      <div dangerouslySetInnerHTML={{ __html: cfg.welcomeTagline }} />
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "0 14px 10px", background: cfg.messagesBgColor }}>
                {cfg.chips.map((c, i) => (
                  <span key={i} style={{ fontSize: 10.5, color: cfg.teal, border: `1px solid ${cfg.teal}55`, borderRadius: 999, padding: "4px 9px" }}>
                    {c.label}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, padding: 10, background: cfg.bgColor }}>
                <div style={{ flex: 1, background: "#232B35", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#6B7280" }}>
                  Mag-type ng mensahe…
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.accentColor }} />
              </div>
              <div style={{ textAlign: "center", fontSize: 9.5, color: "#6B7280", padding: "5px 0 8px", background: cfg.bgColor }}>
                {cfg.footnoteText}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 4,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,.12)",
  background: "#1B2129",
  color: "#EDEAE1",
  fontSize: 13,
};
