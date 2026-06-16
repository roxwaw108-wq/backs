"use client";
import { useState, useEffect, useRef } from "react";
import { ClaimItemImage } from "../ui/ClaimItemImage";
import { ChatMessageContent, PopupChatComposer, buildChatMessage } from "../chat/PopupChatParts";

// ─── ADOPT ME BADGE CONFIG ────────────────────────────────────────────────────
const AM_BADGES = [
  { id: "mega",  label: "M", file: "mega.webp"  },
  { id: "neon",  label: "N", file: "neon.webp"  },
  { id: "fly",   label: "F", file: "fly.webp"   },
  { id: "ride",  label: "R", file: "ride.webp"  },
];

// Badge overlay component — resim üstüne sağ alta eklenir
export function AdoptMeBadges({ badges = [] }) {
  const active = AM_BADGES.filter(b => badges.includes(b.id));
  if (active.length === 0) return null;
  return (
    <div style={{
      position: "absolute", bottom: 3, right: 3,
      display: "flex", gap: 1, alignItems: "center",
    }}>
      {active.map(b => (
        <img
          key={b.id}
          src={`/icons/${b.file}`}
          alt={b.label}
          style={{ width: 14, height: 14, objectFit: "contain" }}
        />
      ))}
    </div>
  );
}

// Badge seçici (admin form içinde)
function BadgePicker({ badges, onChange }) {
  function toggle(id) {
    onChange(badges.includes(id) ? badges.filter(b => b !== id) : [...badges, id]);
  }
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      {AM_BADGES.map(b => {
        const on = badges.includes(b.id);
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => toggle(b.id)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "'Fredoka', sans-serif", fontSize: 12, fontWeight: 800,
              padding: "4px 10px", borderRadius: 7, cursor: "pointer",
              border: on ? "1.5px solid rgba(245,166,35,0.7)" : "1.5px solid var(--border)",
              background: on ? "rgba(245,166,35,0.12)" : "var(--surface2)",
              color: on ? "var(--cheap)" : "var(--text3)",
              transition: "all 0.15s",
            }}
          >
            <img src={`/icons/${b.file}`} alt={b.label} style={{ width: 14, height: 14, objectFit: "contain" }} />
            {b.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── DRAG & DROP HOOK ─────────────────────────────────────────────────────────
function useDragSort(items, onReorder) {
  const dragIdx = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  function onDragStart(i) { dragIdx.current = i; }
  function onDragEnter(i) { setDragOver(i); }
  function onDragEnd() {
    if (dragIdx.current === null || dragOver === null || dragIdx.current === dragOver) {
      dragIdx.current = null; setDragOver(null); return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(dragOver, 0, moved);
    onReorder(next);
    dragIdx.current = null; setDragOver(null);
  }

  return { dragOver, onDragStart, onDragEnter, onDragEnd };
}

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "giftcard", label: "Gift Cards", icon: "🎁" },
  { id: "adoptme",  label: "Adopt Me",   icon: "🐾" },
  { id: "mm2",      label: "MM2",        icon: "🔪" },
  { id: "limiteds", label: "Limiteds",   icon: "⭐" },
];

// ─── ITEM IMAGE WITH BADGES ───────────────────────────────────────────────────
function ItemImage({ image, name, badges = [], size = 36 }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <img
        src={`/icons/${image}`}
        alt={name}
        style={{ width: size, height: size, objectFit: "contain", borderRadius: 8, border: "1px solid var(--border)" }}
        onError={e => { e.target.style.opacity = "0.3"; }}
      />
      <AdoptMeBadges badges={badges} />
    </div>
  );
}

// ─── INLINE EDIT ROW ──────────────────────────────────────────────────────────
function EditRow({ item, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    name:     item.name,
    cost:     String(item.cost),
    image:    item.image,
    category: item.category,
    badges:   item.badges || [],
  });

  const field = (key, placeholder, type = "text") => (
    <input
      className="inp"
      type={type}
      placeholder={placeholder}
      value={draft[key]}
      onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
      style={{ padding: "6px 10px", fontSize: 12, width: "100%" }}
    />
  );

  return (
    <tr style={{ background: "rgba(245,166,35,0.04)" }}>
      <td style={{ textAlign: "center", color: "var(--text3)", fontSize: 16 }}>⠿</td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ItemImage image={draft.image} name={draft.name} badges={draft.badges} size={36} />
          {field("image", "image.png")}
        </div>
      </td>
      <td>
        <select
          className="inp"
          value={draft.category}
          onChange={e => setDraft(d => ({ ...d, category: e.target.value, badges: [] }))}
          style={{ padding: "6px 10px", fontSize: 12 }}
        >
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </td>
      <td>{field("name", "Item name")}</td>
      <td>{field("cost", "Cost", "number")}</td>
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {draft.category === "adoptme" && (
            <BadgePicker badges={draft.badges} onChange={v => setDraft(d => ({ ...d, badges: v }))} />
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-green" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => onSave({ ...item, ...draft, cost: Number(draft.cost) })}>✓ Save</button>
            <button style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 12, fontWeight: 800, background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border)", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }} onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── CATEGORY SECTION ─────────────────────────────────────────────────────────
function CategorySection({ cat, items, editingId, onEdit, onSave, onCancelEdit, onDelete, onReorder }) {
  const { dragOver, onDragStart, onDragEnter, onDragEnd } = useDragSort(items, onReorder);

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{cat.icon}</span>
        <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, fontSize: 15, color: "var(--text)", letterSpacing: "-0.01em" }}>{cat.label}</span>
        <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 11, fontWeight: 800, background: "var(--surface2)", color: "var(--text3)", border: "1px solid var(--border)", borderRadius: 20, padding: "2px 8px" }}>
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="req-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>⠿</th>
              <th>Image</th>
              <th>Category</th>
              <th>Name</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) =>
              editingId === item.id ? (
                <EditRow key={item.id} item={item} onSave={onSave} onCancel={onCancelEdit} />
              ) : (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragEnter={() => onDragEnter(i)}
                  onDragEnd={onDragEnd}
                  onDragOver={e => e.preventDefault()}
                  style={{ transition: "background 0.15s", background: dragOver === i ? "rgba(245,166,35,0.07)" : undefined, cursor: "grab" }}
                >
                  <td style={{ textAlign: "center", color: "var(--text3)", fontSize: 16, userSelect: "none" }}>⠿</td>
                  <td>
                    <ItemImage image={item.image} name={item.name} badges={item.badges || []} size={36} />
                  </td>
                  <td>
                    <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 11, fontWeight: 800, background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 8px" }}>
                      {CATEGORIES.find(c => c.id === item.category)?.icon} {item.category}
                    </span>
                  </td>
                  <td><span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 13, color: "var(--text)" }}>{item.name}</span></td>
                  <td><span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, color: "var(--cheap)" }}>{item.cost.toLocaleString()}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-amber" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => onEdit(item.id)}>✏️ Edit</button>
                      <button className="btn-red" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => onDelete(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
export function AdminPanel({ claims, withdrawals, tickets, onRefresh, adminUsername }) {
  const [adminTab, setAdminTab] = useState("overview");
  const [adminClaimChatId, setAdminClaimChatId] = useState(null);
  const [adminChatInput, setAdminChatInput] = useState("");
  const adminChatScrollRef = useRef(null);
  const [supportReplyStatus, setSupportReplyStatus] = useState({});
  const [adminSupportChatId, setAdminSupportChatId] = useState(null);
  const [adminSupportInput, setAdminSupportInput] = useState("");
  const adminSupportScrollRef = useRef(null);

  // ── Shop Items state ──────────────────────────────────────────────────────
  const [shopItems, setShopItems] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ category: "giftcard", name: "", cost: "", image: "", badges: [] });
  const adminClaimChat = claims.find(c => c._id === adminClaimChatId) || null;
  const adminSupportChat = tickets.find(t => t._id === adminSupportChatId) || null;

  useEffect(() => {
    fetch("/api/items").then(r => r.json()).then(data => setShopItems(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (adminChatScrollRef.current) adminChatScrollRef.current.scrollTop = adminChatScrollRef.current.scrollHeight;
  }, [adminClaimChat?.chatMessages, adminClaimChat?._id]);

  useEffect(() => {
    if (adminSupportScrollRef.current) adminSupportScrollRef.current.scrollTop = adminSupportScrollRef.current.scrollHeight;
  }, [adminSupportChat?.messages, adminSupportChat?._id]);

  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending");
  const readyClaims = claims.filter(c => c.status === "ready");
  const openTickets = tickets.filter(t => t.status === "pending" || t.status === "waiting_answer");

  async function confirmWithdrawal(id) { await fetch(`/api/withdrawals/${id}/confirm`, { method: "POST" }); onRefresh(); }
  async function declineWithdrawal(id) { await fetch(`/api/withdrawals/${id}/decline`, { method: "POST" }); onRefresh(); }

  async function markClaimComplete(id) {
    const sysMsg = buildChatMessage({ from: "system", text: "✓ Claim completed by moderator. This conversation is now closed." });
    await fetch(`/api/claims/${id}/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sysMsg) });
    await fetch(`/api/claims/${id}/complete`, { method: "POST" });
    setAdminClaimChatId(null); onRefresh();
  }

  async function sendAdminClaimMessage(payload) {
    if (!adminClaimChat) return false;
    const text = typeof payload?.text === "string" ? payload.text.trim() : adminChatInput.trim();
    const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
    if (!text && attachments.length === 0) return false;
    const modMsg = buildChatMessage({ from: "mod", text, sender: "ADMIN", attachments });
    const res = await fetch(`/api/claims/${adminClaimChat._id}/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(modMsg) });
    await res.json();
    setAdminChatInput(""); onRefresh();
    return true;
  }

  async function sendAdminSupportMessage(payload) {
    if (!adminSupportChat) return false;
    const text = typeof payload?.text === "string" ? payload.text.trim() : adminSupportInput.trim();
    const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
    if (!text && attachments.length === 0) return false;
    const modMsg = buildChatMessage({ from: "mod", text, sender: "ADMIN", attachments });
    const newStatus = supportReplyStatus[adminSupportChat._id] || "waiting_answer";
    const res = await fetch(`/api/tickets/${adminSupportChat._id}/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: modMsg, status: newStatus }) });
    await res.json();
    setAdminSupportInput("");
    onRefresh();
    return true;
  }

  // ── Shop helpers ──────────────────────────────────────────────────────────
  async function refreshShop() {
    const res = await fetch("/api/items");
    const data = await res.json();
    setShopItems(data);
  }

  async function addShopItem() {
    if (!newItem.name || !newItem.cost || !newItem.image) return;
    setShopLoading(true);
    await fetch("/api/admin/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, cost: Number(newItem.cost) }),
    });
    setNewItem({ category: "giftcard", name: "", cost: "", image: "", badges: [] });
    setShowAddForm(false);
    await refreshShop();
    setShopLoading(false);
  }

  async function saveEditItem(updated) {
    await fetch(`/api/admin/items?id=${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setEditingId(null);
    await refreshShop();
  }

  async function deleteShopItem(id) {
    await fetch(`/api/admin/items?id=${id}`, { method: "DELETE" });
    await refreshShop();
  }

  async function reorderCategory(catId, reordered) {
    setShopItems(prev => [...prev.filter(i => i.category !== catId), ...reordered]);
    await fetch("/api/admin/items/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: catId, ids: reordered.map(i => i.id) }),
    });
  }

  const sidebarItems = [
    { key: "overview",    icon: "📊", label: "Overview" },
    { key: "withdrawals", icon: "💸", label: "Withdrawals", badge: pendingWithdrawals.length },
    { key: "claims",      icon: "📦", label: "Claims",      badge: readyClaims.length },
    { key: "support",     icon: "🎫", label: "Support",     badge: openTickets.length },
    { key: "shopitems",   icon: "🛒", label: "Shop Items" },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid var(--border)", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 11, fontWeight: 800, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Panel</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4, fontWeight: 500 }}>@{adminUsername}</div>
        </div>
        {sidebarItems.map(item => (
          <div key={item.key} className={`admin-sidebar-item${adminTab === item.key ? " active" : ""}`} onClick={() => setAdminTab(item.key)}>
            <span>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge > 0 && <span style={{ background: "var(--red)", color: "#fff", fontFamily: "'Fredoka', sans-serif", fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 7px", minWidth: 18, textAlign: "center" }}>{item.badge}</span>}
          </div>
        ))}
      </div>

      <div className="admin-main">

        {/* ── OVERVIEW ── */}
        {adminTab === "overview" && (
          <div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 24 }}>Overview</div>
            {[
              { label: "Pending Withdrawals", val: pendingWithdrawals.length, color: "var(--cheap)" },
              { label: "Open Claims",         val: readyClaims.length,        color: "var(--gg)"   },
              { label: "Open Tickets",        val: openTickets.length,        color: "var(--red)"  },
            ].map(s => (
              <div key={s.label} className="admin-stat-card"><div className="admin-stat-val" style={{ color: s.color }}>{s.val}</div><div className="admin-stat-lbl">{s.label}</div></div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div className="admin-section-title">⏳ Recent Pending Withdrawals</div>
                <div className="card" style={{ overflow: "hidden" }}>
                  {pendingWithdrawals.length === 0 ? <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "var(--text3)" }}>All clear!</div> : pendingWithdrawals.slice(0, 5).map(w => (
                    <div key={w._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 13, color: "var(--text)" }}>@{w.account}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>R${w.amount?.toLocaleString()} · @{w.username}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => confirmWithdrawal(w._id)} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 12, fontWeight: 800, background: "rgba(79,255,176,0.1)", color: "var(--gg)", border: "1px solid rgba(79,255,176,0.25)", borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>Confirm</button>
                        <button onClick={() => declineWithdrawal(w._id)} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 12, fontWeight: 800, background: "rgba(220,38,38,0.1)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="admin-section-title">📦 Recent Open Claims</div>
                <div className="card" style={{ overflow: "hidden" }}>
                  {readyClaims.length === 0 ? <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "var(--text3)" }}>No open claims!</div> : readyClaims.slice(0, 5).map(c => (
                    <div key={c._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ flex: 1 }}><div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 13, color: "var(--text)" }}>{c.itemName}</div><div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>@{c.username}</div></div>
                      {(c.chatMessages || []).some(m => m.from === "user") && <span className="waiting-dot" />}
                      <button onClick={() => { setAdminClaimChatId(c._id); setAdminChatInput(""); }} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 12, fontWeight: 800, background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>Chat</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WITHDRAWALS ── */}
        {adminTab === "withdrawals" && (
          <div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 24 }}>Withdrawal Requests</div>
            <div className="card" style={{ overflow: "hidden" }}>
              {withdrawals.length === 0 ? <div style={{ padding: 40, textAlign: "center", fontSize: 14, color: "var(--text3)" }}>No withdrawal requests yet.</div> : (
                <table className="req-table">
                  <thead><tr><th>User</th><th>Amount</th><th>Account</th><th>Gamepass ID</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {withdrawals.map(w => (
                      <tr key={w._id}>
                        <td><span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: "var(--text)" }}>@{w.username}</span></td>
                        <td><span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, color: "var(--cheap)" }}>R${w.amount?.toLocaleString()}</span></td>
                        <td><span style={{ color: "var(--text2)" }}>@{w.account}</span></td>
                        <td><span style={{ color: "var(--text3)", fontSize: 12 }}>{w.gamepassId || "—"}</span></td>
                        <td style={{ color: "var(--text3)", fontSize: 12 }}>{w.createdAt?.split("T")[0]}</td>
                        <td>
                          {w.status === "pending"   && <span className="status-badge status-pending">⏳ Pending</span>}
                          {w.status === "completed" && <span className="status-badge status-completed">✓ Completed</span>}
                          {w.status === "declined"  && <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 11, fontWeight: 800, background: "rgba(220,38,38,0.12)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6, padding: "2px 8px" }}>✕ Declined</span>}
                        </td>
                        <td>
                          {w.status === "pending" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => confirmWithdrawal(w._id)} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 12, fontWeight: 800, background: "rgba(79,255,176,0.1)", color: "var(--gg)", border: "1px solid rgba(79,255,176,0.25)", borderRadius: 7, padding: "7px 14px", cursor: "pointer" }}>✓ Confirm</button>
                              <button onClick={() => declineWithdrawal(w._id)} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 12, fontWeight: 800, background: "rgba(220,38,38,0.1)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 7, padding: "7px 14px", cursor: "pointer" }}>✕ Decline</button>
                            </div>
                          ) : <span style={{ fontSize: 12, color: "var(--text3)" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── CLAIMS ── */}
        {adminTab === "claims" && (
          <div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 24 }}>Claims Management</div>
            {claims.length === 0 ? <div className="card" style={{ padding: 40, textAlign: "center", fontSize: 14, color: "var(--text3)" }}>No claims yet.</div> : claims.map(c => {
              const isClaimed = c.status === "claimed";
              return (
                <div key={c._id} className="admin-claim-row">
                  <div style={{ width: 4, alignSelf: "stretch", background: c.accent || "var(--cheap)", flexShrink: 0 }} />
                  <div style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "var(--surface2)", borderRight: "1px solid var(--border)", padding: 6 }}>
                    <ClaimItemImage itemImg={c.itemImg} itemName={c.itemName} size={44} />
                  </div>
                  <div style={{ flex: 1, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, fontSize: 14, color: "var(--text)" }}>{c.itemName}</div>
                      <span style={{ fontSize: 11, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, background: isClaimed ? "rgba(79,255,176,0.08)" : "rgba(245,166,35,0.1)", color: isClaimed ? "var(--gg)" : "var(--cheap)", border: isClaimed ? "1px solid rgba(79,255,176,0.2)" : "1px solid rgba(245,166,35,0.25)", borderRadius: 6, padding: "2px 8px" }}>{isClaimed ? "✓ Claimed" : "Ready"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>@{c.username} · {c.category}</div>
                  </div>
                  <div style={{ padding: "14px 18px", display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => { setAdminClaimChatId(c._id); setAdminChatInput(""); }} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 800, background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 9, padding: "8px 18px", cursor: "pointer" }}>Chat</button>
                    {!isClaimed && <button onClick={() => markClaimComplete(c._id)} className="btn-green" style={{ padding: "8px 16px", fontSize: 13 }}>✓ Complete</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SUPPORT ── */}
        {adminTab === "support" && (
          <div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 24 }}>Support Tickets</div>
            {tickets.length === 0 ? <div className="card" style={{ padding: 40, textAlign: "center", fontSize: 14, color: "var(--text3)" }}>No tickets yet.</div> : tickets.map(ticket => {
              const isOpen = ticket.status === "pending" || ticket.status === "waiting_answer";
              return (
                <div key={ticket._id} className="card" style={{ marginBottom: 14, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{ticket.reason}</div>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, fontFamily: "'Fredoka', sans-serif", background: isOpen ? "rgba(245,166,35,0.12)" : "rgba(79,255,176,0.08)", color: isOpen ? "var(--cheap)" : "var(--gg)", border: isOpen ? "1px solid rgba(245,166,35,0.3)" : "1px solid rgba(79,255,176,0.2)" }}>{ticket.status === "solved" ? "✓ Solved" : ticket.status === "waiting_answer" ? "⏳ Waiting Answer" : "⏳ Pending"}</span>
                      <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700 }}>@{ticket.username}</span>
                      <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, marginLeft: "auto" }}>{ticket.createdAt?.split("T")[0]}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>{ticket.desc}</div>
                  </div>
                  <div style={{ padding: "10px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => { setAdminSupportChatId(ticket._id); setSupportReplyStatus(prev => ({ ...prev, [ticket._id]: "waiting_answer" })); setAdminSupportInput(""); }} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 800, background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 9, padding: "8px 16px", cursor: "pointer" }}>Chat</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SHOP ITEMS ── */}
        {adminTab === "shopitems" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.02em" }}>Shop Items</div>
              <button className="btn-amber" style={{ padding: "9px 20px", fontSize: 13 }} onClick={() => { setShowAddForm(true); setNewItem({ category: "giftcard", name: "", cost: "", image: "", badges: [] }); }}>+ Add Item</button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                <div className="admin-section-title" style={{ marginBottom: 12 }}>New Item</div>
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 130px 1fr", gap: 10, marginBottom: 12 }}>
                  <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value, badges: [] })} className="inp">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                  <input placeholder="Item name" className="inp" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                  <input placeholder="Cost (tokens)" type="number" className="inp" value={newItem.cost} onChange={e => setNewItem({ ...newItem, cost: e.target.value })} />
                  <input placeholder="image.png" className="inp" value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} />
                </div>

                {/* Adopt Me badge picker */}
                {newItem.category === "adoptme" && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Badges</div>
                    <BadgePicker badges={newItem.badges} onChange={v => setNewItem(d => ({ ...d, badges: v }))} />
                  </div>
                )}

                {/* Preview */}
                {newItem.image && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <ItemImage image={newItem.image} name={newItem.name} badges={newItem.badges} size={44} />
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>Preview</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-amber" onClick={addShopItem} disabled={shopLoading || !newItem.name || !newItem.cost || !newItem.image}>{shopLoading ? "Adding…" : "Add Item"}</button>
                  <button style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 800, background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border)", borderRadius: 9, padding: "8px 16px", cursor: "pointer" }} onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Category sections */}
            {shopItems.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text3)", fontSize: 14 }}>No items yet. Add your first item above.</div>
            ) : (
              CATEGORIES.map(cat => (
                <CategorySection
                  key={cat.id}
                  cat={cat}
                  items={shopItems.filter(i => i.category === cat.id)}
                  editingId={editingId}
                  onEdit={id => setEditingId(id)}
                  onSave={saveEditItem}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={deleteShopItem}
                  onReorder={reordered => reorderCategory(cat.id, reordered)}
                />
              ))
            )}

            {shopItems.length > 1 && (
              <div style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", fontWeight: 500, marginTop: 8 }}>
                ⠿ Drag rows to reorder items within each category
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CLAIM CHAT MODAL ── */}
      {adminClaimChat && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAdminClaimChatId(null)}>
          <div className="claim-chat-modal popup-modal is-open">
            <div className="claim-chat-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ClaimItemImage itemImg={adminClaimChat.itemImg} itemName={adminClaimChat.itemName} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, fontSize: 15, color: "var(--text)" }}>{adminClaimChat.itemName}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>@{adminClaimChat.username} · {adminClaimChat.category}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {adminClaimChat.status !== "claimed" && <button onClick={() => markClaimComplete(adminClaimChat._id)} className="btn-green" style={{ padding: "7px 14px", fontSize: 12 }}>✓ Mark Complete</button>}
                  <button onClick={() => setAdminClaimChatId(null)} style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              </div>
            </div>
            <div className="claim-chat-messages" ref={adminChatScrollRef}>
              {(adminClaimChat.chatMessages || []).length === 0 && <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: "var(--text3)" }}>No messages yet.</div>}
              {(adminClaimChat.chatMessages || []).map((msg, i) => (
                <div key={msg.id || i} className={`claim-chat-message-row ${msg.from === "mod" ? "is-user" : msg.from === "system" ? "is-system" : "is-mod"} msg-fade`}>
                  {msg.from !== "system" && <div className="claim-chat-sender" style={{ textAlign: msg.from === "mod" ? "right" : "left" }}>{msg.from === "mod" ? "ADMIN" : `@${adminClaimChat.username}`}</div>}
                  <div className={`claim-chat-bubble ${msg.from === "mod" ? "user" : msg.from}`}>
                    <ChatMessageContent message={msg} />
                  </div>
                </div>
              ))}
            </div>
            {adminClaimChat.status === "claimed" ? (
              <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                <span style={{ fontSize: 13, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, color: "var(--gg)" }}>✓ This claim has been completed</span>
              </div>
            ) : (
              <PopupChatComposer
                value={adminChatInput}
                onChange={setAdminChatInput}
                onSend={sendAdminClaimMessage}
                placeholder="Reply as moderator..."
                sendLabel="Reply"
                sendButtonStyle={{ background: "var(--cheap)", color: "#fff" }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── SUPPORT CHAT MODAL ── */}
      {adminSupportChat && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAdminSupportChatId(null)}>
          <div className="claim-chat-modal popup-modal is-open">
            <div className="claim-chat-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎫</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, fontSize: 15, color: "var(--text)" }}>{adminSupportChat.reason}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>@{adminSupportChat.username} · {adminSupportChat.status}</div>
                </div>
                <button onClick={() => setAdminSupportChatId(null)} style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            </div>
            <div className="claim-chat-messages" ref={adminSupportScrollRef}>
              {adminSupportChat.desc && (
                <div className="claim-chat-message-row is-mod msg-fade">
                  <div className="claim-chat-sender">👤 {adminSupportChat.username}</div>
                  <div className="claim-chat-bubble mod">
                    <ChatMessageContent message={{ text: adminSupportChat.desc, createdAt: adminSupportChat.createdAt }} />
                  </div>
                </div>
              )}
              {(adminSupportChat.messages || []).map((msg, i) => (
                <div key={msg.id || i} className={`claim-chat-message-row ${msg.from === "mod" ? "is-user" : msg.from === "system" ? "is-system" : "is-mod"} msg-fade`}>
                  {msg.from !== "system" && <div className="claim-chat-sender" style={{ textAlign: msg.from === "mod" ? "right" : "left" }}>{msg.from === "mod" ? "ADMIN" : `@${adminSupportChat.username}`}</div>}
                  <div className={`claim-chat-bubble ${msg.from === "mod" ? "user" : msg.from}`}>
                    <ChatMessageContent message={msg} />
                  </div>
                </div>
              ))}
            </div>
            {adminSupportChat.status !== "solved" && (
              <>
                <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, color: "var(--text2)" }}>Status:</span>
                  <select value={supportReplyStatus[adminSupportChat._id] || "waiting_answer"} onChange={e => setSupportReplyStatus(prev => ({ ...prev, [adminSupportChat._id]: e.target.value }))} className="inp" style={{ width: "auto", padding: "6px 10px", fontSize: 13 }}>
                    <option value="waiting_answer">Waiting Answer</option>
                    <option value="solved">Solved</option>
                  </select>
                </div>
                <PopupChatComposer
                  value={adminSupportInput}
                  onChange={setAdminSupportInput}
                  onSend={sendAdminSupportMessage}
                  placeholder="Reply to the ticket..."
                  sendLabel="Reply"
                  sendButtonStyle={{ background: "var(--cheap)", color: "#fff" }}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
