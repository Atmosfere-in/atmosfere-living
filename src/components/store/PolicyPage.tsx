import Link from "next/link";
import { POLICIES_UPDATED } from "@/lib/site";
import { fmtDate } from "@/lib/utils";

export const POLICY_LINKS: [string, string][] = [
  ["/policies/shipping", "Shipping & delivery"],
  ["/policies/returns", "Returns & refunds"],
  ["/policies/terms", "Terms of use"],
  ["/policies/privacy", "Privacy policy"],
  ["/contact", "Contact us"],
];

export type PolicySection = { heading: string; body: React.ReactNode };

export function PolicyPage({ title, intro, sections, path }: { title: string; intro: string; sections: PolicySection[]; path: string }) {
  return (
    <div className="container-lux grid gap-12 py-16 md:py-24 lg:grid-cols-12">
      <nav aria-label="Policies" className="lg:col-span-3">
        <ul className="flex gap-x-6 gap-y-3 overflow-x-auto text-sm lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:flex-col">
          {POLICY_LINKS.map(([href, label]) => (
            <li key={href} className="shrink-0">
              <Link href={href} className={href === path ? "text-ink underline underline-offset-4" : "text-stone-600 hover:text-ink"}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <article className="max-w-2xl lg:col-span-8 lg:col-start-5">
        <p className="eyebrow">Last updated {fmtDate(POLICIES_UPDATED)}</p>
        <h1 className="display mt-4 text-[clamp(2.25rem,4vw,3.5rem)]">{title}</h1>
        <p className="mt-6 text-stone-600 font-light leading-relaxed">{intro}</p>
        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl">{s.heading}</h2>
              <div className="mt-3 space-y-3 text-stone-600 font-light leading-relaxed [&_li]:ml-5 [&_li]:list-disc [&_a]:underline">{s.body}</div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}

/** Points customers to the contact page, which lists whichever contact details are filled in. */
export function ContactLine() {
  return (
    <>
      Reach us through the details on our <Link href="/contact">contact page</Link>.
    </>
  );
}
