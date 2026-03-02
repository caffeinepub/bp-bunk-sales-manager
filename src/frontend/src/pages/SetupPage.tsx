import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Fuel, Loader2, MapPin, Store } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface SetupPageProps {
  onComplete?: () => void;
}

export function SetupPage({ onComplete }: SetupPageProps) {
  const { actor } = useActor();
  const [bunkName, setBunkName] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<{
    bunkName?: string;
    location?: string;
  }>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const newErrors: { bunkName?: string; location?: string } = {};
    if (!bunkName.trim()) newErrors.bunkName = "Bunk name is required";
    if (!location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!actor) {
      toast.error("Not connected. Please try again.");
      return;
    }

    setSaving(true);
    try {
      await actor.saveSetup(bunkName.trim(), location.trim());
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Failed to save setup:", err);
      toast.error("Failed to save setup. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bp-gradient flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bp-yellow shadow-xl mb-4">
            <img
              src="/assets/generated/bp-logo-transparent.dim_120x120.png"
              alt="BP Logo"
              className="w-18 h-18 rounded-full object-cover"
            />
          </div>
          <h1 className="text-white font-display font-bold text-3xl mb-1">
            Bharat Petroleum
          </h1>
          <p className="text-blue-200 text-base">Petrol Station Manager</p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bp-gradient flex items-center justify-center">
              <Fuel className="w-5 h-5 text-bp-yellow" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">
                Setup Your Station
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your station details to get started
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="bunkName"
                className="font-semibold text-foreground flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-primary" />
                Bunk / Station Name
              </Label>
              <Input
                id="bunkName"
                type="text"
                placeholder="e.g. Sri Lakshmi Petrol Bunk"
                value={bunkName}
                onChange={(e) => {
                  setBunkName(e.target.value);
                  if (errors.bunkName)
                    setErrors((prev) => ({ ...prev, bunkName: undefined }));
                }}
                className={`text-base h-12 ${errors.bunkName ? "border-destructive" : ""}`}
                autoFocus
              />
              {errors.bunkName && (
                <p className="text-destructive text-sm">{errors.bunkName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="font-semibold text-foreground flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-primary" />
                Location / Address
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g. NH-44, Guntur, Andhra Pradesh"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location)
                    setErrors((prev) => ({ ...prev, location: undefined }));
                }}
                className={`text-base h-12 ${errors.location ? "border-destructive" : ""}`}
              />
              {errors.location && (
                <p className="text-destructive text-sm">{errors.location}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-blue-200 text-center text-xs mt-4">
          This information will be saved securely to your account
        </p>
      </motion.div>
    </div>
  );
}
