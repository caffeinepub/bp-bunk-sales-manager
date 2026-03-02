import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Loader2,
  TrendingDown,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppFooter } from "../components/app/AppFooter";
import { AppHeader } from "../components/app/AppHeader";
import { useActor } from "../hooks/useActor";
import type { CreditSettlement } from "../types";
import { formatCurrency, formatDate } from "../utils/calculations";

export function CreditSettledPage() {
  const { actor, isFetching } = useActor();
  const [amount, setAmount] = useState("");
  const [settleDate, setSettleDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({});
  const [saving, setSaving] = useState(false);

  const [creditRemaining, setCreditRemaining] = useState(0);
  const [totalGiven, setTotalGiven] = useState(0);
  const [settlements, setSettlements] = useState<CreditSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (isFetching || !actor) return;
    // refreshTick is used to trigger manual re-fetches after saving
    void refreshTick;

    let cancelled = false;
    setLoading(true);

    Promise.all([
      actor.getTotalOutstandingCredit(),
      actor.getCreditSettlements("0000-00-00", "9999-99-99"),
    ])
      .then(([outstanding, settlementsData]) => {
        if (cancelled) return;
        setCreditRemaining(outstanding);
        const totalSettledAmount = settlementsData.reduce(
          (s, c) => s + c.amountSettled,
          0,
        );
        setTotalGiven(outstanding + totalSettledAmount);
        const sorted = [...settlementsData].sort((a, b) =>
          b.date.localeCompare(a.date),
        );
        setSettlements(sorted);
      })
      .catch(() => {
        if (cancelled) return;
        setCreditRemaining(0);
        setTotalGiven(0);
        setSettlements([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, isFetching, refreshTick]);

  const validate = () => {
    const newErrors: { amount?: string; date?: string } = {};
    if (!amount || Number.parseFloat(amount) <= 0)
      newErrors.amount = "Enter a valid amount";
    if (!settleDate) newErrors.date = "Select a date";
    if (Number.parseFloat(amount) > creditRemaining) {
      newErrors.amount = `Amount exceeds credit remaining (${formatCurrency(creditRemaining)})`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!actor) {
      toast.error("Not connected. Please try again.");
      return;
    }

    setSaving(true);
    try {
      const parsedAmount = Number.parseFloat(amount);
      await actor.addCreditSettlement(settleDate, parsedAmount);
      toast.success(
        `Credit settlement of ${formatCurrency(parsedAmount)} recorded!`,
      );
      setAmount("");
      // Trigger data refresh
      setRefreshTick((t) => t + 1);
    } catch (err) {
      console.error("Failed to save settlement:", err);
      toast.error("Failed to record settlement. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const totalSettled = totalGiven - creditRemaining;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader title="Credit Settled" showBack />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Credit Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-xl p-4 shadow-bp-card border border-border">
            <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" />
              Total Credit Given
            </p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-display font-bold text-xl text-foreground">
                {formatCurrency(totalGiven)}
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-bp-card border border-border">
            <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
              Total Settled
            </p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-display font-bold text-xl text-primary">
                {formatCurrency(totalSettled)}
              </p>
            )}
          </div>
          <div
            className={`rounded-xl p-4 shadow-bp-card border ${creditRemaining > 0 ? "bg-destructive/10 border-destructive/20" : "bg-white border-border"}`}
          >
            <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Credit Remaining
            </p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <p
                className={`font-display font-bold text-xl ${creditRemaining > 0 ? "text-destructive" : "text-foreground"}`}
              >
                {formatCurrency(creditRemaining)}
              </p>
            )}
          </div>
        </motion.div>

        {/* Settlement Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-bp-card border border-border overflow-hidden"
        >
          <div className="bp-gradient px-6 py-4">
            <h2 className="font-display font-bold text-lg text-white">
              Record Credit Settlement
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {!loading && creditRemaining <= 0 && (
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                No outstanding credit to settle.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="settleAmount" className="font-semibold">
                  Amount Settled (₹)
                </Label>
                <Input
                  id="settleAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  className={`h-12 text-base ${errors.amount ? "border-destructive" : ""}`}
                  disabled={!loading && creditRemaining <= 0}
                />
                {errors.amount && (
                  <p className="text-destructive text-sm">{errors.amount}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="settleDate" className="font-semibold">
                  Settlement Date
                </Label>
                <Input
                  id="settleDate"
                  type="date"
                  value={settleDate}
                  onChange={(e) => {
                    setSettleDate(e.target.value);
                    setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  className={`h-12 text-base ${errors.date ? "border-destructive" : ""}`}
                />
                {errors.date && (
                  <p className="text-destructive text-sm">{errors.date}</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || (!loading && creditRemaining <= 0)}
              className="w-full h-12 font-bold bg-primary text-primary-foreground"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Record Settlement"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Settlement History */}
        {!loading && settlements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-bp-card border border-border overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-display font-bold text-base text-foreground">
                Settlement History
              </h3>
            </div>
            <div className="divide-y divide-border">
              {settlements.slice(0, 10).map((s) => (
                <div
                  key={String(s.id)}
                  className="px-6 py-3 flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {formatDate(s.date)}
                  </span>
                  <span className="font-semibold text-sm text-primary">
                    + {formatCurrency(s.amountSettled)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
