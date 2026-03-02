import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  CreditCard,
  FileEdit,
  Fuel,
  Loader2,
  Plus,
  Printer,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppFooter } from "../components/app/AppFooter";
import { AppHeader } from "../components/app/AppHeader";
import { useBunkSetup } from "../contexts/BunkSetupContext";
import { useActor } from "../hooks/useActor";
import type { DaySales } from "../types";
import { calculateDaySales, formatCurrency } from "../utils/calculations";

interface TileProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value?: string;
  onClick: () => void;
  variant: "blue" | "yellow" | "dark";
  delay?: number;
}

function Tile({
  icon,
  title,
  subtitle,
  value,
  onClick,
  variant,
  delay = 0,
}: TileProps) {
  const variantClasses = {
    blue: "bp-gradient text-white",
    yellow: "bp-yellow-gradient text-foreground",
    dark: "bg-bp-blue-dark text-white",
  };

  const subtitleClasses = {
    blue: "text-blue-200",
    yellow: "text-foreground/70",
    dark: "text-blue-200",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      onClick={onClick}
      type="button"
      className={`relative rounded-2xl p-6 text-left w-full shadow-bp-card tile-hover cursor-pointer ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${variant === "yellow" ? "bg-white/40" : "bg-white/15"}`}
        >
          {icon}
        </div>
        {value && (
          <span
            className={`text-sm font-bold px-2 py-1 rounded-lg ${variant === "yellow" ? "bg-white/30" : "bg-white/15"}`}
          >
            {value}
          </span>
        )}
      </div>
      <h3 className="font-display font-bold text-lg mb-1 leading-tight">
        {title}
      </h3>
      <p className={`text-sm ${subtitleClasses[variant]}`}>{subtitle}</p>
    </motion.button>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const { setup } = useBunkSetup();
  const [allSales, setAllSales] = useState<DaySales[]>([]);
  const [creditRemaining, setCreditRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  // Welcome toast — once per login session
  useEffect(() => {
    if (setup && !sessionStorage.getItem("bp_welcomed")) {
      sessionStorage.setItem("bp_welcomed", "1");
      toast.success(
        `Welcome back! ${setup.bunkName} data loaded from your account.`,
      );
    }
  }, [setup]);

  useEffect(() => {
    if (isFetching || !actor) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([actor.getAllDaySales(), actor.getTotalOutstandingCredit()])
      .then(([sales, credit]) => {
        if (!cancelled) {
          // Sort by date descending
          const sorted = [...sales].sort((a, b) =>
            b.date.localeCompare(a.date),
          );
          setAllSales(sorted);
          setCreditRemaining(credit);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllSales([]);
          setCreditRemaining(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const todayRevenue =
    allSales.length > 0
      ? formatCurrency(calculateDaySales(allSales[0]).totalRevenue)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-white rounded-xl p-4 bp-card-shadow border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Fuel className="w-3.5 h-3.5" />
              Total Records
            </div>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-display font-bold text-2xl text-foreground">
                {allSales.length}
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 bp-card-shadow border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Latest Day
            </div>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-display font-bold text-lg text-foreground truncate">
                {todayRevenue || "—"}
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 bp-card-shadow border border-border/50 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              Credit Pending
            </div>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <p
                className={`font-display font-bold text-lg ${creditRemaining > 0 ? "text-destructive" : "text-foreground"}`}
              >
                {formatCurrency(creditRemaining)}
              </p>
            )}
          </div>
        </motion.div>

        {/* Main Tiles */}
        <h2 className="font-display font-bold text-xl text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Tile
            icon={<Plus className="w-6 h-6 text-bp-yellow" />}
            title="New Day Sales"
            subtitle="Record daily fuel sales and readings"
            variant="blue"
            onClick={() => navigate({ to: "/new-sales" })}
            delay={0.05}
          />
          <Tile
            icon={<CreditCard className="w-6 h-6 text-foreground" />}
            title="Credit Settled"
            subtitle="Record credit payments received"
            value={
              creditRemaining > 0 ? formatCurrency(creditRemaining) : undefined
            }
            variant="yellow"
            onClick={() => navigate({ to: "/credit-settled" })}
            delay={0.1}
          />
          <Tile
            icon={<BarChart3 className="w-6 h-6 text-bp-yellow" />}
            title="Month Wise Analysis"
            subtitle="View sales trends and revenue graphs"
            variant="dark"
            onClick={() => navigate({ to: "/analysis" })}
            delay={0.15}
          />
          <Tile
            icon={<FileEdit className="w-6 h-6 text-bp-yellow" />}
            title="Edit Day Sales"
            subtitle="Modify or correct past sales entries"
            variant="blue"
            onClick={() => navigate({ to: "/edit-sales" })}
            delay={0.2}
          />
          <Tile
            icon={<Printer className="w-6 h-6 text-foreground" />}
            title="Print Sales"
            subtitle="Generate detailed sales reports"
            variant="yellow"
            onClick={() => navigate({ to: "/print-sales" })}
            delay={0.25}
          />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
