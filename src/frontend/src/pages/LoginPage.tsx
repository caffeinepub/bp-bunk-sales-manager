import { Button } from "@/components/ui/button";
import { Fuel, Loader2, LogIn, Shield, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isInitializing, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  const isLoading = isInitializing || isLoggingIn;

  return (
    <div className="min-h-screen bp-gradient flex flex-col items-center justify-center p-4">
      {/* Background geometric decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-bp-yellow/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-bp-yellow shadow-2xl mb-5"
          >
            <img
              src="/assets/generated/bp-logo-transparent.dim_120x120.png"
              alt="BP Logo"
              className="w-20 h-20 rounded-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Fuel className="w-5 h-5 text-bp-yellow" />
              <span className="text-bp-yellow font-display font-bold text-sm tracking-widest uppercase">
                Bharat Petroleum
              </span>
            </div>
            <h1 className="text-white font-display font-bold text-3xl mb-2">
              Bunk Sales Manager
            </h1>
            <p className="text-blue-200 text-base">
              Sign in to manage your station's daily sales
            </p>
          </motion.div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bp-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-bp-yellow" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">
                Secure Sign In
              </h2>
              <p className="text-muted-foreground text-sm">
                Access your station data from anywhere
              </p>
            </div>
          </div>

          {/* Error State */}
          {isLoginError && loginError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 text-sm text-destructive">
              {loginError.message || "Login failed. Please try again."}
            </div>
          )}

          {/* Internet Identity Login Button */}
          <Button
            type="button"
            onClick={login}
            disabled={isLoading}
            className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-white gap-3 mb-5 rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isInitializing ? "Initializing..." : "Opening login..."}
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign in with Internet Identity
              </>
            )}
          </Button>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <div className="w-7 h-7 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-secondary-foreground" />
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Passwordless & secure
                </span>{" "}
                — No password to remember. Uses cryptographic keys on your
                device.
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Smartphone className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Access from any device
                </span>{" "}
                — Your data is stored securely in the cloud, accessible
                everywhere.
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-blue-200/70 text-center text-xs mt-4"
        >
          Your sales data is stored securely on the Internet Computer blockchain
        </motion.p>
      </motion.div>
    </div>
  );
}
