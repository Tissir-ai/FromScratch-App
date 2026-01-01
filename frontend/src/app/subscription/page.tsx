"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Pricing from "@/components/Pricing";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { Sun, Moon, ArrowLeft ,ShieldCheck, Shield  } from "lucide-react";
import { confirmCheckout } from '@/services/payment.service';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionPage() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [status, setStatus] = useState<'idle'|'pending'|'success'|'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<{ payment?: any; subscription?: any } | null>(null);
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        if (!search) return;
        if (!search.has('success')) return;
        const sessionId = search.get('session_id');
        if (!sessionId) {
          // show toast for missing session id
          toast({ title: 'Payment confirmation failed', description: 'Missing session id' });
          return setStatus('error');
        }

        setStatus('pending');
        const res: any = await confirmCheckout(sessionId);
        // expect { payment, subscription }
        setReceiptData({ payment: res.payment, subscription: res.subscription });
        setStatus('success');
        setMessage('Payment processed and subscription activated');
      } catch (err: any) {
        console.error('Stripe confirm failed', err);
        setStatus('error');
        // only show a toast on error
        toast({ title: 'Payment confirmation failed', description: err?.message ?? 'Failed to confirm payment' });
      }
    })();
  }, []);

  return (
    <div className="mx-auto  bg-feature-background">
      {(status === 'idle' || status === 'error') && (
        <>
          <button onClick={() => router.back()} className="absolute top-5 left-6 text-sm text-primary flex justify-center items-center gap-1 hover:underline "><ArrowLeft className="w-4 h-4" /> Go back</button>
      <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{isDarkMode ? 'Dark' : 'Light'}</span>
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
        </div>
      <Pricing />

              {/* Payment logos & Security badges */}
        <div className="max-w-7xl mx-auto px-4 pb-10 ">
          <div className="bg-transparent rounded-lg py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 justify-center md:justify-start flex-wrap">
              <span className="text-sm font-medium text-muted-foreground mr-2">We accept</span>
              <div className="flex  items-center gap-2">
                <Image src="/logos/stripe.png" alt="Visa" width={45} height={24} />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-end flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/40 border border-feature-border text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>SOC 2</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/40 border border-feature-border text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>ISO 27001</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/40 border border-feature-border text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
          {status === 'pending' && (
        <div className="max-w-2xl h-screen mx-auto text-center py-6">
          <p>Finalizing your payment...</p>
        </div>
      )}
      {status === 'success' && receiptData && (

                <div className="h-screen">
                  <div className="absolute top-4 right-4 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{isDarkMode ? 'Dark' : 'Light'}</span>
                    <button
                      onClick={toggleDarkMode}
                      className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                  </div>

                      <div className="max-w-4xl mx-auto py-8" ref={receiptRef}>
                        <div className="bg-white dark:bg-muted-foreground/5 rounded-lg p-6 shadow-md">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <Image src="/logos/FromScratch.png" alt="FromScratch Logo" width={64} height={28} />
                              <div>
                                <h2 className="text-2xl font-semibold">Subscription activated</h2>
                                <p className="text-sm text-muted-foreground">Thank you — your subscription is now active.</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="font-medium">{new Date().toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-md font-medium mb-2">Subscription details</h3>
                              <table className="w-full text-sm table-auto border-collapse">
                                <tbody>
                                  <tr className="border-t">
                                    <td className="py-2 text-muted-foreground">Plan</td>
                                    <td className="py-2 font-medium">{receiptData.subscription?.plan?.name ?? receiptData.subscription?.planId}</td>
                                  </tr>
                                  <tr className="border-t">
                                    <td className="py-2 text-muted-foreground">Status</td>
                                    <td className="py-2">{receiptData.subscription?.status}</td>
                                  </tr>
                                  <tr className="border-t">
                                    <td className="py-2 text-muted-foreground">Start date</td>
                                    <td className="py-2">{receiptData.subscription?.startDate ? new Date(receiptData.subscription.startDate).toLocaleString() : '—'}</td>
                                  </tr>
                                  <tr className="border-t">
                                    <td className="py-2 text-muted-foreground">End date</td>
                                    <td className="py-2">{receiptData.subscription?.endDate ? new Date(receiptData.subscription.endDate).toLocaleString() : '—'}</td>
                                  </tr>
                                  <tr className="border-t">
                                    <td className="py-2 text-muted-foreground">Auto renew</td>
                                    <td className="py-2">{receiptData.subscription?.autoRenew ? 'Yes' : 'No'}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div>
                              <h3 className="text-md font-medium mb-2">Payment summary</h3>
                              <table className="w-full text-sm table-auto border-collapse">
                                <tbody>
                                  <tr className="border-t">
                                    <td className="py-2 text-muted-foreground">Receipt ID</td>
                                    <td className="py-2 font-medium">{receiptData.payment?.id}</td>
                                  </tr>
                                  <tr className="border-t">
                                    <td className="py-2 text-muted-foreground">Amount</td>
                                    <td className="py-2">{receiptData.payment?.amount ? `${receiptData.payment.amount} ${receiptData.payment.currency?.toUpperCase() ?? ''}` : '—'}</td>
                                  </tr>
                                  <tr className="border-t">
                                    <td className="py-2 text-muted-foreground">Date</td>
                                    <td className="py-2">{receiptData.payment?.createdAt ? new Date(receiptData.payment.createdAt).toLocaleString() : '—'}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  if (!receiptRef.current) return;
                                  const win = window.open('', '_blank', 'width=800,height=900');
                                  if (!win) return;
                                  win.document.write('<html><head><title>Receipt</title>');
                                  win.document.write('<style>body{font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; padding:20px;} table{width:100%;border-collapse:collapse;} td{padding:8px;border:1px solid #e5e7eb;}</style>');
                                  win.document.write('</head><body>');
                                  win.document.write(receiptRef.current.innerHTML);
                                  win.document.write('</body></html>');
                                  win.document.close();
                                  win.focus();
                                  setTimeout(() => { win.print(); win.close(); }, 250);
                                }}
                                className="px-4 py-2 rounded bg-primary text-primary-foreground"
                              >
                                Print receipt
                              </button>

                              <button onClick={() => { window.location.href = '/projects'; }} className="px-4 py-2 rounded border">
                                Go to projects
                              </button>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              <p>Need help? <a href="/contact" className="text-primary underline">Contact support</a></p>
                            </div>
                          </div>
                        </div>
                      </div>
                  
                </div>
      )}
    </div>
  );
};

