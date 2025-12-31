"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { changePassword as changePasswordRequest } from "@/services/auth.service";
import { cancelSubscription } from "@/services/subscription.service";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
const tabs = [
  { id: "account", label: "Account" },
  { id: "subscription", label: "Subscription" },
  { id: "security", label: "Security" },
];

export default function ProfilPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams?.get("tab") ?? "account";

  const { user, subscription, plan, logout, refreshUser } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [changing, setChanging] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [cancelLoading, setCancelLoading] = React.useState(false);

  async function handleCancelSubscription() {
    if (!user) return router.push('/auth/signin');
    try {
      setCancelLoading(true);
      await cancelSubscription();
      await refreshUser();
      setCancelDialogOpen(false);
      toast({ title: 'Subscription canceled', description: 'You have been reverted to the Starter plan.' });
    } catch (err: any) {
      toast({ title: 'Cancellation failed', description: err?.message ?? 'Unable to cancel subscription', variant: 'destructive' });
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast({
        title: "Missing password",
        description: "Please fill both fields.",
        variant: "destructive",
      });
      return;
    }
    setChanging(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });
    } catch (err: any) {
      const message =
        err instanceof Error ? err.message : "Unable to change password.";
      toast({
        title: "Change password failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setChanging(false);
    }
  }

  function setTab(id: string) {
    router.push(`/profil?tab=${id}`);
  }
  const { isDarkMode, toggleDarkMode } = useTheme();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <button
        onClick={() => router.back()}
        className="absolute top-5 left-6 text-sm text-primary flex justify-center items-center gap-1 hover:underline "
      >
        <ArrowLeft className="w-4 h-4" /> Go back
      </button>
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {isDarkMode ? "Dark" : "Light"}
        </span>
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-card border border-feature-border rounded-3xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                {user?.email ? (
                  <Image
                    src="/logos/FromScratch.png"
                    alt="logo"
                    width={52}
                    height={22}
                  />
                ) : null}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Welcome back</p>
                <h1 className="text-xl font-semibold leading-tight">
                  {user
                    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                      "User"
                    : "Guest"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {user?.email ?? "Not signed in"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Button
                  size="sm"
                  onClick={async () => {
                    await logout();
                    router.push("/auth/signin");
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <Button size="sm" onClick={() => router.push("/auth/signin")}>
                  Sign in
                </Button>
              )}
            </div>
          </div>
          {subscription ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {subscription.status}
              </span>
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium">
                {subscription.plan?.name ?? subscription.planId}
              </span>
              {plan?.billingPeriod ? (
                <span className="text-muted-foreground">
                  •{" "}
                  {plan.price
                    ? `$${plan.price} / ${plan.billingPeriod}`
                    : plan.billingPeriod}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 text-sm text-muted-foreground">
              No active subscription. Choose a plan to unlock projects.
            </div>
          )}
        </div>

        <div className="bg-card border border-feature-border rounded-3xl shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <aside className="md:w-64 border-b md:border-b-0 md:border-r border-feature-border bg-muted/10 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
                Navigation
              </p>
              {tabs.map((t) => {
                const active = tabParam === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <span className="font-medium">{t.label}</span>
                  </button>
                );
              })}
            </aside>

            <main className="flex-1 p-6 md:p-8">
              {tabParam === "account" && (
                <section className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Account</h2>
                    <p className="text-xs text-muted-foreground">
                      Manage your personal information and sign-in details.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl border border-border bg-muted/30">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        First name
                      </div>
                      <div className="mt-2 text-base font-semibold">
                        {user ? `${user.firstName ?? ""}` : "—"}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-border bg-muted/30">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Last name
                      </div>
                      <div className="mt-2 text-base font-semibold">
                        {user ? `${user.lastName ?? ""}` : "—"}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-border bg-muted/30">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Email
                      </div>
                      <div className="mt-2 text-base font-semibold">
                        {user?.email ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => router.push("/auth/profile/edit")}>
                      Edit profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setTab("security")}
                    >
                      Change password
                    </Button>
                  </div>
                </section>
              )}

              {tabParam === "subscription" && (
                <section className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Subscription</h2>
                    <p className="text-xs text-muted-foreground">
                      Review your plan, billing cycle, and upgrade options.
                    </p>
                  </div>
                  {subscription ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-4 rounded-2xl border border-border bg-muted/30">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                          Status & Dates
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Plan</span>
                            <span className="font-medium">
                              {subscription.plan?.name ?? subscription.planId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <span className="font-medium capitalize">
                              {subscription.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start</span>
                            <span className="font-medium">
                              {subscription.startDate
                                ? new Date(
                                    subscription.startDate
                                  ).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">End</span>
                            <span className="font-medium">
                              {subscription.endDate
                                ? new Date(
                                    subscription.endDate
                                  ).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-border bg-muted/30">
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                          Plan details
                        </h3>
                        <div className="font-semibold text-base">
                          {plan?.name ?? subscription.planId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {plan
                            ? `$${plan.price} / ${plan.billingPeriod}`
                            : "—"}
                        </div>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                          {(plan?.description ?? []).map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Button onClick={() => router.push("/subscription")}>
                            Manage subscription
                          </Button>
                          {plan && Number(plan.price) > 0 && (
                            <Button
                              variant="destructive"
                              disabled={cancelLoading}
                              onClick={() => setCancelDialogOpen(true)}
                            >
                              Cancel and revert to Starter
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => router.push("/projects")}
                          >
                            Go to projects
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-dashed border-border bg-muted/20 text-center">
                      <p className="mb-3 text-muted-foreground">
                        You don't have an active subscription yet.
                      </p>
                      <div className="flex justify-center gap-3">
                        <Button onClick={() => router.push("/subscription")}>
                          Choose a plan
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push("/projects")}
                        >
                          Explore projects
                        </Button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {tabParam === "security" && (
                <section className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Security</h2>
                    <p className="text-xs text-muted-foreground">
                      Keep your account safe with authentication and session
                      controls.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl border border-border bg-muted/30">
                      <div className="text-sm font-semibold">
                        Two factor authentication
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add an extra layer of security to your sign-in.
                      </p>
                      <Button
                        className="mt-3"
                        onClick={() => router.push("/auth/two-factor")}
                      >
                        Manage 2FA
                      </Button>
                    </div>
                    <div className="p-4 rounded-2xl border border-border bg-muted/30">
                      <div className="text-sm font-semibold">
                        Active sessions
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Review devices signed in to your account.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3"
                        onClick={() => router.push("/auth/sessions")}
                      >
                        View sessions
                      </Button>
                    </div>
                    <div className="p-4 rounded-2xl border border-border bg-muted/30">
                      <div className="text-sm font-semibold">
                        Change password
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use your current password to set a new one.
                      </p>
                      <form
                        className="mt-3 space-y-3"
                        onSubmit={handleChangePassword}
                      >
                        <div className="space-y-1">
                          <label
                            className="text-xs text-muted-foreground"
                            htmlFor="current-password"
                          >
                            Current password
                          </label>
                          <Input
                            id="current-password"
                            type="password"
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={changing || !user}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            className="text-xs text-muted-foreground"
                            htmlFor="new-password"
                          >
                            New password
                          </label>
                          <Input
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={changing || !user}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={changing || !user}
                          className="w-full"
                        >
                          {changing ? "Updating…" : "Change password"}
                        </Button>
                        {!user && (
                          <p className="text-xs text-muted-foreground">
                            Sign in to update your password.
                          </p>
                        )}
                      </form>
                    </div>
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your paid subscription and revert to the free Starter plan? This action will remove access to all paid features.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You can always upgrade to a paid plan again later from the pricing page.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelLoading}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
