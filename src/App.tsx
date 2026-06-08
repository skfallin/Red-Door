import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  motion,
  useScroll,
  useTransform,
  type Transition,
} from 'motion/react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260417_110451_9f82b157-dc92-4a9f-a341-c25594ec20e1.mp4';

const revealTransition: Transition = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1],
};

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ ...revealTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

type NavItemProps = {
  href: string;
  children: string;
};

function NavItem({ href, children }: NavItemProps) {
  const [cycle, setCycle] = useState(0);

  return (
    <a
      href={href}
      className="relative inline-flex h-4 overflow-hidden text-white/64 transition-colors duration-300 hover:text-white"
      onMouseEnter={() => setCycle((value) => value + 1)}
      onMouseLeave={() => setCycle((value) => value + 1)}
    >
      <span
        key={`out-${cycle}`}
        className="block animate-fly-out-up"
        aria-hidden={cycle > 0}
      >
        {children}
      </span>
      <span
        key={`in-${cycle}`}
        className="absolute inset-0 block animate-fly-in-up"
        aria-hidden="true"
      >
        {children}
      </span>
      <span className="sr-only">{children}</span>
    </a>
  );
}

function SpaceLogo() {
  return (
    <a href="#" className="flex items-center gap-3" aria-label="Red Door Studio">
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="text-white"
      >
        <path d="M22 3L39 12.5V31.5L22 41L5 31.5V12.5L22 3Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M22 9L34 15.75V29.25L22 36L10 29.25V15.75L22 9Z" stroke="currentColor" strokeOpacity="0.42" strokeWidth="1" />
        <path d="M5 12.5L22 22L39 12.5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
        <path d="M22 22V41" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
        <circle cx="22" cy="22" r="4.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2 22H14M30 22H42" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span className="hidden font-mono text-[11px] font-bold tracking-[0.28em] text-white/80 sm:block">
        RED DOOR
      </span>
    </a>
  );
}

function ScrollScrubVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    if (isTouchDevice) {
      let duration = 0;
      let targetTime = 0;
      let requestRef = 0;
      let seekQueued = false;

      const getScrollTargetTime = () => {
        const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
        const scrollY = Math.min(Math.max(window.scrollY, 0), Math.max(scrollRange, 0));
        const scrollFraction = scrollRange > 0 ? scrollY / scrollRange : 0;

        return scrollFraction * duration;
      };

      const applyTargetTime = () => {
        requestRef = 0;

        if (!duration || video.readyState < HTMLMediaElement.HAVE_METADATA || video.seeking) {
          seekQueued = true;
          return;
        }

        const safeTargetTime = Math.min(Math.max(targetTime, 0), Math.max(duration - 0.01, 0));

        if (Math.abs(video.currentTime - safeTargetTime) > 0.08) {
          video.currentTime = safeTargetTime;
        }
      };

      const scheduleSeek = () => {
        if (requestRef) {
          return;
        }

        requestRef = requestAnimationFrame(applyTargetTime);
      };

      const updateTargetFromScroll = () => {
        targetTime = getScrollTargetTime();
        scheduleSeek();
      };

      const handleMetadata = () => {
        duration = video.duration || 0;
        video.pause();
        targetTime = getScrollTargetTime();

        if (duration && video.currentTime === 0) {
          video.currentTime = 0.01;
        }

        scheduleSeek();
      };

      const handleSeeked = () => {
        if (!seekQueued) {
          return;
        }

        seekQueued = false;
        scheduleSeek();
      };

      video.addEventListener('loadedmetadata', handleMetadata);
      video.addEventListener('loadeddata', updateTargetFromScroll);
      video.addEventListener('seeked', handleSeeked);
      window.addEventListener('scroll', updateTargetFromScroll, { passive: true });
      window.addEventListener('resize', updateTargetFromScroll);
      window.addEventListener('orientationchange', updateTargetFromScroll);
      video.pause();
      handleMetadata();
      updateTargetFromScroll();

      return () => {
        if (requestRef) {
          cancelAnimationFrame(requestRef);
        }

        video.removeEventListener('loadedmetadata', handleMetadata);
        video.removeEventListener('loadeddata', updateTargetFromScroll);
        video.removeEventListener('seeked', handleSeeked);
        window.removeEventListener('scroll', updateTargetFromScroll);
        window.removeEventListener('resize', updateTargetFromScroll);
        window.removeEventListener('orientationchange', updateTargetFromScroll);
      };
    }

    let duration = 0;
    let targetTime = 0;
    let requestRef = 0;

    const handleMetadata = () => {
      duration = video.duration || 0;
      video.pause();
    };

    const handleScroll = () => {
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollRange > 0 ? window.scrollY / scrollRange : 0;
      targetTime = scrollFraction * duration;
    };

    const updateVideo = () => {
      if (video && !video.seeking) {
        if (Math.abs(video.currentTime - targetTime) > 0.05) {
          video.currentTime = targetTime;
        }
      }

      requestRef = requestAnimationFrame(updateVideo);
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    window.addEventListener('scroll', handleScroll, { passive: true });
    video.pause();
    handleMetadata();
    handleScroll();
    requestRef = requestAnimationFrame(updateVideo);

    return () => {
      cancelAnimationFrame(requestRef);
      video.removeEventListener('loadedmetadata', handleMetadata);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black">
      <video
        ref={videoRef}
        className="h-full w-full scale-105 object-cover opacity-80"
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
    </div>
  );
}

