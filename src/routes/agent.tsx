import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAccess } from "@/components/common/RequireAccess";
import { PageHeader, SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/common/States";
import { TxList } from "@/components/common/TxList";
import { initials } from "@/components/layout/UserMenu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession, type DemoUser } from "@/lib/demo-auth";
import { useI18n } from "@/lib/i18n";
import { AGENT_MAX_GRANT, getBalance, validateGrant } from "@/lib/points";
import { addTransaction, usePoints } from "@/lib/points-store";

export const Route = createFileRoute("/agent")({
  head: () => ({
    meta: [
      { title: "Agent panel — BITMAP" },
      { name: "description", content: "Manage assigned members and grant virtual points on BITMAP." },
      { property: "og:title", content: "Agent panel — BITMAP" },
      { property: "og:description", content: "Agent tools for managing members and virtual points." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <RequireAccess permission="view_agent_dashboard">{(u) => <AgentPanel agent={u} />}</RequireAccess>,
});

function AgentPanel({ agent }: { agent: DemoUser }) {
  const { t, fmtNumber, dir } = useI18n();
  const { users } = useSession();
  const { transactions } = usePoints(agent.id);
  // Admins see every member here; agents only their own.
  const members = users.filter((u) => u.role === "user" && (agent.role === "admin" || u.agentId === agent.id));
  const [targetId, setTargetId] = useState(members[0]?.id ?? "");
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const grants = transactions.filter((tx) => tx.byUserId === agent.id);

  const grant = (e: FormEvent) => {
    e.preventDefault();
    const target = members.find((m) => m.id === targetId);
    if (!target) return;
    const n = Number(amount);
    const err = validateGrant({
      actor: { id: agent.id, role: agent.role },
      target: { id: target.id, agentId: agent.role === "admin" ? agent.id : (target.agentId ?? null) },
      amount: n,
      currentBalance: getBalance(transactions, target.id),
    });
    if (err) return setError(t(`grant.err.${err}`));
    setError(null);
    addTransaction({ userId: target.id, amount: n, type: "agent_grant", byUserId: agent.id, ...(note.trim() ? { note: note.trim().slice(0, 80) } : {}) });
    toast.success(t("agent.grantDone", { n: fmtNumber(n), name: target.name }));
    setNote("");
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("agent.title")} subtitle={t("agent.sub")} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section>
          <SectionHeader title={`${t("agent.myUsers")} (${members.length})`} />
          {members.length ? (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {members.map((m) => (
                <li key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-surface-3 text-xs font-bold">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground" dir="ltr">
                      {m.email}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-bold tabular-nums text-gold">{fmtNumber(getBalance(transactions, m.id))}</p>
                    <p className={m.status === "active" ? "text-[11px] text-primary" : "text-[11px] text-live"}>{t(m.status === "active" ? "common.active" : "common.suspended")}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState />
          )}
        </section>

        <section>
          <SectionHeader title={t("agent.grant")} />
          <form onSubmit={grant} className="space-y-4 rounded-xl border border-border bg-surface p-4" noValidate>
            <div className="space-y-1.5">
              <Label>{t("agent.grantTo")}</Label>
              <Select value={targetId} onValueChange={setTargetId} dir={dir}>
                <SelectTrigger className="bg-surface-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-amount">{t("common.amount")}</Label>
              <Input id="g-amount" type="number" inputMode="numeric" dir="ltr" min={1} max={AGENT_MAX_GRANT} value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-surface-2" />
              <p className="text-xs text-muted-foreground">{t("agent.limit", { n: fmtNumber(AGENT_MAX_GRANT) })}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-note">{t("common.note")}</Label>
              <Input id="g-note" maxLength={80} value={note} onChange={(e) => setNote(e.target.value)} className="bg-surface-2" />
            </div>
            {error && (
              <p role="alert" className="text-sm text-live">
                {error}
              </p>
            )}
            <Button type="submit" variant="gold" className="w-full" disabled={!members.length}>
              {t("agent.grantBtn")}
            </Button>
          </form>
        </section>
      </div>
      <section>
        <SectionHeader title={t("agent.recentGrants")} />
        <TxList txs={grants} limit={10} />
      </section>
    </div>
  );
}
