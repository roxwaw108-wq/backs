"use client";
import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { AdminPanel } from "../components/admin/AdminPanel";

export default function AdminPage() {
  const { adminClaims, adminWithdrawals, adminTickets, refreshAdminData, username, isAdmin } = useApp();

  useEffect(() => {
    if (isAdmin) refreshAdminData();
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <AdminPanel
      claims={adminClaims}
      withdrawals={adminWithdrawals}
      tickets={adminTickets}
      onRefresh={refreshAdminData}
      adminUsername={username}
    />
  );
}