"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, Zap, Crown, Building, GraduationCap, X } from "lucide-react";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth , } from '@/context/AuthContext';
import { getPlans } from '@/services/plan.service';
import { redirectToCheckout } from '@/services/payment.service';
import type { SubscriptionPlan } from '@/types/plan.type';


const iconForName = (name: string) => {
  const map: Record<string, any> = {
    Starter: Zap,
    Student: GraduationCap,
    Professional: Crown,
    Enterprise: Building,
  };
  return map[name] ?? Zap;
};

const Pricing = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated , subscription, plan } = useAuth();
  const pathname = usePathname();
  const showActions = pathname !== '/';

  // Check if user has an active PAID subscription
  const hasActivePaidSubscription = subscription && subscription.status === 'active' && plan && Number(plan.price) > 0;

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlans();
        setPlans(res || []);
      } catch (err) {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Modal state for plan detail and purchase
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | '2months' | 'annual'>('monthly');
  const [modalRedirecting, setModalRedirecting] = useState(false);

  const openModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setSelectedInterval('monthly');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPlan(null);
    setModalRedirecting(false);
  };

  const periodFactor = (interval: string) => {
    switch (interval) {
      case '2months':
        return 2;
      case 'annual':
        return 12;
      default:
        return 1;
    }
  };

  const renderBoolIcon = (v?: any) => (
    v ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-400" />
  );

  const handleModalPay = async () => {
    if (!selectedPlan) return;
    if (modalRedirecting) return; // prevent double invocation

    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    } else if (hasActivePaidSubscription) {
      // User already has a paid plan, redirect to manage subscription
      router.push('/profil?tab=subscription');
      return;
    } else {
      try {
        const origin = window.location.origin;
        const months = periodFactor(selectedInterval);
        setModalRedirecting(true);
        await redirectToCheckout(
          selectedPlan.id,
          selectedPlan.price == 0 ? `${origin}/projects` : `${origin}/subscription?success`,
          `${origin}/subscription?cancel`,
          months
        );
      } catch (err) {
        console.error('Checkout error', err);
        setModalRedirecting(false);
      }
    }
  };

  if (loading) {
    return (
      <section className="py-14 bg-feature-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">Loading plans...</div>
      </section>
    );
  }

  if (!loading && plans.length === 0) {
    return null;
  }

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
            Simple{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = iconForName(plan.name);
          
            const ctaText = plan.price && plan.billingPeriod.toString().toLowerCase() === 'custom'
              ? 'Contact Sales'
              : plan.price == 0
                ? 'Get Started Free'
                : 'Choose Plan';

            return (
              <div
                key={plan.id}
                className={`relative bg-card rounded-3xl border transition-all duration-300 hover-lift flex flex-col ${
                  plan.isPopular ? 'border-primary shadow-glow scale-105' : 'border-feature-border hover:border-primary/20'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold">Most Popular</div>
                  </div>
                )}

                <div className="p-8 flex flex-col h-full">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      {plan.price && plan.billingPeriod.toString().toLowerCase() === 'custom' ? (
                        <span className="text-xl font-bold text-primary">Custom Pricing</span>
                      ) : (
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-primary">
                             {plan.price == 0 ? 'Free' : `$${plan.price}`}
                        </span>
                      {plan.oldPrice ? (
                        <span className="ml-2 text-4xl line-through text-muted-foreground">${plan.oldPrice}</span>
                      ) : null}
                   

                        {plan.billingPeriod && (
                          <span className="text-muted-foreground ml-1 text-lg">/{plan.billingPeriod}</span>
                        )}
                      </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-8 flex-1">
                    <ul className="space-y-4">
                      {plan.description ? plan.description.map((f, i) => (
                        <li key={i} className="flex items-center">
                          <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-card-foreground">{f}</span>
                        </li>
                      )) : <>
                      <li>
                        <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-card-foreground">Access to core features</span>
                      </li>
                      </>}
                    </ul>
                  </div>

                  {showActions && (
                  <Button
                    variant={plan.isPopular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => {
                      if(isAuthenticated && hasActivePaidSubscription) {
                         // User already has a paid plan, redirect to manage subscription
                         router.push('/profil?tab=subscription');
                         return;
                      }
                      if(plan.price && plan.billingPeriod.toString().toLowerCase() === 'custom') {
                        window.open('/contact', '_self');
                        return;
                      }
                      openModal(plan)
                    }}
                    className={`w-full rounded-xl font-semibold transition-all duration-300 ${
                      plan.isPopular ? 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-medium hover:shadow-glow' : ''
                    }`}
                  >
                    {redirecting === plan.id ? 'Redirecting...' : ctaText}
                  </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Comparison table (improved) */}
        {showActions && (
        <div className="mt-12 overflow-x-auto">
            {/* Section Header */}
        <div className="text-left mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
            Comparision{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
              Table
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mx-auto">
            Flexible pricing that grows with you. Start free — upgrade anytime.
          </p>
        </div>
          <table className="w-full text-left border-collapse bg-card rounded-lg overflow-hidden">
            <thead className="bg-muted/5">
              <tr>
                <th className="py-4 px-4 w-48"></th>
                {plans.map(p => {
                  const Icon = iconForName(p.name);
                  return (
                    <th key={p.id} className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-muted-foreground text-sm mt-1">
                          {p.price == 0 ? 'Free' : `$${p.price}`}
                          {p.oldPrice ? (
                            <span className="ml-2 text-xs line-through text-muted-foreground">${p.oldPrice}</span>
                          ) : null}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-3 px-4 font-medium">Billing Period</td>
                {plans.map(p => (
                  <td key={p.id} className="py-3 px-4">{p.billingPeriod ?? '—'}</td>
                ))}
              </tr>
              <tr className="border-t bg-muted/5">
                <td className="py-3 px-4 font-medium">Projects</td>
                {plans.map(p => (
                  <td key={p.id} className="py-3 px-4">{p.config?.nbrProjects ? `${p.config?.nbrProjects} ${p.config?.nbrProjects === 1 ? 'project' : 'projects'}` : '—'}</td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="py-3 px-4 font-medium">Pages / Access</td>
                {plans.map(p => (
                  <td key={p.id} className="py-3 px-4">
                    {Array.isArray(p.config?.allowPages) ? (
                      <div className="grid grid-cols-3 gap-2">
                        {p.config!.allowPages!.map((ap: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 bg-muted/10 rounded-full">{ap}</span>
                        ))}
                      </div>
                    ) : p.config?.allowPages === true ? (
                      <div className="flex items-center justify-center gap-2 text-green-500">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">All pages</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <X className="h-4 w-4" />
                        <span className="text-sm">None</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-t bg-muted/5">
                <td className="py-3 px-4 font-medium">PDF Export</td>
                {plans.map(p => (
                  <td key={p.id} className="py-3 px-4">{renderBoolIcon(p.config?.pdfExport)}</td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="py-3 px-4 font-medium">GitHub Export</td>
                {plans.map(p => (
                  <td key={p.id} className="py-3 px-4">{renderBoolIcon(p.config?.githubExport)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        )}
      </div>
   

      {/* Modal for plan details */}
      {showActions && modalOpen && selectedPlan && (
        <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) closeModal(); }}>
          <DialogContent className="left-auto top-0 right-0 translate-x-0 translate-y-0 fixed h-full w-full max-w-4xl p-6 sm:rounded-l-lg bg-card shadow-xl overflow-hidden">
            <DialogTitle className="sr-only">{selectedPlan.name} Plan</DialogTitle>
            <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Pricing card preview */}
              <div className="p-6 bg-card rounded-2xl border border-primary/30  flex flex-col">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {selectedPlan && (() => { const Icon = iconForName(selectedPlan.name); return <Icon className="h-8 w-8 text-primary" />; })()}
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">{selectedPlan.name}</h3>
                  <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-primary">{selectedPlan.price == 0 ? 'Free' : `$${selectedPlan.price}`}</span>
                        {selectedPlan.oldPrice ? (
                          <span className="ml-2 text-xl line-through text-muted-foreground">${selectedPlan.oldPrice}</span>
                        ) : null}
                        {selectedPlan.billingPeriod && (
                          <span className="text-muted-foreground ml-2">/{selectedPlan.billingPeriod}</span>
                        )}
                      </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <ul className="space-y-3">
                    {selectedPlan.description && selectedPlan.description.length > 0 ? (
                      selectedPlan.description.map((d, i) => (
                        <li key={i} className="flex items-start">
                          <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <div className="text-card-foreground">{d}</div>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start">
                        <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <div className="text-card-foreground">Access to core features</div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Right: controls, selects and pay */}
              <div className="p-6 flex flex-col">
                <h3 className="text-2xl font-bold mb-4">Customize your {selectedPlan.name} plan</h3>
                {selectedPlan.billingPeriod.toString().toLowerCase() !== 'forever' ? (
                <div>
                  <div className="text-sm text-muted-foreground">Billing interval</div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setSelectedInterval('monthly')} className={`px-4 py-2 rounded-lg border ${selectedInterval === 'monthly' ? 'bg-primary text-primary-foreground' : ''}`}>1 month</button>
                    <button onClick={() => setSelectedInterval('2months')} className={`px-4 py-2 rounded-lg border ${selectedInterval === '2months' ? 'bg-primary text-primary-foreground' : ''}`}>2 months</button>
                    <button onClick={() => setSelectedInterval('annual')} className={`px-4 py-2 rounded-lg border ${selectedInterval === 'annual' ? 'bg-primary text-primary-foreground' : ''}`}>Annual</button>
                  </div>
                </div>
                ) : null}
                <div className="mt-6">
                  <div className="text-sm text-muted-foreground">Additional options</div>
                  <div className="mt-3 space-y-3">
                    {/* Placeholder for extra selects or toggles (e.g., PDF export, GitHub) */}
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/5 rounded-lg">
                      <div>
                        <div className="font-medium">PDF Export</div>
                        <div className="text-sm text-muted-foreground">Enable PDF export</div>
                      </div>
                      <div className="text-green-500">{renderBoolIcon(selectedPlan.config?.pdfExport)}</div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/5 rounded-lg">
                      <div>
                        <div className="font-medium">GitHub Export</div>
                        <div className="text-sm text-muted-foreground">Export project to GitHub</div>
                      </div>
                      <div className="text-green-500">{renderBoolIcon(selectedPlan.config?.githubExport)}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div className="text-2xl font-bold">{selectedPlan.price == 0 ? 'Free' : `$${(selectedPlan.price * periodFactor(selectedInterval)).toFixed(2)}`}</div>
                      {selectedPlan.oldPrice ? (
                        <div className="text-sm line-through text-muted-foreground">Was ${(selectedPlan.oldPrice * periodFactor(selectedInterval)).toFixed(2)}</div>
                      ) : null}
                    </div>

                    <div className="w-48">
                      <Button size="lg" type="button" onClick={handleModalPay} disabled={modalRedirecting} className="w-full rounded-xl font-semibold">
                        {modalRedirecting ? 'Processing…' : (selectedPlan.price == 0 ? 'Get Started' : `Pay $${(selectedPlan.price * periodFactor(selectedInterval)).toFixed(2)}`)}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={closeModal} className="w-full mt-3">Cancel</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default Pricing;