function Header() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500, 800], [0, 0, -150]);
  const navItems = [
    { label: 'STUDIO', href: '#studio' },
    { label: 'MONDI', href: '#worlds' },
    { label: 'SERVIZI', href: '#services' },
    { label: 'PROCESSO', href: '#process' },
    { label: 'CONTATTI', href: '#contact' },
  ];

  return (
    <motion.header
      className="fixed left-[5%] right-[5%] top-6 z-30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ y }}
    >
      <div className="flex items-center justify-between gap-6">
        <SpaceLogo />
        <nav className="hidden min-w-0 items-center gap-5 rounded-full bg-[#1A1A1A]/40 px-6 py-4 font-mono text-[11px] tracking-[0.18em] backdrop-blur-[80px] md:flex lg:gap-8 lg:text-xs">
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href}>
              {item.label}
            </NavItem>
          ))}
        </nav>
        <button className="shrink-0 bg-white px-5 py-5 font-mono text-[11px] font-bold tracking-[0.16em] text-black transition-colors hover:bg-gray-200 lg:px-6 lg:text-xs">
          INIZIA IL RACCONTO
        </button>
      </div>
    </motion.header>
  );
}

function SegmentedCta() {
  return (
    <a href="#worlds" className="group inline-flex items-stretch font-mono text-xs font-bold tracking-[0.2em]">
      <span className="flex items-center bg-white/8 px-6 py-5 text-white backdrop-blur-[80px] transition-colors duration-300 group-hover:bg-white group-hover:text-black sm:px-8">
        ESPLORA I MONDI
      </span>
      <span className="flex aspect-square items-center justify-center bg-white/8 px-5 text-white backdrop-blur-[80px] transition-colors duration-300 group-hover:bg-white group-hover:text-black">
        <ArrowRight size={18} strokeWidth={1.8} />
      </span>
    </a>
  );
}

function WordRevealText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split(' ').map((word, index) => (
        <Reveal
          key={`${word}-${index}`}
          delay={index * 0.025}
          className="mr-[0.22em] inline-block blur-0"
        >
          <span>{word}</span>
        </Reveal>
      ))}
    </div>
  );
}

function Spacer() {
  return <div className="h-[200px] w-full" />;
}

function DecorativeOrbit() {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-12 h-auto w-full max-w-[240px] text-white/60"
      aria-hidden="true"
    >
      <path d="M20 80C58 18 178 18 220 80C178 142 58 142 20 80Z" stroke="currentColor" strokeWidth="1" />
      <path d="M120 18V142M42 80H198" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="120" cy="80" r="28" stroke="currentColor" strokeWidth="1" />
      <circle cx="176" cy="52" r="4" fill="currentColor" />
      <path d="M80 42L160 118M160 42L80 118" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
    </svg>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto flex h-screen w-[90%] flex-col pt-32">
      <main className="grid flex-1 grid-cols-1 content-end gap-12 pb-14 md:grid-cols-12 md:grid-rows-[1fr_auto] md:content-normal md:pb-20">
        <Reveal delay={0.2} className="max-w-full self-center justify-self-start md:col-span-12 md:col-start-1 md:row-start-1">
          <h1 className="max-w-full whitespace-nowrap text-[clamp(2.5rem,5.3vw,5rem)] font-medium leading-[1.05] tracking-tight">
            Apriamo
            <br />
            mondi impossibili
          </h1>
        </Reveal>
        <Reveal delay={0.35} className="self-center justify-self-start md:col-span-6 md:col-start-7 md:row-start-1">
          <p className="max-w-[460px] text-base leading-7 text-white/64 md:text-lg">
            Uno studio creativo che costruisce identità cinematografiche, sistemi visivi
            surreali e mondi digitali guidati dal racconto per brand che vogliono restare impressi.
          </p>
        </Reveal>
        <Reveal delay={0.5} className="justify-self-start md:col-span-5 md:col-start-8 md:row-start-2">
          <SegmentedCta />
        </Reveal>
      </main>
    </section>
  );
}

