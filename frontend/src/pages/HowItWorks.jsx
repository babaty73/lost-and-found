import { Link } from "react-router-dom";
import { PageHeader, Card } from "../components/ui";

const STEPS = [
  {
    title: "Found something?",
    body: (
      <>
        <Link to="/report-found" className="font-medium text-primary-600 hover:text-primary-700">
          Report it online
        </Link>{" "}
        with a description and your institutional student ID. No account or password
        needed — this only creates a private record.
      </>
    ),
  },
  {
    title: "Bring it to the Student Union",
    body: "Take the physical item to the ASTU Student Union Lost & Found office. Your online report alone doesn't publish anything.",
  },
  {
    title: "The Student Union publishes it",
    body: (
      <>
        Once staff receive and verify the item, it appears in the{" "}
        <Link to="/found-items" className="font-medium text-primary-600 hover:text-primary-700">
          found items list
        </Link>
        .
      </>
    ),
  },
  {
    title: "Think you see your item?",
    body: "Open its listing and submit a claim. You'll explain why you believe it's yours (or describe it if you're helping a friend recover it).",
  },
  {
    title: "The Student Union reviews",
    body: "Staff review every claim on an item — there can be more than one — and decide which, if any, is verified. Submitting a claim never guarantees the item is released to you.",
  },
  {
    title: "Verified? Visit in person",
    body: "If your claim is verified, visit the Student Union with your institutional student ID. Staff confirm your identity in person before releasing anything.",
  },
];

// Replaces the old "Dashboard" page, which showed a "Retrieved Items" stat
// that was never wired to any backend field. This page is public — no
// login exists for students — and explains the process instead.
function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="How It Works"
        description="The ASTU Student Union Lost & Found office physically receives, stores, and releases items. This site helps you report, search, and stay in the loop — it never gives anyone physical possession of an item on its own."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <Card key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
              {i + 1}
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-1.5 text-sm text-slate-600">{step.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default HowItWorks;
