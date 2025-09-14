"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const STEPS = ["Info", "Quote", "Apply"] as const;

type Plan = {
  id: string;
  label: string;
  feeBusiness: number;
  monthly: number;
  description: string;
};

const plans: Plan[] = [
  {
    id: "consumerChoice",
    label: "Consumer Choice",
    feeBusiness: 0,
    monthly: 25,
    description: "Consumer pays all card fees; equipment adds 3.75% to total.",
  },
  {
    id: "rewardPay",
    label: "Reward Pay",
    feeBusiness: 0.75,
    monthly: 25,
    description:
      "Consumer pays 3% to cover credit cards; merchant pays debit & a small portion of credit.",
  },
  {
    id: "traditional",
    label: "Interchange Plus",
    feeBusiness: 2.75,
    monthly: 10,
    description: "Merchant pays all fees.",
  },
];

type Hardware = {
  id: string;
  label: string;
  rentCost: string;
  purchaseCost: string;
  description: string;
  image: string;
};

const hardwareItems: Hardware[] = [
  {
    id: "n950s",
    label: "N950S",
    rentCost: "$0/mo",
    purchaseCost: "$0",
    description: "Stationary smart terminal",
    image: "/N950S.jpg",
  },
  {
    id: "n950",
    label: "N950",
    rentCost: "$19.99/mo",
    purchaseCost: "$99",
    description: "Mobile smart terminal",
    image: "/N950.jpg",
  },
  {
    id: "x800",
    label: "X800 mini POS",
    rentCost: "$39.99/mo",
    purchaseCost: "$499",
    description: "Larger mobile POS",
    image: "/X800.jpg",
  },
];

