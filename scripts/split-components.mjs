import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pagePath = path.join(root, "app/page.js");
const outDir = path.join(root, "app/components");
const lines = fs.readFileSync(pagePath, "utf8").split(/\r?\n/);

const chunks = [
  { name: "ui/TokenCoin.jsx", start: 407, end: 412 },
  { name: "ui/Logo.jsx", start: 414, end: 419 },
  { name: "withdraw/RobuxPanel.jsx", start: 421, end: 518, imports: 'import { useState } from "react";\nimport { TokenCoin } from "../ui/TokenCoin";\n' },
  { name: "withdraw/StockPanel.jsx", start: 520, end: 606, imports: 'import { useState, useEffect } from "react";\nimport { TokenCoin } from "../ui/TokenCoin";\n' },
  { name: "withdraw/WithdrawCategoryList.jsx", start: 608, end: 652, imports: 'import { WITHDRAW_CATEGORIES } from "@/lib/constants";\n' },
  { name: "support/SupportPage.jsx", start: 654, end: 727 },
  { name: "support/SupportChatModal.jsx", start: 729, end: 774, imports: 'import { useState, useEffect, useRef } from "react";\n' },
  { name: "admin/AdminPanel.jsx", start: 776, end: 1178, imports: 'import { useState, useEffect } from "react";\n' },
  { name: "pages/FaqPage.jsx", start: 1180, end: 1203 },
];

for (const c of chunks) {
  const body = lines.slice(c.start - 1, c.end).join("\n").replace(/^function /m, "export function ");
  const imports = c.imports || "";
  const out = `"use client";\n${imports}\n${body}\n`;
  const file = path.join(outDir, c.name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  console.log("wrote", c.name);
}
