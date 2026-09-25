import { Link } from "react-router-dom";
import image from "../assets/shocked.jpg";
import { Button, Card } from "../components/ui";

const STEPS = [
  {
    title: "1. Report what you found",
    description:
      "Tell us about the item online — no account needed. This creates a private record only the Student Union can see.",
  },
  {
    title: "2. Bring it to the Student Union",
    description:
      "Take the physical item to the ASTU Student Union Lost & Found office. Reporting online alone doesn't publish anything.",
  },
  {
    title: "3. It gets published",
    description:
      "Once the office receives and verifies the item, it becomes a public listing that its owner can search for.",
  },
  {
    title: "4. Owner submits a claim",
    description:
      "A student who recognizes the item submits a claim explaining why they believe it's theirs.",
  },
  {
    title: "5. Student Union verifies",
    description:
      "The office reviews every claim, checks a valid institutional student ID in person, and decides ownership.",
  },
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Find what belongs to you.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              ASTU Lost &amp; Found helps students search property that has been found on
              campus, received, and verified by the ASTU Student Union.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/found-items" size="lg">
                Browse Found Items
              </Button>
              <Button as={Link} to="/report-found" variant="secondary" size="lg">
                Report Found Item
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Found something? Reporting it online is only step one — see how the full
              process works below.
            </p>
          </div>

          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <img
              src={image}
              alt="Student surprised after losing a personal item"
              className="w-full rounded-2xl object-cover shadow-card"
            />
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How it works
          </h2>
          <p className="mt-3 text-slate-600">
            The Student Union physically holds every found item and makes the final
            ownership decision — this site helps coordinate the process.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <Card key={step.title} className="text-left">
              <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust / Student Union role */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <h3 className="text-base font-semibold text-slate-900">The Student Union decides ownership</h3>
            <p className="mt-2 text-sm text-slate-600">
              Submitting a claim does not automatically give you the item. Staff review
              every claim and verify identity in person before anything is released.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Nothing is public until it's received</h3>
            <p className="mt-2 text-sm text-slate-600">
              An online found-item report stays private until the physical item actually
              arrives at the office — the site never lists something the Student Union
              doesn't have.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Private details stay private</h3>
            <p className="mt-2 text-sm text-slate-600">
              Contact information and identifying details used to verify a claim are
              never shown to the public — only what's needed to recognize an item.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