type FormDataShape = {
  phone: string;
  name: string;
  email: string;
  type: string;
  volume: string;
  currentRate: string;
  address: string;
  bank: string;
  routing: string;
  account: string;
  classification: string;
  ein: string;
  ssn: string;
  voidedCheck: File | null;
  idImage: File | null;
};

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormDataShape>({
    phone: "",
    name: "",
    email: "",
    type: "",
    volume: "",
    currentRate: "",
    address: "",
    bank: "",
    routing: "",
    account: "",
    classification: "",
    ein: "",
    ssn: "",
    voidedCheck: null,
    idImage: null,
  });
  const [agreed, setAgreed] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>(plans[0].id);
  const [submitResult, setSubmitResult] = useState<string>("");

  // initialize hardware state without any
  const initialHardware = hardwareItems.reduce<
    Record<string, { rent: boolean; buy: boolean }>
  >((acc, h) => {
    acc[h.id] = { rent: false, buy: false };
    return acc;
  }, {});

  const [hardware, setHardware] = useState(initialHardware);

  const update = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      const file = e.target.files?.[0] ?? null;
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement | HTMLSelectElement).value,
      }));
    }
  };

  const toggleHardware = (id: string, field: "rent" | "buy", value: boolean) => {
    setHardware((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const getPOS = (bizType: string) =>
    ["restaurant", "bar", "food truck"].includes(bizType.toLowerCase())
      ? "Clover Solo"
      : "Newland 950";

  const infoFields = ["phone", "name", "email", "type", "volume", "currentRate"] as const;
  const appFields = [
    "address",
    "bank",
    "routing",
    "account",
    "classification",
    "ein",
    "ssn",
    "voidedCheck",
    "idImage",
  ] as const;

  const fieldLabels: Record<string, string> = {
    phone: "Phone",
    name: "Name",
    email: "Email",
    type: "Type of Business",
    volume: "Last month's card sales",
    currentRate: "Last month's total processing fees",
  };

  const validInfo = infoFields.every((f) => Boolean(formData[f]));
  const validPlan = Boolean(selectedPlan);
  const validApply = appFields.every((f) => Boolean(formData[f])) && agreed;

  const nextStep = () => {
    if (step === 0 && !validInfo) return;
    if (step === 1 && !validPlan) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const effectiveRate =
    formData.volume && formData.currentRate
      ? ((Number(formData.currentRate) / Number(formData.volume)) * 100).toFixed(2)
      : "";

  // NEW: helper to compute estimated savings for a given plan (if currentRate provided)
  const estimateSavings = (p: Plan) => {
    if (!formData.currentRate) return null;
    const current = Number(formData.currentRate);
    const newCost = p.feeBusiness > 0
      ? Number(formData.volume || 0) * (p.feeBusiness / 100) + p.monthly
      : p.monthly;
    const savings = current - newCost; // positive means savings
    return savings;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validApply) return;

    const form = e.currentTarget;
    setSubmitResult("Sending…");

    try {
      const payload = new FormData(form);
      payload.set("access_key", "dd87f167-5c89-4038-a307-50f83aa50209");
      payload.set("subject", "New Merchant Application");
      payload.set("from_name", formData.name);
      payload.set("selected_plan", selectedPlan);

      // 🔹 Add CC email (semicolon-delimited if you add more later)
      payload.set("ccemail", "info@rivamerchant.com");

      // hardware lines
      const hwLines = hardwareItems
        .map((h) => {
          const sel = hardware[h.id];
          if (sel.rent) return `${h.label}: Rent (${h.rentCost})`;
          if (sel.buy) return `${h.label}: Purchase (${h.purchaseCost})`;
          return null;
        })
        .filter((x): x is string => Boolean(x))
        .join("\n");

      // build message
      const message = [
        `Name: ${formData.name}`,
        `Phone: ${formData.phone}`,
        `Email: ${formData.email}`,
        `Business Type: ${formData.type}`,
        `Last Month's Card Sales: ${formData.volume}`,
        `Last Month's Processing Fees: ${formData.currentRate}`,
        `Selected Plan: ${plans.find((p) => p.id === selectedPlan)?.label}`,
        `Terminal: ${getPOS(formData.type)}`,
        ``,
        `--- Hardware Selection ---`,
        hwLines || "None selected",
        ``,
        `Address: ${formData.address}`,
        `Bank: ${formData.bank}`,
        `Routing: ${formData.routing}`,
        `Account: ${formData.account}`,
        `Classification: ${formData.classification}`,
        `EIN: ${formData.ein}`,
        `SSN: ${formData.ssn}`,
      ].join("\n\n");

      payload.set("message", message);

      const response = await fetch("/api/contact", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (data.success) {
        setSubmitResult("Application submitted successfully!");
        form.reset();
        setStep(0);
      } else {
        setSubmitResult(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setSubmitResult("Network error. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="overflow-hidden rounded-2xl shadow-lg">
          <CardContent className="bg-white p-8 lg:p-12 space-y-10">
            {/* Logo + Steps */}
            <div className="flex justify-center">
              <Image src="/logo.jpg" alt="Riva Logo" width={200} height={60} />
            </div>
            <div className="flex items-center justify-center mb-10 space-x-4">
              {STEPS.map((_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
                      i <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Step 1: Business Info */}
              {step === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Information</h2>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {infoFields.map((f) => (
                      <div key={f} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          {fieldLabels[f]}
                        </label>
                        {f === "type" ? (
                          <Dropdown
                            name={f}
                            value={formData[f]}
                            onChange={update}
                            options={[
                              { value: "Restaurant", label: "Restaurant" },
                              { value: "Retail store", label: "Retail store" },
                              { value: "Service business", label: "Service business" },
                            ]}
                          />
                        ) : (
                          <Input
                            name={f}
                            type={
                              ["volume", "currentRate"].includes(f)
                                ? "number"
                                : f === "email"
                                ? "email"
                                : "text"
                            }
                            placeholder={`Enter ${fieldLabels[f]}`}
                            value={formData[f] as string}
                            onChange={update}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Effective Rate</label>
                    <Input value={effectiveRate ? `${effectiveRate}%` : ""} readOnly />
                  </div>

                  {/* NEW: Help line on first page */}
                  <p className="mt-6 text-sm text-gray-600">
                    If you need help, contact <a href="mailto:info@rivamerchant.com" className="underline">info@rivamerchant.com</a>.
                  </p>
                </motion.div>
              )}

              {/* Step 2: Choose Plan + Hardware */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Plan</h2>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-[2fr,1fr,1fr]">
                    {plans.map((p, idx) => {
                      const savings = estimateSavings(p);
                      const hasSavings = typeof savings === "number";
                      const savingsAbs = hasSavings ? Math.abs(savings as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;
                      const positive = (savings ?? 0) > 0;

                      return (
                        <motion.div
                          key={p.id}
                          onClick={() => setSelectedPlan(p.id)}
                          className={`p-6 rounded-xl cursor-pointer border transition-all duration-300 shadow-md hover:shadow-xl ${
                            selectedPlan === p.id ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
                          } relative`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, scale: selectedPlan === p.id ? 1.05 : 1 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">{p.label}</h3>
                          <span className="block text-2xl font-bold text-gray-900 mb-2">${p.monthly}/mo</span>
                          <p className="text-sm text-gray-600 mb-4">{p.description}</p>

                          {/* REPLACED: show Business fee + Estimated Savings (green). */}
                          <ul className="text-sm space-y-1">
                            {p.feeBusiness > 0 && (
                              <li className="text-gray-600">Business fee: {p.feeBusiness}%</li>
                            )}
                            {/* Previously: Est. cost: ${computeCost(p)} */}
                            {hasSavings && (
                              <li className={`font-semibold ${positive ? "text-green-700" : "text-red-600"}`}>
                                Estimated savings: ${savingsAbs}/mo
                              </li>
                            )}
                          </ul>

                          {selectedPlan === p.id && (
                            <div className="absolute top-4 right-4 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-6 space-y-8">
                    <div className="mb-8">
                      {/* Make the heading green so it stands out */}
                      <h3 className="text-xl font-semibold text-green-700 mb-2">Estimated Savings</h3>
                      {formData.currentRate && selectedPlan ? (
                        (() => {
                          const current = Number(formData.currentRate);
                          const selected = plans.find((p) => p.id === selectedPlan);
                          if (!selected) return null;
                          const newCost =
                            selected.feeBusiness > 0
                              ? Number(formData.volume) * (selected.feeBusiness / 100) + selected.monthly
                              : selected.monthly;
                          const savings = current - newCost;
                          const formattedAmount = Math.abs(savings).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          });
                          const isPositive = savings > 0;

                          return (
                            <p className={`text-lg font-medium ${isPositive ? "text-green-700" : "text-red-600"}`}>
                              {isPositive
                                ? `You could save approx. $${formattedAmount} per month.`
                                : `This plan may cost approx. $${formattedAmount} more than your current fees.`}
                            </p>
                          );
                        })()
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Enter your current processing fee and select a plan to calculate savings.
                        </p>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Hardware Selection</h3>
                    {hardwareItems.map((h) => (
                      <div key={h.id} className="space-y-2">
                        <p className="font-medium">
                          {h.label} <span className="text-sm text-gray-500">({h.description})</span>
                        </p>
                        <Image src={h.image} alt={h.label} width={120} height={80} className="rounded-md shadow" />
                        <div className="flex items-center space-x-6">
                          <label className="flex items-center space-x-2">
                            <Checkbox
                              id={`rent_${h.id}`}
                              checked={hardware[h.id].rent}
                              onCheckedChange={(v) => toggleHardware(h.id, "rent", Boolean(v))}
                            />
                            <span>Rent ({h.rentCost})</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <Checkbox
                              id={`buy_${h.id}`}
                              checked={hardware[h.id].buy}
                              onCheckedChange={(v) => toggleHardware(h.id, "buy", Boolean(v))}
                            />
                            <span>Purchase ({h.purchaseCost})</span>
                          </label>
                        </div>
                      </div>
                    ))}

                    <p className="text-sm text-gray-600">
                      All hardware is no-contract rentals with lifetime warranty.
                      <br />
                      Pay nothing now—payment collected after installation.
                      <br />
                      Need something different or help deciding? Call us at{" "}
                      <a href="tel:715-718-6388" className="underline">
                        715-718-6388
                      </a>{" "}
                      or email{" "}
                      <a href="mailto:info@rivamerchant.com" className="underline">
                        info@rivamerchant.com
                      </a>
                      .
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Application Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Application Details</h2>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {appFields.map((f) => (
                      <div key={f} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          {f.replace(/([A-Z])/g, " $1")}
                        </label>
                        {f === "classification" ? (
                          <Dropdown
                            name="classification"
                            value={formData.classification}
                            onChange={update}
                            options={[
                              { value: "LLC", label: "LLC" },
                              { value: "Partnership", label: "Partnership" },
                              { value: "Private Corporation", label: "Private Corporation" },
                              { value: "Nonprofit", label: "Nonprofit" },
                              { value: "Sole Proprietor", label: "Sole Proprietor" },
                              { value: "Publicly Traded Corporation", label: "Publicly Traded Corporation" },
                              { value: "SEC Registered Entity", label: "SEC Registered Entity" },
                              { value: "Government Entity", label: "Government Entity" },
                              { value: "Financial Institution", label: "Financial Institution" },
                              { value: "Estate/Trust", label: "Estate/Trust" },
                            ]}
                          />
                        ) : (
                          <Input
                            name={f}
                            type={f === "voidedCheck" || f === "idImage" ? "file" : "text"}
                            onChange={update}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-start space-x-2">
                    <Checkbox id="agree" checked={agreed} onCheckedChange={setAgreed} />
                    <label htmlFor="agree" className="text-sm text-gray-700">
                      I agree to let <strong>Riva Merchant Solutions</strong> use this information to submit a merchant
                      application.
                    </label>
                  </div>

                  {/* NEW: Help line on last page */}
                  <p className="mt-6 text-sm text-gray-600">
                    If you need help, contact <a href="mailto:info@rivamerchant.com" className="underline">info@rivamerchant.com</a>.
                  </p>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={nextStep} disabled={step === 0 ? !validInfo : !validPlan}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={!validApply}>
                    Submit
                  </Button>
                )}
              </div>
            </form>

            {submitResult && <p className="mt-4 text-center text-gray-700">{submitResult}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
