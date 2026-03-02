import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Droplets, Fuel, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppFooter } from "../components/app/AppFooter";
import { AppHeader } from "../components/app/AppHeader";
import { useActor } from "../hooks/useActor";
import type { DaySales } from "../types";
import {
  calculateDaySales,
  formatCurrency,
  formatDate,
} from "../utils/calculations";

const TOTAL_STEPS = 5;

interface StepIndicatorProps {
  current: number;
  total: number;
}

function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              step < current
                ? "bg-primary text-primary-foreground"
                : step === current
                  ? "bg-secondary text-secondary-foreground border-2 border-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {step < current ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < total && (
            <div
              className={`w-8 sm:w-12 h-0.5 transition-all duration-300 ${
                step < current ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

type NozzleReading = {
  open: string;
  close: string;
};

type PumpReadings = {
  n1: NozzleReading;
  n2: NozzleReading;
  n3: NozzleReading;
  n4: NozzleReading;
};

interface NozzleFieldProps {
  nozzleNum: number;
  fuelType: "petrol" | "diesel";
  readings: NozzleReading;
  onChange: (field: "open" | "close", value: string) => void;
  errors?: { open?: string; close?: string };
}

function NozzleField({
  nozzleNum,
  fuelType,
  readings,
  onChange,
  errors,
}: NozzleFieldProps) {
  const isPetrol = fuelType === "petrol";
  return (
    <div className="bg-muted/40 rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`p-1.5 rounded-lg ${isPetrol ? "bg-secondary/40" : "bg-primary/10"}`}
        >
          {isPetrol ? (
            <Fuel className="w-4 h-4 text-secondary-foreground" />
          ) : (
            <Droplets className="w-4 h-4 text-primary" />
          )}
        </div>
        <div>
          <span className="font-semibold text-sm text-foreground">
            Nozzle {nozzleNum}
          </span>
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
              isPetrol
                ? "bg-secondary/50 text-secondary-foreground"
                : "bg-primary/15 text-primary"
            }`}
          >
            {isPetrol ? "Petrol" : "Diesel"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Opening Reading
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={readings.open}
            onChange={(e) => onChange("open", e.target.value)}
            className={`h-10 text-sm ${errors?.open ? "border-destructive" : ""}`}
          />
          {errors?.open && (
            <p className="text-destructive text-xs">{errors.open}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Closing Reading
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={readings.close}
            onChange={(e) => onChange("close", e.target.value)}
            className={`h-10 text-sm ${errors?.close ? "border-destructive" : ""}`}
          />
          {errors?.close && (
            <p className="text-destructive text-xs">{errors.close}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function SummaryRow({ label, value, highlight }: SummaryRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${
        highlight ? "bg-secondary/30 font-bold" : "bg-muted/40"
      }`}
    >
      <span
        className={`text-sm ${highlight ? "text-foreground font-bold" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${highlight ? "text-foreground" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

interface NewSalesPageProps {
  editDate?: string;
  existingData?: DaySales;
}

export function NewSalesPage({ editDate, existingData }: NewSalesPageProps) {
  const navigate = useNavigate();
  const { actor } = useActor();
  const isEdit = !!editDate;

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Step 1
  const [date, setDate] = useState(editDate || existingData?.date || "");

  // Step 2
  const [petrolPrice, setPetrolPrice] = useState(
    existingData?.petrolPrice?.toString() || "",
  );
  const [dieselPrice, setDieselPrice] = useState(
    existingData?.dieselPrice?.toString() || "",
  );

  // Steps 3 & 4 — pump readings
  const [pump1, setPump1] = useState<PumpReadings>({
    n1: {
      open: existingData?.pump1_n1_open?.toString() || "",
      close: existingData?.pump1_n1_close?.toString() || "",
    },
    n2: {
      open: existingData?.pump1_n2_open?.toString() || "",
      close: existingData?.pump1_n2_close?.toString() || "",
    },
    n3: {
      open: existingData?.pump1_n3_open?.toString() || "",
      close: existingData?.pump1_n3_close?.toString() || "",
    },
    n4: {
      open: existingData?.pump1_n4_open?.toString() || "",
      close: existingData?.pump1_n4_close?.toString() || "",
    },
  });

  const [pump2, setPump2] = useState<PumpReadings>({
    n1: {
      open: existingData?.pump2_n1_open?.toString() || "",
      close: existingData?.pump2_n1_close?.toString() || "",
    },
    n2: {
      open: existingData?.pump2_n2_open?.toString() || "",
      close: existingData?.pump2_n2_close?.toString() || "",
    },
    n3: {
      open: existingData?.pump2_n3_open?.toString() || "",
      close: existingData?.pump2_n3_close?.toString() || "",
    },
    n4: {
      open: existingData?.pump2_n4_open?.toString() || "",
      close: existingData?.pump2_n4_close?.toString() || "",
    },
  });

  // Step 5
  const [creditGiven, setCreditGiven] = useState(
    existingData?.creditGiven?.toString() || "0",
  );
  const [testPetrol, setTestPetrol] = useState(
    existingData?.testPetrol?.toString() || "0",
  );
  const [testDiesel, setTestDiesel] = useState(
    existingData?.testDiesel?.toString() || "0",
  );

  const [saved, setSaved] = useState(false);

  const parseNum = (v: string) => Number.parseFloat(v) || 0;

  const buildSaleData = (): DaySales => ({
    id: existingData?.id,
    date,
    petrolPrice: parseNum(petrolPrice),
    dieselPrice: parseNum(dieselPrice),
    pump1_n1_open: parseNum(pump1.n1.open),
    pump1_n1_close: parseNum(pump1.n1.close),
    pump1_n2_open: parseNum(pump1.n2.open),
    pump1_n2_close: parseNum(pump1.n2.close),
    pump1_n3_open: parseNum(pump1.n3.open),
    pump1_n3_close: parseNum(pump1.n3.close),
    pump1_n4_open: parseNum(pump1.n4.open),
    pump1_n4_close: parseNum(pump1.n4.close),
    pump2_n1_open: parseNum(pump2.n1.open),
    pump2_n1_close: parseNum(pump2.n1.close),
    pump2_n2_open: parseNum(pump2.n2.open),
    pump2_n2_close: parseNum(pump2.n2.close),
    pump2_n3_open: parseNum(pump2.n3.open),
    pump2_n3_close: parseNum(pump2.n3.close),
    pump2_n4_open: parseNum(pump2.n4.open),
    pump2_n4_close: parseNum(pump2.n4.close),
    creditGiven: parseNum(creditGiven),
    testPetrol: parseNum(testPetrol),
    testDiesel: parseNum(testDiesel),
  });

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!date) newErrors.date = "Please select a date";
    }
    if (s === 2) {
      if (!petrolPrice || parseNum(petrolPrice) <= 0)
        newErrors.petrolPrice = "Enter valid petrol price";
      if (!dieselPrice || parseNum(dieselPrice) <= 0)
        newErrors.dieselPrice = "Enter valid diesel price";
    }
    if (s === 3) {
      const nozzles: Array<[keyof PumpReadings, "petrol" | "diesel"]> = [
        ["n1", "petrol"],
        ["n2", "diesel"],
        ["n3", "diesel"],
        ["n4", "petrol"],
      ];
      for (const [nozzle] of nozzles) {
        const r = pump1[nozzle];
        if (r.open === "") newErrors[`p1_${nozzle}_open`] = "Required";
        if (r.close === "") newErrors[`p1_${nozzle}_close`] = "Required";
        if (
          r.open !== "" &&
          r.close !== "" &&
          parseNum(r.close) < parseNum(r.open)
        ) {
          newErrors[`p1_${nozzle}_close`] = "Closing must be ≥ opening";
        }
      }
    }
    if (s === 4) {
      const nozzles: Array<keyof PumpReadings> = ["n1", "n2", "n3", "n4"];
      for (const nozzle of nozzles) {
        const r = pump2[nozzle];
        if (r.open === "") newErrors[`p2_${nozzle}_open`] = "Required";
        if (r.close === "") newErrors[`p2_${nozzle}_close`] = "Required";
        if (
          r.open !== "" &&
          r.close !== "" &&
          parseNum(r.close) < parseNum(r.open)
        ) {
          newErrors[`p2_${nozzle}_close`] = "Closing must be ≥ opening";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSave = async () => {
    if (!actor) {
      toast.error("Not connected. Please try again.");
      return;
    }

    setSaving(true);
    const saleData = buildSaleData();

    try {
      if (isEdit && saleData.id != null) {
        await actor.updateDaySales(
          BigInt(saleData.id),
          saleData.date,
          saleData.petrolPrice,
          saleData.dieselPrice,
          saleData.pump1_n1_open,
          saleData.pump1_n1_close,
          saleData.pump1_n2_open,
          saleData.pump1_n2_close,
          saleData.pump1_n3_open,
          saleData.pump1_n3_close,
          saleData.pump1_n4_open,
          saleData.pump1_n4_close,
          saleData.pump2_n1_open,
          saleData.pump2_n1_close,
          saleData.pump2_n2_open,
          saleData.pump2_n2_close,
          saleData.pump2_n3_open,
          saleData.pump2_n3_close,
          saleData.pump2_n4_open,
          saleData.pump2_n4_close,
          saleData.creditGiven,
          saleData.testPetrol,
          saleData.testDiesel,
        );
      } else {
        await actor.addDaySales(
          saleData.date,
          saleData.petrolPrice,
          saleData.dieselPrice,
          saleData.pump1_n1_open,
          saleData.pump1_n1_close,
          saleData.pump1_n2_open,
          saleData.pump1_n2_close,
          saleData.pump1_n3_open,
          saleData.pump1_n3_close,
          saleData.pump1_n4_open,
          saleData.pump1_n4_close,
          saleData.pump2_n1_open,
          saleData.pump2_n1_close,
          saleData.pump2_n2_open,
          saleData.pump2_n2_close,
          saleData.pump2_n3_open,
          saleData.pump2_n3_close,
          saleData.pump2_n4_open,
          saleData.pump2_n4_close,
          saleData.creditGiven,
          saleData.testPetrol,
          saleData.testDiesel,
        );
      }

      setSaved(true);
      toast.success(
        isEdit
          ? "Sales updated successfully!"
          : "Day sales saved successfully!",
      );
    } catch (err) {
      console.error("Failed to save sales:", err);
      toast.error("Failed to save sales. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updatePump1Nozzle = (
    nozzle: keyof PumpReadings,
    field: "open" | "close",
    value: string,
  ) => {
    setPump1((prev) => ({
      ...prev,
      [nozzle]: { ...prev[nozzle], [field]: value },
    }));
  };

  const updatePump2Nozzle = (
    nozzle: keyof PumpReadings,
    field: "open" | "close",
    value: string,
  ) => {
    setPump2((prev) => ({
      ...prev,
      [nozzle]: { ...prev[nozzle], [field]: value },
    }));
  };

  if (saved) {
    const saleData = buildSaleData();
    const calc = calculateDaySales(saleData);
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader
          title={isEdit ? "Edit Day Sales" : "New Day Sales"}
          showBack
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              {isEdit ? "Sales Updated!" : "Sales Saved!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              Day sales for {formatDate(date)} have been{" "}
              {isEdit ? "updated" : "recorded"} successfully.
            </p>
            <div className="bg-white rounded-xl shadow-bp-card border border-border p-4 text-left space-y-2 mb-6">
              <SummaryRow
                label="Total Revenue"
                value={formatCurrency(calc.totalRevenue)}
                highlight
              />
              <SummaryRow
                label="Petrol Sold"
                value={`${calc.petrolSold.toFixed(2)} L`}
              />
              <SummaryRow
                label="Diesel Sold"
                value={`${calc.dieselSold.toFixed(2)} L`}
              />
              <SummaryRow
                label="Credit Given"
                value={formatCurrency(calc.creditGiven)}
              />
              <SummaryRow
                label="Revenue (Cash)"
                value={formatCurrency(calc.revenueWithoutCredit)}
                highlight
              />
            </div>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="w-full h-12 font-bold"
            >
              Back to Home
            </Button>
          </motion.div>
        </main>
        <AppFooter />
      </div>
    );
  }

  const nozzleTypes: Array<[keyof PumpReadings, "petrol" | "diesel"]> = [
    ["n1", "petrol"],
    ["n2", "diesel"],
    ["n3", "diesel"],
    ["n4", "petrol"],
  ];

  const salePreview = step === 5 ? calculateDaySales(buildSaleData()) : null;

  const stepTitles = [
    "Select Date",
    "Fuel Prices",
    "Pump 1 Readings",
    "Pump 2 Readings",
    "Credit & Summary",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader title={isEdit ? "Edit Day Sales" : "New Day Sales"} showBack />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <StepIndicator current={step} total={TOTAL_STEPS} />

        <div className="bg-white rounded-2xl shadow-bp-card border border-border overflow-hidden">
          <div className="bp-gradient px-6 py-4">
            <h2 className="font-display font-bold text-lg text-white">
              Step {step}: {stepTitles[step - 1]}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="p-6"
            >
              {/* Step 1: Date */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Select the date for which you want to record sales.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="saleDate" className="font-semibold">
                      Sales Date
                    </Label>
                    <Input
                      id="saleDate"
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setErrors((prev) => ({ ...prev, date: "" }));
                      }}
                      className={`h-12 text-base ${errors.date ? "border-destructive" : ""}`}
                      disabled={isEdit}
                    />
                    {errors.date && (
                      <p className="text-destructive text-sm">{errors.date}</p>
                    )}
                    {isEdit && (
                      <p className="text-muted-foreground text-xs">
                        Date cannot be changed when editing. Selected:{" "}
                        {formatDate(date)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Prices */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Enter today's fuel prices per litre.
                  </p>
                  <div className="space-y-2">
                    <Label
                      htmlFor="petrolPrice"
                      className="font-semibold flex items-center gap-2"
                    >
                      <Fuel className="w-4 h-4 text-secondary-foreground" />
                      Petrol Price per Litre (₹)
                    </Label>
                    <Input
                      id="petrolPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 103.50"
                      value={petrolPrice}
                      onChange={(e) => {
                        setPetrolPrice(e.target.value);
                        setErrors((prev) => ({ ...prev, petrolPrice: "" }));
                      }}
                      className={`h-12 text-base ${errors.petrolPrice ? "border-destructive" : ""}`}
                    />
                    {errors.petrolPrice && (
                      <p className="text-destructive text-sm">
                        {errors.petrolPrice}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="dieselPrice"
                      className="font-semibold flex items-center gap-2"
                    >
                      <Droplets className="w-4 h-4 text-primary" />
                      Diesel Price per Litre (₹)
                    </Label>
                    <Input
                      id="dieselPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 89.75"
                      value={dieselPrice}
                      onChange={(e) => {
                        setDieselPrice(e.target.value);
                        setErrors((prev) => ({ ...prev, dieselPrice: "" }));
                      }}
                      className={`h-12 text-base ${errors.dieselPrice ? "border-destructive" : ""}`}
                    />
                    {errors.dieselPrice && (
                      <p className="text-destructive text-sm">
                        {errors.dieselPrice}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Pump 1 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bp-gradient flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">
                        Pump 1 — Nozzle Readings
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        N1,N4 = Petrol · N2,N3 = Diesel
                      </p>
                    </div>
                  </div>
                  {nozzleTypes.map(([nozzle, fuelType]) => (
                    <NozzleField
                      key={nozzle}
                      nozzleNum={
                        nozzle === "n1"
                          ? 1
                          : nozzle === "n2"
                            ? 2
                            : nozzle === "n3"
                              ? 3
                              : 4
                      }
                      fuelType={fuelType}
                      readings={pump1[nozzle]}
                      onChange={(field, value) =>
                        updatePump1Nozzle(nozzle, field, value)
                      }
                      errors={{
                        open: errors[`p1_${nozzle}_open`],
                        close: errors[`p1_${nozzle}_close`],
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Step 4: Pump 2 */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm text-secondary-foreground">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">
                        Pump 2 — Nozzle Readings
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        N1,N4 = Petrol · N2,N3 = Diesel
                      </p>
                    </div>
                  </div>
                  {nozzleTypes.map(([nozzle, fuelType]) => (
                    <NozzleField
                      key={nozzle}
                      nozzleNum={
                        nozzle === "n1"
                          ? 1
                          : nozzle === "n2"
                            ? 2
                            : nozzle === "n3"
                              ? 3
                              : 4
                      }
                      fuelType={fuelType}
                      readings={pump2[nozzle]}
                      onChange={(field, value) =>
                        updatePump2Nozzle(nozzle, field, value)
                      }
                      errors={{
                        open: errors[`p2_${nozzle}_open`],
                        close: errors[`p2_${nozzle}_close`],
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Step 5: Credit & Summary */}
              {step === 5 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Enter credit details and review calculated summary.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="font-semibold text-sm">
                        Credit Given Today (₹)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={creditGiven}
                        onChange={(e) => setCreditGiven(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-semibold text-sm flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-secondary-foreground" />
                        Test Petrol (L)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={testPetrol}
                        onChange={(e) => setTestPetrol(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-semibold text-sm flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-primary" />
                        Test Diesel (L)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={testDiesel}
                        onChange={(e) => setTestDiesel(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {salePreview && (
                    <div className="bg-muted/30 rounded-xl p-4 space-y-2 border border-border">
                      <h4 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Calculated Summary — {formatDate(date)}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <SummaryRow
                            label="Petrol Sold"
                            value={`${salePreview.petrolSold.toFixed(2)} L`}
                          />
                          <SummaryRow
                            label="Petrol Revenue"
                            value={formatCurrency(salePreview.petrolRevenue)}
                          />
                        </div>
                        <div className="space-y-2">
                          <SummaryRow
                            label="Diesel Sold"
                            value={`${salePreview.dieselSold.toFixed(2)} L`}
                          />
                          <SummaryRow
                            label="Diesel Revenue"
                            value={formatCurrency(salePreview.dieselRevenue)}
                          />
                        </div>
                      </div>
                      <div className="pt-1 space-y-2">
                        <SummaryRow
                          label="Total Revenue"
                          value={formatCurrency(salePreview.totalRevenue)}
                          highlight
                        />
                        <SummaryRow
                          label="Credit Given"
                          value={formatCurrency(salePreview.creditGiven)}
                        />
                        <SummaryRow
                          label="Cash Revenue"
                          value={formatCurrency(
                            salePreview.revenueWithoutCredit,
                          )}
                          highlight
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? () => navigate({ to: "/" }) : handleBack}
              className="flex-1 h-11"
              disabled={saving}
            >
              {step === 1 ? "Cancel" : "← Back"}
            </Button>
            {step < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 h-11 bg-primary text-primary-foreground font-bold"
              >
                Next →
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-11 bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Update Sales"
                ) : (
                  "Save Sales"
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
