import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Printer, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { AppFooter } from "../components/app/AppFooter";
import { AppHeader } from "../components/app/AppHeader";
import { useBunkSetup } from "../contexts/BunkSetupContext";
import { useActor } from "../hooks/useActor";
import type { DaySalesCalculated } from "../types";
import {
  calculateDaySales,
  formatCurrency,
  formatDate,
} from "../utils/calculations";

export function PrintSalesPage() {
  const { actor } = useActor();
  const { setup } = useBunkSetup();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [printData, setPrintData] = useState<DaySalesCalculated[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    if (!fromDate || !toDate) {
      setError("Please select both From and To dates");
      return;
    }
    if (fromDate > toDate) {
      setError("From date must be before or equal to To date");
      return;
    }
    if (!actor) {
      setError("Not connected. Please try again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const allSales = await actor.getAllDaySales();
      const filtered = allSales
        .filter((s) => s.date >= fromDate && s.date <= toDate)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(calculateDaySales);

      if (filtered.length === 0) {
        setError(
          `No sales records found between ${formatDate(fromDate)} and ${formatDate(toDate)}`,
        );
        return;
      }

      setPrintData(filtered);
      setPreviewing(true);
    } catch {
      setError("Failed to load sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (previewing && printData.length > 0) {
    const totalPetrolSold = printData.reduce((s, d) => s + d.petrolSold, 0);
    const totalDieselSold = printData.reduce((s, d) => s + d.dieselSold, 0);
    const totalRevenue = printData.reduce((s, d) => s + d.totalRevenue, 0);
    const totalPetrolRevenue = printData.reduce(
      (s, d) => s + d.petrolRevenue,
      0,
    );
    const totalDieselRevenue = printData.reduce(
      (s, d) => s + d.dieselRevenue,
      0,
    );
    const totalCredit = printData.reduce((s, d) => s + d.creditGiven, 0);
    const totalCash = printData.reduce((s, d) => s + d.revenueWithoutCredit, 0);

    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Screen controls - hidden on print */}
        <div className="no-print">
          <AppHeader
            title="Print Sales"
            showBack
            onBack={() => setPreviewing(false)}
          />
        </div>

        {/* Print Content */}
        <div className="print-content flex-1 max-w-5xl mx-auto w-full px-4 py-6">
          {/* Print Header */}
          <div className="print-header mb-6 pb-4 border-b-2 border-primary">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground">
                  {setup?.bunkName || "Petrol Bunk"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {setup?.location}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Bharat Petroleum Authorized Dealer
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-foreground">
                  Sales Report
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(fromDate)} — {formatDate(toDate)}
                </p>
                <p className="text-muted-foreground text-xs">
                  Generated: {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-muted/30 rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-muted-foreground text-xs">Total Revenue</p>
              <p className="font-bold text-base">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Cash Revenue</p>
              <p className="font-bold text-base">{formatCurrency(totalCash)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Credit</p>
              <p className="font-bold text-base text-destructive">
                {formatCurrency(totalCredit)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Days Covered</p>
              <p className="font-bold text-base">{printData.length}</p>
            </div>
          </div>

          {/* Daily Records */}
          <div className="space-y-4">
            {printData.map((day, idx) => (
              <div
                key={day.date}
                className="bg-white rounded-xl border border-border overflow-hidden shadow-bp-card"
                style={{ pageBreakInside: "avoid" }}
              >
                <div className="bp-gradient px-4 py-3 flex items-center justify-between">
                  <span className="text-white font-bold text-sm">
                    #{idx + 1} — {formatDate(day.date)}
                  </span>
                  <span className="text-bp-yellow font-bold text-sm">
                    {formatCurrency(day.totalRevenue)}
                  </span>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {/* Prices */}
                  <div>
                    <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide mb-2">
                      Fuel Prices
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Petrol price/L</span>
                        <span className="font-medium">
                          {formatCurrency(day.petrolPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diesel price/L</span>
                        <span className="font-medium">
                          {formatCurrency(day.dieselPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div>
                    <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide mb-2">
                      Sales Summary
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Petrol sold</span>
                        <span className="font-medium">
                          {day.petrolSold.toFixed(2)} L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diesel sold</span>
                        <span className="font-medium">
                          {day.dieselSold.toFixed(2)} L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Petrol revenue</span>
                        <span className="font-medium">
                          {formatCurrency(day.petrolRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diesel revenue</span>
                        <span className="font-medium">
                          {formatCurrency(day.dieselRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pump 1 Readings */}
                  <div>
                    <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide mb-2">
                      Pump 1 Readings
                    </p>
                    <div className="space-y-1">
                      {[
                        {
                          n: 1,
                          type: "Petrol",
                          open: day.pump1_n1_open,
                          close: day.pump1_n1_close,
                        },
                        {
                          n: 2,
                          type: "Diesel",
                          open: day.pump1_n2_open,
                          close: day.pump1_n2_close,
                        },
                        {
                          n: 3,
                          type: "Diesel",
                          open: day.pump1_n3_open,
                          close: day.pump1_n3_close,
                        },
                        {
                          n: 4,
                          type: "Petrol",
                          open: day.pump1_n4_open,
                          close: day.pump1_n4_close,
                        },
                      ].map((nozzle) => (
                        <div key={nozzle.n} className="flex justify-between">
                          <span>
                            N{nozzle.n} ({nozzle.type})
                          </span>
                          <span className="font-medium text-xs">
                            {nozzle.open.toFixed(2)} → {nozzle.close.toFixed(2)}{" "}
                            ({(nozzle.close - nozzle.open).toFixed(2)} L)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pump 2 Readings */}
                  <div>
                    <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide mb-2">
                      Pump 2 Readings
                    </p>
                    <div className="space-y-1">
                      {[
                        {
                          n: 1,
                          type: "Petrol",
                          open: day.pump2_n1_open,
                          close: day.pump2_n1_close,
                        },
                        {
                          n: 2,
                          type: "Diesel",
                          open: day.pump2_n2_open,
                          close: day.pump2_n2_close,
                        },
                        {
                          n: 3,
                          type: "Diesel",
                          open: day.pump2_n3_open,
                          close: day.pump2_n3_close,
                        },
                        {
                          n: 4,
                          type: "Petrol",
                          open: day.pump2_n4_open,
                          close: day.pump2_n4_close,
                        },
                      ].map((nozzle) => (
                        <div key={nozzle.n} className="flex justify-between">
                          <span>
                            N{nozzle.n} ({nozzle.type})
                          </span>
                          <span className="font-medium text-xs">
                            {nozzle.open.toFixed(2)} → {nozzle.close.toFixed(2)}{" "}
                            ({(nozzle.close - nozzle.open).toFixed(2)} L)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credit & Test info */}
                  <div className="sm:col-span-2 border-t border-border pt-3 flex flex-wrap gap-6">
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Credit Given
                      </span>
                      <p className="font-bold text-destructive">
                        {formatCurrency(day.creditGiven)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Cash Revenue
                      </span>
                      <p className="font-bold">
                        {formatCurrency(day.revenueWithoutCredit)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Test Petrol
                      </span>
                      <p className="font-medium">
                        {day.testPetrol.toFixed(2)} L
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Test Diesel
                      </span>
                      <p className="font-medium">
                        {day.testDiesel.toFixed(2)} L
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Print Footer Summary */}
          <div className="mt-6 pt-4 border-t-2 border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-muted-foreground text-xs">Total Petrol</p>
              <p className="font-bold">{totalPetrolSold.toFixed(2)} L</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Diesel</p>
              <p className="font-bold">{totalDieselSold.toFixed(2)} L</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Petrol Revenue</p>
              <p className="font-bold">{formatCurrency(totalPetrolRevenue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Diesel Revenue</p>
              <p className="font-bold">{formatCurrency(totalDieselRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Print Button - no-print */}
        <div className="no-print flex justify-center gap-4 py-6 border-t border-border bg-background">
          <Button
            variant="outline"
            onClick={() => setPreviewing(false)}
            className="h-11 px-6"
          >
            ← Back
          </Button>
          <Button
            onClick={() => window.print()}
            className="h-11 px-8 font-bold gap-2 bg-primary text-primary-foreground"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
        </div>

        <div className="no-print">
          <AppFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader title="Print Sales" showBack />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl shadow-bp-card border border-border overflow-hidden"
        >
          <div className="bp-gradient px-6 py-4 flex items-center gap-3">
            <Printer className="w-5 h-5 text-bp-yellow" />
            <h2 className="font-display font-bold text-lg text-white">
              Generate Sales Report
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate" className="font-semibold">
                  From Date
                </Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setError("");
                  }}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate" className="font-semibold">
                  To Date
                </Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setError("");
                  }}
                  className="h-12 text-base"
                />
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 rounded-lg p-3">
                {error}
              </p>
            )}

            <Button
              onClick={handlePreview}
              disabled={loading}
              className="w-full h-12 font-bold bg-primary text-primary-foreground gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Preview Report
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Help text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-muted/40 rounded-xl p-4 flex items-start gap-3"
        >
          <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">
              About Print Reports
            </p>
            <p>
              Select a date range to preview detailed sales records. The report
              includes all nozzle readings, fuel prices, calculated totals, and
              credit information. Use your browser's print dialog to print or
              save as PDF.
            </p>
          </div>
        </motion.div>
      </main>

      <AppFooter />
    </div>
  );
}
