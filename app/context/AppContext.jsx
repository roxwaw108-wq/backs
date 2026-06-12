"use client";
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { API, ADMIN_USERS, DEFAULT_TASKS, VALID_PROMO_CODES, EXPIRED_PROMO_CODES } from "@/lib/constants";

function getRefCode() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)cheapgg_ref=([^;]+)/);
  return m ? decodeURIComponent(m[1]).trim().toUpperCase() : null;
}

function buildTasks(completedTaskIds = []) {
  return DEFAULT_TASKS.map(t => ({
    ...t,
    visited: completedTaskIds.includes(t.id),
    claimed: completedTaskIds.includes(t.id),
  }));
}

function upsertById(list, item) {
  if (!item?._id) return list;
  const exists = list.some(entry => entry._id === item._id);
  if (exists) return list.map(entry => entry._id === item._id ? item : entry);
  return [item, ...list];
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [step, setStep] = useState("username");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [tokens, setTokens] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [liveEarnings, setLiveEarnings] = useState([]);
  const [sessionToken, setSessionToken] = useState(null);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);

  const [supportReason, setSupportReason] = useState("");
  const [supportDesc, setSupportDesc] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportMsg, setSupportMsg] = useState("");
  const [supportError, setSupportError] = useState(false);

  const chatScrollRef = useRef(null);
  const chatInputRef = useRef(null);

  const [affiliateCode, setAffiliateCode] = useState("");
  const [affiliateEditing, setAffiliateEditing] = useState(false);
  const [affiliateEditVal, setAffiliateEditVal] = useState("");
  const [affiliateStats, setAffiliateStats] = useState({ earnings: 0, users: [] });

  const [redeemModal, setRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState("");
  const [redeemError, setRedeemError] = useState(false);

  const [buyModal, setBuyModal] = useState(null);
  const [buyLoading, setBuyLoading] = useState(false);

  const [claimChatModal, setClaimChatModal] = useState(null);
  const [claimChatInput, setClaimChatInput] = useState("");
  const claimChatScrollRef = useRef(null);

  const [supportChatTicket, setSupportChatTicket] = useState(null);
  const [mutedUsers, setMutedUsers] = useState({});
  const [withdrawCategory, setWithdrawCategory] = useState(null);

  const [globalChat, setGlobalChat] = useState([]);
  const [claimsData, setClaimsData] = useState([]);
  const [robuxRequests, setRobuxRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [adminClaims, setAdminClaims] = useState([]);
  const [adminWithdrawals, setAdminWithdrawals] = useState([]);
  const [adminTickets, setAdminTickets] = useState([]);

  const [tasks, setTasks] = useState(DEFAULT_TASKS);

  const claimChatModalRef = useRef(null);
  const supportChatTicketRef = useRef(null);
  const userIdRef = useRef(null);

  useEffect(() => { claimChatModalRef.current = claimChatModal; }, [claimChatModal]);
  useEffect(() => { supportChatTicketRef.current = supportChatTicket; }, [supportChatTicket]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      document.cookie = `cheapgg_ref=${ref.toUpperCase()}; max-age=${60 * 60 * 24 * 30}; path=/`;
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/chat", { signal: ac.signal })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setGlobalChat(data); })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/live-earnings", { signal: ac.signal })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setLiveEarnings(data); })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const handler = ({ payload }) => {
      const { type, message, messages, item } = payload;
      if (type === 'chat:create' && message) {
        setGlobalChat(prev => {
          const next = [...prev, message];
          return next.slice(Math.max(0, next.length - 75));
        });
      }
      if (type === 'chat:refresh' && Array.isArray(messages)) {
        setGlobalChat(messages);
      }
      if (type === 'live:create' && item) {
        setLiveEarnings(prev => [item, ...prev].slice(0, 15));
      }
    };

    const chatChannel = supabase
      .channel('chat')
      .on('broadcast', { event: 'update' }, handler)
      .subscribe();

    const liveChannel = supabase
      .channel('live-earnings')
      .on('broadcast', { event: 'update' }, handler)
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(liveChannel);
    };
  }, []);

  useEffect(() => {
    if (!supabase || !userId) return;

    const userChannel = supabase.channel(`user-${userId}`)
      .on('broadcast', { event: 'update' }, ({ payload }) => {
        const { type, claim, withdrawal, ticket, balance, tasksCompleted: newTasksCompleted } = payload;
        const uid = userIdRef.current;
        if (!uid) return;

        if (type === 'claims:create' && claim) {
          setClaimsData(prev => [claim, ...prev].slice(0, 75));
          if (typeof balance === 'number') {
            setTokens(balance);
            const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "{}");
            localStorage.setItem("cheapgg_session", JSON.stringify({ ...saved, tokens: balance }));
          }
        }

        if (type === 'claims:update' && claim) {
          setClaimsData(prev => prev.map(p => p._id === claim._id ? claim : p));
          const modal = claimChatModalRef.current;
          if (modal?._id && modal._id === claim._id) {
            const prevMsgs = JSON.stringify(modal.chatMessages ?? []);
            const nextMsgs = JSON.stringify(claim.chatMessages ?? []);
            if (prevMsgs !== nextMsgs || claim.status !== modal.status) setClaimChatModal(claim);
          }
        }

        if (type === 'withdrawals:create' && withdrawal) {
          setRobuxRequests(prev => [withdrawal, ...prev]);
          if (typeof balance === 'number') setTokens(balance);
        }
        if (type === 'withdrawals:update' && withdrawal) {
          setRobuxRequests(prev => prev.map(p => p._id === withdrawal._id ? withdrawal : p));
        }

        if (type === 'tickets:create' && ticket) {
          setConversations(prev => upsertById(prev, ticket));
        }
        if (type === 'tickets:update' && ticket) {
          setConversations(prev => upsertById(prev, ticket));
          const t = supportChatTicketRef.current;
          if (t?._id && t._id === ticket._id) {
            const prevMsgs = JSON.stringify(t.messages ?? []);
            const nextMsgs = JSON.stringify(ticket.messages ?? []);
            if (prevMsgs !== nextMsgs || ticket.status !== t.status) setSupportChatTicket(ticket);
          }
        }

        if (type === 'balance:update' && typeof balance === 'number') {
          setTokens(balance);
          if (typeof newTasksCompleted === 'number') setTasksCompleted(newTasksCompleted);
          const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "{}");
          localStorage.setItem("cheapgg_session", JSON.stringify({
            ...saved,
            tokens: balance,
            ...(typeof newTasksCompleted === 'number' && { tasksCompleted: newTasksCompleted }),
          }));
        }
      })
      .subscribe();

    let adminChannel = null;
    if (isAdmin) {
      adminChannel = supabase.channel('admin')
        .on('broadcast', { event: 'update' }, ({ payload }) => {
          const { type, claim, withdrawal, ticket } = payload;
          if (type === 'adminClaims:create' && claim) setAdminClaims(prev => [claim, ...prev]);
          if (type === 'adminClaims:update' && claim) setAdminClaims(prev => prev.map(p => p._id === claim._id ? claim : p));
          if (type === 'adminWithdrawals:create' && withdrawal) setAdminWithdrawals(prev => [withdrawal, ...prev]);
          if (type === 'adminWithdrawals:update' && withdrawal) setAdminWithdrawals(prev => prev.map(p => p._id === withdrawal._id ? withdrawal : p));
          if (type === 'adminTickets:create' && ticket) setAdminTickets(prev => [ticket, ...prev]);
          if (type === 'adminTickets:update' && ticket) setAdminTickets(prev => prev.map(p => p._id === ticket._id ? ticket : p));
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(userChannel);
      if (adminChannel) supabase.removeChannel(adminChannel);
    };
  }, [userId, isAdmin]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [globalChat]);

  useEffect(() => {
    if (claimChatScrollRef.current) claimChatScrollRef.current.scrollTop = claimChatScrollRef.current.scrollHeight;
  }, [claimChatModal?.chatMessages, claimChatModal?._id]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "null");
    if (!saved) return;
    setLoggedIn(true);
    setUserId(saved.userId);
    setUsername(saved.username);
    setDisplayName(saved.displayName);
    setAvatarUrl(saved.avatarUrl);
    setTokens(saved.tokens ?? 0);
    setTasksCompleted(saved.tasksCompleted ?? 0);
    if (saved.affiliateCode) {
      setAffiliateCode(saved.affiliateCode);
      setAffiliateEditVal(saved.affiliateCode);
    }
    if (saved.sessionToken) setSessionToken(saved.sessionToken);
    setIsAdmin(ADMIN_USERS.map(a => a.toLowerCase()).includes((saved.username || "").toLowerCase()));
    const ids = saved.completedTaskIds ?? [];
    setCompletedTaskIds(ids);
    setTasks(buildTasks(ids));
  }, []);

  // Supabase'den taze veri çeken effect — login sonrası ve refresh için
  useEffect(() => {
    if (!loggedIn || !userId) return;
    const ac = new AbortController();
    fetch(`${API}/user?userId=${userId}`, { signal: ac.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const ids = data.completedTaskIds ?? [];
        setCompletedTaskIds(ids);
        setTasks(buildTasks(ids));
        setTokens(data.balance ?? 0);
        setTasksCompleted(data.tasksCompleted ?? 0);
        if (data.sessionToken) setSessionToken(data.sessionToken);
        const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "{}");
        localStorage.setItem("cheapgg_session", JSON.stringify({
          ...saved,
          tokens: data.balance ?? 0,
          tasksCompleted: data.tasksCompleted ?? 0,
          completedTaskIds: ids,
          ...(data.sessionToken && { sessionToken: data.sessionToken }),
        }));
      })
      .catch(() => {});
    return () => ac.abort();
  }, [loggedIn, userId]);

  useEffect(() => {
    if (!loggedIn || !affiliateCode) return;
    const ac = new AbortController();
    fetch(`/api/affiliate?code=${encodeURIComponent(affiliateCode)}`, { signal: ac.signal })
      .then(r => r.json())
      .then(data => setAffiliateStats({ earnings: data.earnings ?? 0, users: data.users ?? [] }))
      .catch(() => {});
    return () => ac.abort();
  }, [loggedIn, affiliateCode]);

  useEffect(() => {
    if (!userId) return;
    const ac = new AbortController();
    fetch(`/api/withdrawals?userId=${userId}`, { signal: ac.signal })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setRobuxRequests(data); })
      .catch(() => {});
    return () => ac.abort();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const ac = new AbortController();
    fetch(`/api/claims?userId=${userId}`, { signal: ac.signal })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setClaimsData(data); })
      .catch(() => {});
    return () => ac.abort();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const ac = new AbortController();
    fetch(`/api/tickets?userId=${userId}`, { signal: ac.signal })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setConversations(data); })
      .catch(() => {});
    return () => ac.abort();
  }, [userId]);

  // Supabase'den kullanıcıyı yeniden çeken fonksiyon (social claim sonrası vs.)
  const refreshUser = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/user?userId=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      const ids = data.completedTaskIds ?? [];
      setCompletedTaskIds(ids);
      setTasks(buildTasks(ids));
      setTokens(data.balance ?? 0);
      setTasksCompleted(data.tasksCompleted ?? 0);
      if (data.sessionToken) setSessionToken(data.sessionToken);
      const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "{}");
      localStorage.setItem("cheapgg_session", JSON.stringify({
        ...saved,
        tokens: data.balance ?? 0,
        tasksCompleted: data.tasksCompleted ?? 0,
        completedTaskIds: ids,
        ...(data.sessionToken && { sessionToken: data.sessionToken }),
      }));
    } catch {}
  }, [userId]);

  function saveSession(data) {
    localStorage.setItem("cheapgg_session", JSON.stringify(data));
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      "x-session-token": sessionToken || "",
    };
  }

  function openLoginModal() { resetLoginModal(); setLoginModal(true); }
  function closeLoginModal() { setLoginModal(false); }
  function openRedeemModal() { setRedeemModal(true); }
  function resetLoginModal() {
    setStep("username"); setLoading(false); setErrorMsg(""); setSuccessMsg("");
    setUsername(""); setUserId(null); setDisplayName(""); setAvatarUrl("");
    setVerifyCode(""); setCopied(false);
  }

  function logout() {
    localStorage.removeItem("cheapgg_session");
    setLoggedIn(false); setTokens(0); setTasksCompleted(0); setIsAdmin(false);
    setSessionToken(null);
    setCompletedTaskIds([]);
    setClaimsData([]); setRobuxRequests([]); setConversations([]);
    setTasks(DEFAULT_TASKS.map(t => ({ ...t, visited: false, claimed: false })));
    resetLoginModal();
    router.push("/");
  }

  const refreshAdminData = useCallback(() => {
    fetch("/api/claims").then(r => r.json()).then(data => { if (Array.isArray(data)) setAdminClaims(data); }).catch(() => {});
    fetch("/api/withdrawals").then(r => r.json()).then(data => { if (Array.isArray(data)) setAdminWithdrawals(data); }).catch(() => {});
    fetch("/api/tickets").then(r => r.json()).then(data => { if (Array.isArray(data)) setAdminTickets(data); }).catch(() => {});
  }, []);

  async function fetchUser() {
    if (!username.trim()) return setErrorMsg("Please enter a username!");
    setErrorMsg(""); setLoading(true);
    try {
      const res = await fetch(`${API}/roblox?username=${encodeURIComponent(username.trim())}`);
      const data = await res.json();
      if (!data || !data.Id) return setErrorMsg("User not found!");
      setUserId(data.Id); setDisplayName(data.Username); setAvatarUrl(data.AvatarUrl ?? "");
      setVerifyCode("CG-" + Math.random().toString(36).substring(2, 8).toUpperCase());
      setStep("verify");
    } catch (err) { setErrorMsg("Connection error: " + err.message); }
    finally { setLoading(false); }
  }

  async function checkBio() {
    setLoading(true); setErrorMsg("");
    try {
      const bioRes = await fetch(`${API}/roblox?userId=${userId}`);
      const bioUser = await bioRes.json();
      if (bioUser.description && bioUser.description.includes(verifyCode)) {
        setSuccessMsg("Verification successful!");
        const ref = getRefCode();
        const refParam = ref ? `&refCode=${encodeURIComponent(ref)}` : "";
        const userRes = await fetch(`${API}/user?userId=${userId}&username=${username}&displayName=${displayName}&avatarUrl=${encodeURIComponent(avatarUrl)}${refParam}`);
        const userData = await userRes.json();
        const newTokens = userData.balance ?? 0;
        const newTasksCompleted = userData.tasksCompleted ?? 0;
        const ids = userData.completedTaskIds ?? [];
        setCompletedTaskIds(ids);
        setTasks(buildTasks(ids));
        setTokens(newTokens);
        setTasksCompleted(newTasksCompleted);
        setSessionToken(userData.sessionToken ?? null);
        setIsAdmin(ADMIN_USERS.map(a => a.toLowerCase()).includes(username.toLowerCase()));
        if (userData.affiliateCode) {
          setAffiliateCode(userData.affiliateCode);
          setAffiliateEditVal(userData.affiliateCode);
        }
        saveSession({
          userId, username, displayName, avatarUrl,
          tokens: newTokens,
          tasksCompleted: newTasksCompleted,
          completedTaskIds: ids,
          affiliateCode: userData.affiliateCode || affiliateCode,
          redeemedCodes: userData.redeemedCodes || [],
          sessionToken: userData.sessionToken ?? null,
        });
        if (ref) document.cookie = "cheapgg_ref=; max-age=0; path=/";
        setTimeout(() => { closeLoginModal(); setLoggedIn(true); router.push("/"); }, 800);
      } else { setErrorMsg("Code not found in bio!"); }
    } catch (err) { setErrorMsg("Connection error: " + err.message); }
    finally { setLoading(false); }
  }

  function copyCode() { navigator.clipboard.writeText(verifyCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  function handleVisit(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.visited) return;
    setTasks(tasks.map(t => t.id === taskId ? { ...t, visited: true } : t));
  }

  async function handleClaim(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.visited || task.claimed) return;
    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId, taskId, reward: Number(task.reward) }),
      });
      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (resData.error === "Task already completed") {
          const ids = resData.completedTaskIds ?? [...tasks.filter(t => t.claimed).map(t => t.id), taskId];
          setCompletedTaskIds(ids);
          setTasks(buildTasks(ids));
          const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "{}");
          saveSession({ ...saved, completedTaskIds: ids });
        } else {
          setErrorMsg(resData.error || "Claim failed. Please try again.");
        }
        return;
      }
      const newTokens = resData.balance ?? tokens + task.reward;
      const newTasksCompleted = resData.tasksCompleted ?? tasksCompleted + 1;
      const ids = resData.completedTaskIds ?? [...tasks.filter(t => t.claimed).map(t => t.id), taskId];
      setCompletedTaskIds(ids);
      setTokens(newTokens);
      setTasks(buildTasks(ids));
      setTasksCompleted(newTasksCompleted);
      const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "{}");
      saveSession({ ...saved, tokens: newTokens, tasksCompleted: newTasksCompleted, completedTaskIds: ids });
    } catch {
      setErrorMsg("Claim failed. Please try again.");
    }
  }

  async function submitSupport() {
    if (supportLoading) return;
    const hasOpen = conversations.some(t => t.status !== "solved");
    if (hasOpen) {
      setSupportMsg("You already have an open ticket. Please wait for it to be resolved.");
      setSupportError(true);
      return;
    }
    setSupportMsg(""); setSupportError(false);
    if (!supportReason) { setSupportMsg("Please select a reason."); setSupportError(true); return; }
    if (!supportDesc.trim() || supportDesc.trim().length < 10) { setSupportMsg("Please describe your issue (min 10 chars)."); setSupportError(true); return; }
    setSupportLoading(true);
    try {
      const newTicket = { userId, username, displayName, reason: supportReason, desc: supportDesc.trim() };
      const res = await fetch("/api/tickets", { method: "POST", headers: authHeaders(), body: JSON.stringify(newTicket) });
      if (!res.ok) throw new Error("Failed to submit ticket");
      const ticket = await res.json();
      setConversations(prev => {
        if (prev.some(t => t._id === ticket._id)) return prev;
        return [ticket, ...prev];
      });
      setSupportReason(""); setSupportDesc("");
      setSupportMsg("Ticket submitted! We will reply within 24 hours.");
      setSupportError(false);
    } catch {
      setSupportMsg("Something went wrong. Please try again.");
      setSupportError(true);
    } finally {
      setSupportLoading(false);
    }
  }

  const sendGlobalChat = useCallback(async () => {
    if (!loggedIn) return;
    const val = chatInputRef.current?.value?.trim();
    if (!val) return;
    if (chatInputRef.current) chatInputRef.current.value = "";
    if (isAdmin) {
      const muteMatch = val.match(/^!mute\s+(\S+)\s+(\d+)$/i);
      if (muteMatch) {
        const targetUser = muteMatch[1].toLowerCase();
        const seconds = parseInt(muteMatch[2]);
        setMutedUsers(prev => ({ ...prev, [targetUser]: Date.now() + seconds * 1000 }));
        await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: "🔇 System", avatarUrl: "", text: `${targetUser} has been muted for ${seconds} seconds.`, time: new Date().toTimeString().slice(0, 5), isSystem: true }) });
        return;
      }
      const purgeMatch = val.match(/^!purge\s+(\d+)$/i);
      if (purgeMatch) {
        await fetch("/api/chat/purge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: parseInt(purgeMatch[1]) }) });
        return;
      }
    }
    const myMuteUntil = mutedUsers[username?.toLowerCase()];
    if (myMuteUntil && Date.now() < myMuteUntil) {
      const remaining = Math.ceil((myMuteUntil - Date.now()) / 1000);
      if (chatInputRef.current) chatInputRef.current.placeholder = `Muted for ${remaining}s...`;
      return;
    }
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: displayName, avatarId: userId, avatarUrl, text: val, time: timeStr, tokens }) });
  }, [loggedIn, displayName, userId, avatarUrl, isAdmin, username, mutedUsers, tokens]);

  async function submitRedeem() {
    setRedeemMsg(""); setRedeemError(false);
    if (!loggedIn) { setRedeemMsg("Please sign in first."); setRedeemError(true); return; }
    if (!redeemCode.trim()) { setRedeemMsg("Please enter a code."); setRedeemError(true); return; }
    const code = redeemCode.trim().toUpperCase();
    if (EXPIRED_PROMO_CODES.includes(code)) { setRedeemMsg("This code has expired."); setRedeemError(true); return; }
    const promo = VALID_PROMO_CODES[code];
    if (!promo) { setRedeemMsg("Invalid code."); setRedeemError(true); return; }
    const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "{}");
    if ((saved.redeemedCodes || []).includes(code)) { setRedeemMsg("You have already redeemed this code."); setRedeemError(true); return; }
    setRedeemLoading(true);
    try {
      const res = await fetch(`${API}/user`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ userId, redeemCode: code, reward: promo.reward }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRedeemMsg(data.error === "already_redeemed" ? "You have already redeemed this code." : "Invalid code.");
        setRedeemError(true);
        return;
      }
      const newTokens = data.balance ?? tokens + promo.reward;
      const redeemedCodes = data.redeemedCodes || [...(saved.redeemedCodes || []), code];
      setTokens(newTokens);
      saveSession({ ...saved, tokens: newTokens, tasksCompleted, affiliateCode, redeemedCodes });
      setRedeemMsg(`Code redeemed! +${promo.reward.toLocaleString()} tokens added.`);
      setRedeemError(false);
      setRedeemCode("");
    } catch {
      setRedeemMsg("Invalid code.");
      setRedeemError(true);
    } finally {
      setRedeemLoading(false);
    }
  }

  async function saveAffiliateCode() {
    const cleaned = affiliateEditVal.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!cleaned || !userId) return;
    try {
      const res = await fetch(`${API}/affiliate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId, username, code: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setErrorMsg(data.error || "This code is already taken");
          setTimeout(() => setErrorMsg(""), 3000);
        }
        setAffiliateEditing(false);
        return;
      }
      setAffiliateCode(data.code || cleaned);
      setAffiliateEditing(false);
      const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "{}");
      saveSession({ ...saved, affiliateCode: data.code || cleaned });
    } catch {
      setAffiliateEditing(false);
    }
  }

  async function confirmBuy() {
    if (!buyModal) return;
    setBuyLoading(true);
    try {
      const { item, cat } = buyModal;
      const newClaim = { userId, username, category: cat.title, catId: cat.id, itemName: item.name, itemImg: item.image, amount: item.cost, accent: cat.accent };
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(newClaim)
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Purchase failed:", err.error);
        return;
      }
      const data = await res.json();
      setTokens(data.balance);
      const saved = JSON.parse(localStorage.getItem("cheapgg_session") || "{}");
      saveSession({ ...saved, tokens: data.balance });
      setBuyModal(null);
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setBuyLoading(false);
    }
  }

  function openClaimChat(claim) { setClaimChatModal(claim); setClaimChatInput(""); }
  function closeClaimChat() { setClaimChatModal(null); setClaimChatInput(""); }

  async function sendClaimMessage(payload) {
    if (!claimChatModal) return false;
    const text = typeof payload === "string"
      ? payload.trim()
      : typeof payload?.text === "string"
        ? payload.text.trim()
        : claimChatInput.trim();
    const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
    if (!text && attachments.length === 0) return false;
    const userMsg = {
      id: Date.now(),
      from: "user",
      text,
      createdAt: new Date().toISOString(),
      ...(attachments.length ? { attachments } : {}),
    };
    try {
      const res = await fetch(`/api/claims/${claimChatModal._id}/message`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(userMsg)
      });
      if (!res.ok) throw new Error("API error");
      const updated = await res.json();
      setClaimChatModal(updated);
      setClaimsData(prev => prev.map(c => c._id === updated._id ? updated : c));
      setClaimChatInput("");
      return true;
    } catch (err) { console.error("Message could not be sent:", err); }
    return false;
  }

  function renderChatText(text) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i} style={{ color: "var(--text)", fontFamily: "'Fredoka', sans-serif" }}>{p}</strong> : p);
  }

  function updateTicketInState(updated) {
    setConversations(prev => upsertById(prev, updated));
    if (supportChatTicket?._id === updated._id) setSupportChatTicket(updated);
  }

  const value = {
    loggedIn, setLoggedIn, userId, username, displayName, avatarUrl, tokens, setTokens,
    tasksCompleted, setTasksCompleted, isAdmin, tasks, setTasks,
    liveEarnings,
    completedTaskIds, refreshUser,
    affiliateCode, setAffiliateCode, affiliateEditing, setAffiliateEditing,
    affiliateEditVal, setAffiliateEditVal, affiliateStats, setAffiliateStats,
    supportReason, setSupportReason, supportDesc, setSupportDesc,
    supportLoading, supportMsg, supportError,
    globalChat, claimsData, robuxRequests, conversations,
    adminClaims, adminWithdrawals, adminTickets,
    withdrawCategory, setWithdrawCategory,
    buyModal, setBuyModal, buyLoading,
    claimChatModal, claimChatInput, setClaimChatInput, claimChatScrollRef,
    supportChatTicket, setSupportChatTicket,
    loginModal, step, loading, errorMsg, successMsg, copied, verifyCode,
    setUsername, setStep, setErrorMsg,
    redeemModal, setRedeemModal, redeemCode, setRedeemCode, redeemLoading, redeemMsg, redeemError,
    chatScrollRef, chatInputRef,
    sessionToken, authHeaders,
    saveSession, logout, openLoginModal, closeLoginModal, openRedeemModal,
    fetchUser, checkBio, copyCode, handleVisit, handleClaim, submitSupport,
    sendGlobalChat, submitRedeem, saveAffiliateCode, confirmBuy,
    openClaimChat, closeClaimChat, sendClaimMessage, renderChatText,
    updateTicketInState, refreshAdminData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