function TurnkeySolutions() {
  return (
    <section id="services" className="mx-auto min-h-screen w-[90%]">
      <WordRevealText
        text="Direzione visiva narrativa per brand con un mondo da svelare."
        className="max-w-[1120px] text-[clamp(2rem,4.5vw,4rem)] font-medium leading-[1.08] tracking-tight text-white"
      />
      <div className="mt-24 grid gap-14 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <DecorativeOrbit />
          <p className="max-w-[260px] font-mono text-xs uppercase tracking-[0.24em] text-white/60">
            Entra nell'impossibile
          </p>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-4">
          <h3 className="text-2xl font-medium tracking-tight text-white">
            Mondi di brand cinematografici
          </h3>
          <p className="mt-6 max-w-[380px] text-base leading-7 text-white/60">
            Costruiamo linguaggi visivi che sembrano luoghi: atmosferici, precisi
            e abbastanza solidi da sostenere campagne, lanci e prodotti digitali.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="md:col-span-4">
          <h3 className="text-2xl font-medium tracking-tight text-white">
            Racconti guidati dal movimento
          </h3>
          <p className="mt-6 max-w-[380px] text-base leading-7 text-white/60">
            Dalle sequenze d'apertura ai film di prodotto, trasformiamo idee astratte
            in momenti di scoperta che si aprono con ritmo, tensione e carattere.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function PrecisionEngineering() {
  const features = [
    {
      number: '01',
      title: 'Architettura del concept',
      body: 'Definiamo la metafora centrale, le regole visive e l’arco emotivo prima di disegnare un fotogramma o mettere in movimento una scena.',
    },
    {
      number: '02',
      title: 'Esplorazione visiva con AI',
      body: 'I flussi generativi ci aiutano a testare scene impossibili in tempi rapidi, poi trasformiamo la direzione più forte in un’identità controllata.',
    },
    {
      number: '03',
      title: 'Sistemi pronti al lancio',
      body: 'Ogni mondo diventa concreto in video hero, landing page, contenuti social, materiali di presentazione e momenti di campagna.',
    },
  ];

  return (
    <section id="worlds" className="mx-auto w-[90%] border-t border-white/10 pt-16">
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <WordRevealText
            text="Uno studio per idee che hanno bisogno di una propria atmosfera."
            className="text-[clamp(2.2rem,5vw,4.8rem)] font-medium leading-[1.06] tracking-tight text-white"
          />
        </div>
        <Reveal delay={0.15} className="flex flex-col justify-end md:col-span-5">
          <p className="max-w-[520px] text-base leading-7 text-white/64 md:text-lg">
            Lavoriamo nel punto in cui brand, movimento, immagine ed esperienza digitale
            si incontrano, dando a ogni progetto un'ossatura narrativa chiara e un segnale visivo memorabile.
          </p>
          <a
            href="#process"
            className="mt-10 inline-flex w-fit bg-white/8 px-7 py-5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-[80px] transition-colors hover:bg-white hover:text-black"
          >
            SCOPRI IL PROCESSO
          </a>
        </Reveal>
      </div>
      <div className="mt-32 grid gap-12 md:grid-cols-3">
        {features.map((feature, index) => (
          <Reveal
            key={feature.number}
            delay={(index + 1) * 0.1}
            className="border-t border-white/20 pt-8"
          >
            <p className="mb-2 text-3xl font-light text-white">{feature.number}</p>
            <h3 className="text-xl font-medium tracking-tight text-white">{feature.title}</h3>
            <p className="mt-5 text-base leading-7 text-white/58">{feature.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CtaFooter() {
  return (
    <section id="studio" className="mx-auto flex w-[90%] flex-col items-center border-t border-white/10 pt-28 text-center">
      <Reveal>
        <h2 className="max-w-[800px] text-[clamp(2.4rem,5.2vw,5rem)] font-medium leading-[1.05] tracking-tight">
          Pronti ad aprire la porta a una storia più inattesa?
        </h2>
      </Reveal>
      <Reveal delay={0.15} className="mt-20 flex flex-col gap-6 sm:flex-row">
        <a
          href="#contact"
          className="bg-white px-8 py-5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-gray-200"
        >
          AVVIA UN PROGETTO
        </a>
        <a
          href="#process"
          className="bg-white/8 px-8 py-5 font-mono text-xs font-bold tracking-[0.2em] text-white backdrop-blur-[80px] transition-colors hover:bg-white hover:text-black"
        >
          Vedi il processo
        </a>
      </Reveal>
      <footer className="mt-40 flex w-full flex-col justify-between gap-6 border-t border-white/10 py-8 font-mono text-[13px] text-white/50 md:flex-row">
        <p>© 2026 Red Door Studio. Tutti i diritti riservati.</p>
        <div className="flex justify-center gap-8 md:justify-end">
          <a href="#privacy" className="transition-colors hover:text-white">
            Informativa privacy
          </a>
          <a href="#terms" className="transition-colors hover:text-white">
            Termini di servizio
          </a>
        </div>
      </footer>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <ScrollScrubVideo />
      <Header />
      <div className="relative z-10">
        <HeroSection />
        <Spacer />
        <TurnkeySolutions />
        <Spacer />
        <PrecisionEngineering />
        <Spacer />
        <CtaFooter />
      </div>
    </div>
  );
}
