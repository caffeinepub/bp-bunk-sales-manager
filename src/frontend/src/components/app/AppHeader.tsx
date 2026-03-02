import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Fuel, LogOut } from "lucide-react";
import { useBunkSetup } from "../../contexts/BunkSetupContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function AppHeader({ title, showBack, onBack }: AppHeaderProps) {
  const navigate = useNavigate();
  const { setup } = useBunkSetup();
  const { clear } = useInternetIdentity();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate({ to: "/" });
    }
  };

  const handleLogout = () => {
    clear();
  };

  return (
    <header className="no-print bp-gradient sticky top-0 z-50 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white mr-1"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* BP Logo */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-full bg-bp-yellow flex items-center justify-center shadow-md flex-shrink-0">
            <img
              src="/assets/generated/bp-logo-transparent.dim_120x120.png"
              alt="BP Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-bp-yellow flex-shrink-0" />
              <span className="text-bp-yellow font-display font-bold text-sm tracking-wide uppercase">
                Bharat Petroleum
              </span>
            </div>
            {title ? (
              <h1 className="text-white font-display font-bold text-lg leading-tight truncate">
                {title}
              </h1>
            ) : setup ? (
              <div>
                <h1 className="text-white font-display font-bold text-lg leading-tight truncate">
                  {setup.bunkName}
                </h1>
                <p className="text-blue-200 text-xs truncate">
                  {setup.location}
                </p>
              </div>
            ) : (
              <h1 className="text-white font-display font-bold text-lg">
                Petrol Station Manager
              </h1>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium flex-shrink-0"
          aria-label="Logout"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
