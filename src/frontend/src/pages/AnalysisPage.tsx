import { BarChart3, Droplets, Fuel, Loader2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppFooter } from "../components/app/AppFooter";
import { AppHeader } from "../components/app/AppHeader";
import { useActor } from "../hooks/useActor";
import type { DaySales } from "../types";
import { aggregateByMonth, formatCurrency } from "../utils/calculations";

const COLORS = {
  petrol: "#c9a300",
  diesel: "#003da5",
  total: "#1a1a2e",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-border p-3 text-sm min-w-[180px]">
      <p className="font-display font-bold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <span style={{ color: entry.color }} className="font-medium">
            {entry.name}
          </span>
          <span className="font-bold text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalysisPage() {
  const { actor, isFetching } = useActor();
  const [sales, setSales] = useState<DaySales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFetching || !actor) return;

    let cancelled = false;
    setLoading(true);
    actor
      .getAllDaySales()
      .then((data) => {
        if (!cancelled) setSales(data);
      })
      .catch(() => {
        if (!cancelled) setSales([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const monthlyData = useMemo(() => aggregateByMonth(sales), [sales]);

  const totalRevenue = monthlyData.reduce((s, m) => s + m.totalRevenue, 0);
  const totalPetrolSold = monthlyData.reduce((s, m) => s + m.petrolSold, 0);
  const totalDieselSold = monthlyData.reduce((s, m) => s + m.dieselSold, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader title="Month Wise Analysis" showBack />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-xl p-4 shadow-bp-card border border-border">
            <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              All-Time Revenue
            </p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-display font-bold text-xl text-foreground">
                {formatCurrency(totalRevenue)}
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-bp-card border border-border">
            <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-secondary-foreground" />
              Total Petrol Sold
            </p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-display font-bold text-xl text-foreground">
                {totalPetrolSold.toFixed(2)} L
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-bp-card border border-border">
            <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-primary" />
              Total Diesel Sold
            </p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-display font-bold text-xl text-foreground">
                {totalDieselSold.toFixed(2)} L
              </p>
            )}
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-bp-card border border-border overflow-hidden"
        >
          <div className="bp-gradient px-6 py-4 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-bp-yellow" />
            <h2 className="font-display font-bold text-lg text-white">
              Monthly Revenue Overview
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground">Loading sales data...</p>
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">
                  No sales data yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Add day sales to see monthly analysis
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 16, left: 0, bottom: 10 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.92 0.01 230)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fontSize: 12, fill: "oklch(0.50 0.03 230)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.50 0.03 230)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={10}
                  />
                  <Bar
                    dataKey="petrolRevenue"
                    name="Petrol Revenue"
                    fill={COLORS.petrol}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="dieselRevenue"
                    name="Diesel Revenue"
                    fill={COLORS.diesel}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="totalRevenue"
                    name="Total Revenue"
                    fill={COLORS.total}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Monthly Table */}
        {!loading && monthlyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-bp-card border border-border overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-display font-bold text-base text-foreground">
                Monthly Summary Table
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Month
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                      Petrol (L)
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                      Diesel (L)
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                      Petrol Rev.
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                      Diesel Rev.
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {monthlyData.map((row) => (
                    <tr
                      key={row.month}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {row.monthLabel}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {row.petrolSold.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {row.dieselSold.toFixed(2)}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        style={{ color: COLORS.petrol }}
                      >
                        {formatCurrency(row.petrolRevenue)}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        style={{ color: COLORS.diesel }}
                      >
                        {formatCurrency(row.dieselRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        {formatCurrency(row.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr>
                    <td className="px-4 py-3 font-bold text-foreground">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {totalPetrolSold.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {totalDieselSold.toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-bold"
                      style={{ color: COLORS.petrol }}
                    >
                      {formatCurrency(
                        monthlyData.reduce((s, m) => s + m.petrolRevenue, 0),
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-bold"
                      style={{ color: COLORS.diesel }}
                    >
                      {formatCurrency(
                        monthlyData.reduce((s, m) => s + m.dieselRevenue, 0),
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      {formatCurrency(totalRevenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
