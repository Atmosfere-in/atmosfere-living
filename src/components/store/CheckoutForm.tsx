"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { checkDiscount, placeOrder } from "@/lib/actions/store";
import { cx, img, inr, shippingFor } from "@/lib/utils";
import type { Address, ShippingAddress } from "@/lib/types";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const empty: ShippingAddress = { full_name: "", phone: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "India" };

export function CheckoutForm({
  addresses,
  defaults,
  email,
}: {
  addresses: Address[];
  defaults: { full_name: string; phone: string };
  email: string;
}) {
  const router = useRouter();
  const { items, subtotal, clear, ready } = useCart();
  const [selected, setSelected] = useState<string>(addresses[0]?.id ?? "new");
  const [addr, setAddr] = useState<ShippingAddress>({ ...empty, ...defaults });
  const [save, setSave] = useState(addresses.length === 0);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<{ code: string; amount: number; description: string | null } | null>(null);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const [payment, setPayment] = useState("cod");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [applying, startApply] = useTransition();

  const discountAmt = discount?.amount ?? 0;
  const shipping = shippingFor(subtotal - discountAmt);
  const total = subtotal - discountAmt + shipping;

  if (!ready) return null;
  if (items.length === 0) {
    return (
      <div className="py-24">
        <p className="display text-3xl">Your bag is empty.</p>
        <Link href="/shop" className="btn btn-dark mt-8">
          Explore the shop
        </Link>
      </div>
    );
  }

  const set = (k: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddr((a) => ({ ...a, [k]: e.target.value }));

  const submit = () => {
    setError(null);
    const chosen = addresses.find((a) => a.id === selected);
    const shippingAddress: ShippingAddress = chosen
      ? {
          full_name: chosen.full_name,
          phone: chosen.phone,
          line1: chosen.line1,
          line2: chosen.line2,
          city: chosen.city,
          state: chosen.state,
          postal_code: chosen.postal_code,
          country: chosen.country,
        }
      : addr;
    start(async () => {
      const r = await placeOrder({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        address: shippingAddress,
        discountCode: discount?.code,
        paymentMethod: payment,
        notes,
        saveAddress: !chosen && save,
      });
      if (!r.ok) return setError(r.error);
      clear();
      router.push(`/account/orders/${r.data!.id}?placed=1`);
    });
  };

  return (
    <div className="mt-12 grid gap-14 lg:grid-cols-12">
      <div className="space-y-14 lg:col-span-7">
        <section>
          <h2 className="display text-2xl">Contact</h2>
          <p className="mt-2 text-sm text-stone-600">Order updates will be sent to {email}.</p>
        </section>

        <section className="space-y-5">
          <h2 className="display text-2xl">Shipping address</h2>
          {addresses.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={cx(
                    "card cursor-pointer p-5 text-sm transition-colors",
                    selected === a.id ? "border-ink" : "hover:border-stone-400",
                  )}
                >
                  <input type="radio" name="addr" className="sr-only" checked={selected === a.id} onChange={() => setSelected(a.id)} />
                  <span className="badge mb-3">{a.label ?? "Address"}</span>
                  <p className="font-medium">{a.full_name}</p>
                  <p className="text-stone-600">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal_code}
                  </p>
                  <p className="text-stone-600">{a.phone}</p>
                </label>
              ))}
              <label className={cx("card grid cursor-pointer place-items-center p-5 text-sm", selected === "new" ? "border-ink" : "hover:border-stone-400")}>
                <input type="radio" name="addr" className="sr-only" checked={selected === "new"} onChange={() => setSelected("new")} />
                + Use a new address
              </label>
            </div>
          )}

          {selected === "new" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={addr.full_name} onChange={set("full_name")} autoComplete="name" />
              <Field label="Phone" value={addr.phone} onChange={set("phone")} autoComplete="tel" type="tel" />
              <Field label="Address line 1" value={addr.line1} onChange={set("line1")} autoComplete="address-line1" className="sm:col-span-2" />
              <Field label="Address line 2 (optional)" value={addr.line2 ?? ""} onChange={set("line2")} autoComplete="address-line2" className="sm:col-span-2" />
              <Field label="City" value={addr.city} onChange={set("city")} autoComplete="address-level2" />
              <div>
                <label className="label">State</label>
                <select className="field" value={addr.state} onChange={set("state")} autoComplete="address-level1">
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Field label="PIN code" value={addr.postal_code} onChange={set("postal_code")} autoComplete="postal-code" inputMode="numeric" maxLength={6} />
              <label className="flex items-center gap-3 self-end pb-3 text-sm">
                <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="accent-[var(--color-accent)]" />
                Save this address to my account
              </label>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="display text-2xl">Payment</h2>
          {[
            ["cod", "Cash / UPI on delivery", "Pay when your order arrives."],
            ["bank_transfer", "Bank transfer", "We’ll email our bank details after you place the order."],
            ["online", "Card, UPI & netbanking", "Online payments are coming soon."],
          ].map(([v, t, d]) => (
            <label
              key={v}
              className={cx(
                "card flex items-start gap-4 p-5",
                v === "online" ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                payment === v && "border-ink",
              )}
            >
              <input type="radio" name="payment" value={v} disabled={v === "online"} checked={payment === v} onChange={() => setPayment(v)} className="mt-1 accent-[var(--color-accent)]" />
              <span>
                <span className="block text-sm font-medium">{t}</span>
                <span className="block text-sm text-stone-600">{d}</span>
              </span>
            </label>
          ))}
        </section>

        <section>
          <label className="label" htmlFor="notes">
            Delivery notes (optional)
          </label>
          <textarea id="notes" className="field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gate code, preferred delivery time…" />
        </section>
      </div>

      <aside className="lg:col-span-5">
        <div className="card sticky top-[calc(var(--header-height)+24px)] space-y-6 p-8">
          <h2 className="display text-2xl">Your order</h2>
          <ul className="space-y-4">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-4">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-stone-100">
                  <Image src={img(i.image, 200)} alt="" fill sizes="56px" className="object-cover" />
                  <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-bl-md bg-charcoal px-1 text-[0.6rem] text-ivory">{i.quantity}</span>
                </div>
                <span className="flex-1 text-sm">{i.name}</span>
                <span className="text-sm">{inr(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-stone-200 pt-6">
            {discount ? (
              <div className="flex items-center justify-between text-sm">
                <span>
                  <span className="badge text-accent">{discount.code}</span>
                  <span className="ml-2 text-stone-600">{discount.description}</span>
                </span>
                <button onClick={() => setDiscount(null)} className="text-xs underline cursor-pointer">
                  Remove
                </button>
              </div>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setCodeMsg(null);
                  startApply(async () => {
                    const r = await checkDiscount(code, subtotal);
                    if (r.ok) setDiscount(r.data!);
                    else setCodeMsg(r.error);
                  });
                }}
              >
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Discount code" className="field !min-h-11" />
                <button disabled={!code || applying} className="btn btn-outline !min-h-11">
                  Apply
                </button>
              </form>
            )}
            {codeMsg && <p className="mt-2 text-xs text-red-700">{codeMsg}</p>}
          </div>

          <div className="space-y-2 border-t border-stone-200 pt-6 text-sm">
            <Line k="Subtotal" v={inr(subtotal)} />
            {discountAmt > 0 && <Line k="Discount" v={`− ${inr(discountAmt)}`} accent />}
            <Line k="Shipping" v={shipping === 0 ? "Complimentary" : inr(shipping)} />
          </div>
          <div className="flex items-baseline justify-between border-t border-stone-200 pt-6">
            <span>Total</span>
            <span className="font-display text-3xl">{inr(total)}</span>
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button onClick={submit} disabled={pending} className="btn btn-dark w-full">
            {pending ? "Placing order…" : "Place order"}
          </button>
          <p className="text-center text-xs text-stone-400">Final prices and stock are confirmed when you place the order.</p>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, className, ...rest }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input className="field" {...rest} />
    </div>
  );
}

function Line({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-stone-600">{k}</span>
      <span className={accent ? "text-accent" : ""}>{v}</span>
    </div>
  );
}
