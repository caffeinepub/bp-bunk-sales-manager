import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileEdit,
  KeyRound,
  Loader2,
  Lock,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
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
import { NewSalesPage } from "./NewSalesPage";

const DELETE_PASSWORD_KEY = "bp_delete_password";

type DialogMode =
  | "none"
  | "set-password"
  | "confirm-delete"
  | "change-password";

export function EditSalesPage() {
  const { actor, isFetching } = useActor();
  const [selectedDate, setSelectedDate] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [existingData, setExistingData] = useState<DaySales | undefined>(
    undefined,
  );
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const [allSales, setAllSales] = useState<DaySales[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);

  // Delete dialog state
  const [dialogMode, setDialogMode] = useState<DialogMode>("none");
  const [pendingDeleteDate, setPendingDeleteDate] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  // Password fields
  const [passwordInput, setPasswordInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (isFetching || !actor) return;

    let cancelled = false;
    setLoadingSales(true);
    actor
      .getAllDaySales()
      .then((sales) => {
        if (!cancelled) {
          const sorted = [...sales].sort((a, b) =>
            b.date.localeCompare(a.date),
          );
          setAllSales(sorted);
        }
      })
      .catch(() => {
        if (!cancelled) setAllSales([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSales(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const handleSearch = async () => {
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }
    if (!actor) {
      setError("Not connected. Please try again.");
      return;
    }

    setSearching(true);
    setError("");
    try {
      const sale = await actor.getDaySalesByDate(selectedDate);
      if (!sale) {
        setError(`No sales record found for ${formatDate(selectedDate)}`);
        return;
      }
      setExistingData(sale);
      setShowWizard(true);
    } catch {
      setError("Failed to load sales data. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleRowClick = async (sale: DaySales) => {
    setSelectedDate(sale.date);
    setExistingData(sale);
    setShowWizard(true);
  };

  // Open delete flow for a given date
  const handleDeleteClick = (e: React.MouseEvent, date: string) => {
    e.stopPropagation();
    setPendingDeleteDate(date);
    setPasswordInput("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPasswordInput("");
    setPasswordError("");

    const storedPassword = localStorage.getItem(DELETE_PASSWORD_KEY);
    if (!storedPassword) {
      setDialogMode("set-password");
    } else {
      setDialogMode("confirm-delete");
    }
  };

  const handleCloseDialog = () => {
    setDialogMode("none");
    setPendingDeleteDate("");
    setPasswordInput("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPasswordInput("");
    setPasswordError("");
  };

  // Set password for first time, then proceed to confirm-delete
  const handleSetPassword = () => {
    if (!newPassword.trim()) {
      setPasswordError("Please enter a password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }
    localStorage.setItem(DELETE_PASSWORD_KEY, newPassword);
    setPasswordError("");
    setPasswordInput("");
    setNewPassword("");
    setConfirmPassword("");
    setDialogMode("confirm-delete");
  };

  // Execute the actual delete after password verification
  const handleConfirmDelete = async () => {
    const storedPassword = localStorage.getItem(DELETE_PASSWORD_KEY);
    if (passwordInput !== storedPassword) {
      setPasswordError("Incorrect password");
      return;
    }
    if (!actor) {
      setPasswordError("Not connected. Please try again.");
      return;
    }

    setDeleting(true);
    setPasswordError("");
    try {
      await actor.deleteDaySalesByDate(pendingDeleteDate);
      setAllSales((prev) => prev.filter((s) => s.date !== pendingDeleteDate));
      toast.success(`Sales for ${formatDate(pendingDeleteDate)} deleted`);
      handleCloseDialog();
    } catch {
      setPasswordError("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Change password flow
  const handleChangePassword = () => {
    const storedPassword = localStorage.getItem(DELETE_PASSWORD_KEY);
    if (!storedPassword || currentPasswordInput !== storedPassword) {
      setPasswordError("Current password is incorrect");
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError("Please enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }
    localStorage.setItem(DELETE_PASSWORD_KEY, newPassword);
    toast.success("Delete password changed successfully");
    handleCloseDialog();
  };

  const openChangePassword = () => {
    setCurrentPasswordInput("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setDialogMode("change-password");
  };

  if (showWizard && existingData) {
    return <NewSalesPage editDate={selectedDate} existingData={existingData} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader title="Edit Day Sales" showBack />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl shadow-bp-card border border-border overflow-hidden"
        >
          <div className="bp-gradient px-6 py-4 flex items-center gap-3">
            <FileEdit className="w-5 h-5 text-bp-yellow" />
            <h2 className="font-display font-bold text-lg text-white">
              Select Date to Edit
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editDate" className="font-semibold">
                Sales Date
              </Label>
              <Input
                id="editDate"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setError("");
                }}
                className={`h-12 text-base ${error ? "border-destructive" : ""}`}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="w-full h-12 font-bold bg-primary text-primary-foreground gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Load Sales Data
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Recent Sales List */}
        {loadingSales ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading sales records...</span>
          </div>
        ) : allSales.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-bp-card border border-border overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-base text-foreground">
                  Recent Sales Records
                </h3>
                <p className="text-muted-foreground text-xs">
                  Click a row to edit · Use the trash icon to delete
                </p>
              </div>
              <button
                type="button"
                onClick={openChangePassword}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors flex-shrink-0 mt-0.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Change Delete Password
              </button>
            </div>
            <div className="divide-y divide-border">
              {allSales.slice(0, 15).map((sale) => {
                const calc = calculateDaySales(sale);
                return (
                  <div
                    key={sale.date}
                    className="w-full px-4 py-4 flex items-center gap-2 hover:bg-muted/30 transition-colors group"
                  >
                    {/* Clickable row area */}
                    <button
                      type="button"
                      onClick={() => handleRowClick(sale)}
                      className="flex-1 flex items-center justify-between text-left min-w-0"
                    >
                      <div>
                        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {formatDate(sale.date)}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          P: {calc.petrolSold.toFixed(1)}L · D:{" "}
                          {calc.dieselSold.toFixed(1)}L
                        </p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="font-bold text-sm text-foreground">
                          {formatCurrency(calc.totalRevenue)}
                        </p>
                        {calc.creditGiven > 0 && (
                          <p className="text-destructive text-xs">
                            Credit: {formatCurrency(calc.creditGiven)}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, sale.date)}
                      className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      aria-label={`Delete sales for ${formatDate(sale.date)}`}
                      title={`Delete sales for ${formatDate(sale.date)}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No sales records yet</p>
            <p className="text-sm">
              Create day sales first using the New Day Sales tile
            </p>
          </div>
        )}
      </main>

      <AppFooter />

      {/* ─── Set Password Dialog (first-time setup) ─── */}
      <Dialog
        open={dialogMode === "set-password"}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <DialogTitle>Set Delete Password</DialogTitle>
            </div>
            <DialogDescription>
              Create a password to protect sales deletions. You'll be asked for
              this every time you delete a record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="newPwd">New Password</Label>
              <Input
                id="newPwd"
                type="password"
                placeholder="Enter password (min. 4 chars)"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPwd">Confirm Password</Label>
              <Input
                id="confirmPwd"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
              />
            </div>
            {passwordError && (
              <p className="text-destructive text-sm font-medium">
                {passwordError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSetPassword}
              className="bg-primary text-primary-foreground"
            >
              Set Password & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Delete Dialog ─── */}
      <Dialog
        open={dialogMode === "confirm-delete"}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <DialogTitle>Delete Sales Record</DialogTitle>
            </div>
            <DialogDescription>
              You are about to permanently delete the sales record for{" "}
              <span className="font-semibold text-foreground">
                {pendingDeleteDate ? formatDate(pendingDeleteDate) : ""}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deletePwd">Enter Delete Password</Label>
              <Input
                id="deletePwd"
                type="password"
                placeholder="Enter your delete password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && !deleting && handleConfirmDelete()
                }
                autoFocus
              />
            </div>
            {passwordError && (
              <p className="text-destructive text-sm font-medium">
                {passwordError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Record
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Change Password Dialog ─── */}
      <Dialog
        open={dialogMode === "change-password"}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle>Change Delete Password</DialogTitle>
            </div>
            <DialogDescription>
              Update the password used to authenticate sales deletions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {localStorage.getItem(DELETE_PASSWORD_KEY) ? (
              <div className="space-y-2">
                <Label htmlFor="currentPwd">Current Password</Label>
                <Input
                  id="currentPwd"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPasswordInput}
                  onChange={(e) => {
                    setCurrentPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="changeNewPwd">New Password</Label>
              <Input
                id="changeNewPwd"
                type="password"
                placeholder="Enter new password (min. 4 chars)"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="changeConfirmPwd">Confirm New Password</Label>
              <Input
                id="changeConfirmPwd"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
              />
            </div>
            {passwordError && (
              <p className="text-destructive text-sm font-medium">
                {passwordError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-primary text-primary-foreground"
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
