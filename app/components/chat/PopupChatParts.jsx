"use client";

import { useRef, useState } from "react";

const MAX_ATTACHMENTS = 3;
const MAX_IMAGE_DIMENSION = 1400;
const IMAGE_COMPRESSION_QUALITY = 0.84;

function formatMessageTime(createdAt) {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderBoldText(text) {
  const parts = String(text || "").split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} style={{ color: "var(--text)", fontWeight: 800 }}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

async function optimizeImage(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(rawDataUrl);
  const maxSide = Math.max(img.naturalWidth || 0, img.naturalHeight || 0);
  const scale = maxSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxSide : 1;

  if (scale === 1 && file.size <= 900_000) {
    return {
      url: rawDataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
  canvas.height = Math.max(1, Math.round((img.naturalHeight || 1) * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      url: rawDataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let optimizedUrl = rawDataUrl;
  try {
    optimizedUrl = canvas.toDataURL("image/webp", IMAGE_COMPRESSION_QUALITY);
  } catch {
    try {
      optimizedUrl = canvas.toDataURL("image/jpeg", IMAGE_COMPRESSION_QUALITY);
    } catch {
      optimizedUrl = rawDataUrl;
    }
  }

  return {
    url: optimizedUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

async function createImageAttachment(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }

  const optimized = await optimizeImage(file);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "image",
    name: file.name || "image.png",
    url: optimized.url,
    width: optimized.width,
    height: optimized.height,
  };
}

export function buildChatMessage({ from, text = "", sender, attachments = [] }) {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    from,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    ...(sender ? { sender } : {}),
    ...(attachments.length ? { attachments } : {}),
  };
}

export function ChatMessageContent({ message, renderText }) {
  const attachments = Array.isArray(message?.attachments) ? message.attachments : [];
  const hasText = Boolean(message?.text?.trim());
  const timeLabel = formatMessageTime(message?.createdAt);

  return (
    <div className="claim-chat-bubble-inner">
      {hasText && (
        <div className="claim-chat-text">
          {typeof renderText === "function" ? renderText(message.text) : renderBoldText(message.text)}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="claim-chat-attachments">
          {attachments.map((attachment, index) => (
            <a
              key={attachment.id || `${attachment.url}-${index}`}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="claim-chat-attachment"
            >
              <img src={attachment.url} alt={attachment.name || "Attachment"} />
            </a>
          ))}
        </div>
      )}

      {timeLabel && <div className="claim-chat-time">{timeLabel}</div>}
    </div>
  );
}

export function PopupChatComposer({
  value,
  onChange,
  onSend,
  placeholder,
  sendLabel = "Send",
  disabled = false,
  sendButtonStyle,
}) {
  const [attachments, setAttachments] = useState([]);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const canSend = !disabled && (value.trim().length > 0 || attachments.length > 0);

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const remainingSlots = MAX_ATTACHMENTS - attachments.length;
    if (remainingSlots <= 0) {
      setError(`You can attach up to ${MAX_ATTACHMENTS} images.`);
      return;
    }

    setIsAddingImage(true);
    setError("");

    try {
      const nextAttachments = [];
      for (const file of files.slice(0, remainingSlots)) {
        nextAttachments.push(await createImageAttachment(file));
      }
      setAttachments(prev => [...prev, ...nextAttachments]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image could not be added.");
    } finally {
      setIsAddingImage(false);
    }
  }

  async function handleSend() {
    if (!canSend) return;
    const sent = await onSend({
      text: value.trim(),
      attachments,
    });
    if (sent === false) return;
    onChange("");
    setAttachments([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(id) {
    setAttachments(prev => prev.filter(item => item.id !== id));
    if (fileInputRef.current && attachments.length <= 1) fileInputRef.current.value = "";
  }

  function handlePaste(event) {
    const clipboard = event.clipboardData;
    if (!clipboard) return;

    const imageFiles = [];

    for (const file of Array.from(clipboard.files || [])) {
      if (file?.type?.startsWith("image/")) imageFiles.push(file);
    }

    for (const item of Array.from(clipboard.items || [])) {
      if (!item?.type?.startsWith("image/")) continue;
      const asFile = item.getAsFile?.();
      if (asFile) imageFiles.push(asFile);
    }

    if (imageFiles.length) {
      event.preventDefault();
      addFiles(imageFiles);
    }
  }

  return (
    <div className="claim-chat-composer-wrap">
      {(attachments.length > 0 || error) && (
        <div className="claim-chat-composer-top">
          {attachments.length > 0 && (
            <div className="claim-chat-preview-grid">
              {attachments.map(attachment => (
                <div key={attachment.id} className="claim-chat-preview-card">
                  <img src={attachment.url} alt={attachment.name || "Preview"} />
                  <button
                    type="button"
                    className="claim-chat-preview-remove"
                    onClick={() => removeAttachment(attachment.id)}
                    aria-label="Remove attachment"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          {error && <div className="claim-chat-helper error">{error}</div>}
        </div>
      )}

      <div className="claim-chat-input-row">
        <button
          type="button"
          className="claim-chat-tool-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isAddingImage}
          aria-label="Add image"
          title="Add image"
        >
          {isAddingImage ? "..." : "+"}
        </button>

        <div className="claim-chat-input-shell">
          <input
            className="claim-chat-input"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onPaste={handlePaste}
            placeholder={placeholder}
            autoFocus
          />
          <div className="claim-chat-input-hint">Paste image or click +</div>
        </div>

        <button
          type="button"
          className="claim-chat-send"
          onClick={handleSend}
          disabled={!canSend}
          style={sendButtonStyle}
        >
          {sendLabel}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={e => addFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
