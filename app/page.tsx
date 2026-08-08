import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";
import { images } from "@/lib/images";

const modules = [
  { title: "Game Design", desc: "Design and build original 2D game levels from scratch.", img: images.moduleGameDesign },
  { title: "Coding", desc: "From block-based logic to real text-based programming.", img: images.moduleCoding },
  { title: "Storytelling", desc: "Craft interactive digital stories and characters.", img: images.moduleStorytelling },
  { title: "Teamwork", desc: "Sprint on a group project, just like a real studio.", img: images.moduleTeamwork },
];

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 md:px-12 py-6 flex items-center justify-between">
        <Wordmark size="sm" className="drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]" />
        <nav className="flex items-center gap-4">
          <Link
            href="/showcase"
            className="text-sm text-white hover:text-gold transition drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
          >
            Showcase
          </Link>
          <Link href="/login">
            <Button variant="outline" className="text-xs px-4 py-2 bg-black/40 backdrop-blur-sm">
              Sign in
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative h-[92vh] min-h-[560px] flex items-end">
        <Image
          src={images.heroWorkshop}
          alt="Young people collaborating on a laptop during a Play to Progress coding workshop"
          fill
          priority
          className="object-cover"
        />
        {/* Bottom-up gradient for the hero copy */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        {/* Dedicated top scrim so the nav bar stays legible over any photo */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/85 via-black/40 to-transparent" />
        <div className="relative z-10 px-6 md:px-12 pb-20 md:pb-28 max-w-3xl">
          <p className="text-gold text-xs md:text-sm uppercase tracking-[0.3em] mb-4">
            Profit + Play — Newham, East London
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-[0.95] mb-6">
            PLAY TO <span className="gold-text">PROGRESS</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mb-8">
            Free digital gaming and creative coding workshops for young people aged 11–18.
            8 weeks. Real skills. A showcase that celebrates what they build.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/showcase">
              <Button className="px-7 py-3">View the Showcase</Button>
            </Link>
            <Link href="/login">
              <Button variant="black" className="px-7 py-3">
                Coordinator / Partner / Parent Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/10 bg-surface">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {[
            ["40+", "Beneficiaries"],
            ["8 Weeks", "Programme"],
            ["5 Modules", "Curriculum"],
            ["4 Portals", "User Interfaces"],
          ].map(([value, label]) => (
            <div key={label} className="px-6 py-10 text-center">
              <p className="font-display text-3xl md:text-4xl font-extrabold gold-text">{value}</p>
              <p className="text-xs uppercase tracking-wider text-white/40 mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="max-w-4xl mx-auto px-6 md:px-0 py-24 md:py-32 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
          Raising aspirations, <span className="gold-text">one session at a time</span>
        </h2>
        <p className="text-white/60 leading-relaxed">
          Play to Progress is an initiative of Profit + Play, funded by the London City
          Airport Community Fund. Delivered in partnership with Oasis Academy Silvertown,
          Shipman Youth Zone, and Newham Council, the programme gives young people in East
          London structured, high-quality digital skills that connect to real career pathways
          in tech, media, and the creative industries — culminating in a community showcase
          where every young person&apos;s work is celebrated.
        </p>
      </section>

      {/* Modules */}
      <section className="max-w-6xl mx-auto px-6 md:px-0 pb-24 md:pb-32">
        <h3 className="font-display text-2xl md:text-3xl font-bold mb-10 text-center">
          What young people <span className="gold-text">build</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {modules.map((m) => (
            <div key={m.title} className="card-surface rounded-lg overflow-hidden group">
              <div className="relative h-40">
                <Image src={m.img} alt={m.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              </div>
              <div className="p-4">
                <p className="font-display font-bold text-lg">{m.title}</p>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Career pathways teaser */}
      <section className="relative py-24 md:py-32">
        <Image
          src={images.careerPathways}
          alt="Young person exploring a career pathway in tech and creative industries"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
          <h3 className="font-display text-3xl font-bold mb-4">
            A pathway to <span className="gold-text">real careers</span>
          </h3>
          <p className="text-white/60 mb-8">
            Beyond the 8 weeks, participants leave with a portfolio, a digital CV, and a clear
            view of routes into tech, media, and creative industries.
          </p>
          <Link href="/showcase">
            <Button variant="outline">See what they&apos;ve made</Button>
          </Link>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <Wordmark size="sm" />
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} Profit + Play, Newham. Funded by the London City Airport Community Fund.
        </p>
      </footer>
    </main>
  );
}