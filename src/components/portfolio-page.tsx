import { ProjectShowcase } from "./project-showcase";
import { projects } from "@/data/projects";
import {
  PortfolioMotion,
  HeroStage,
  RevealSection,
} from "./portfolio-motion";
import Image from "next/image";
import { SkillsSection } from "./skills-section";
import {
  ArrowUpRight,
  Code2,
  Search,
  BookOpen,
  Layers3,
  MapPin,
} from "lucide-react";

export function PortfolioPage() {
  return (
    <PortfolioMotion>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <a href="#" className="wordmark" aria-label="Charles home">
            charles<span>.</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href="#about">Profile</a>
            <a href="#experience">Experience</a>
            <a href="#skills">Skills</a>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="shell hero">
          <div className="hero-copy">
            <p className="print-name">Charles Xander I. Panis</p>
            <span className="availability">
              <i /> Open to opportunities
            </span>
            <p className="eyebrow hero-intro">FULL STACK DEVELOPER</p>
            <h1>
              Charles Xander
              <br />
              <span>Panis.</span>
            </h1>
            <p className="hero-description">
              Building reliable web applications, intuitive interfaces, and
              AI-assisted tools. From the first requirement to a working
              product.
            </p>
            <div className="hero-location">
              <MapPin size={14} /> Based in the Philippines <span>·</span>{" "}
              Building for the web
            </div>
          </div>
          <HeroStage>
            <div className="portrait-area">
              <div className="portrait-frame">
                <Image
                  src="/charles.png"
                  alt="Charles Xander I. Panis"
                  fill
                  preload
                  sizes="(max-width: 760px) 75vw, 350px"
                  className="portrait"
                />
                <div className="portrait-bottom">
                  <span>
                    Charles Xander I. Panis<strong>Full Stack Developer</strong>
                  </span>
                  <ArrowUpRight size={24} />
                </div>
              </div>
            </div>
          </HeroStage>
        </section>
        <ProjectShowcase projects={projects} />
        <RevealSection id="about" className="about-section">
          <div className="shell about-grid">
            <div>
              <p className="eyebrow">02 / PROFESSIONAL PROFILE</p>
              <h2>A little about me.</h2>
            </div>
            <div className="about-copy">
              <p className="large-copy">
                BS Information Technology graduate with hands-on experience
                developing full stack applications for academic and
                administrative use.
              </p>
              <p>
                My work spans full stack applications, dashboards, and
                AI-assisted research tools. I care about how a system feels to
                use, how its data fits together, and how it holds up after
                launch.
              </p>
              <div className="capabilities">
                {[
                  {
                    icon: Code2,
                    title: "Build the whole picture",
                    text: "Responsive interfaces, backend logic, and database integration.",
                  },
                  {
                    icon: Layers3,
                    title: "Make complex workflows clearer",
                    text: "Purpose-built tools for the way people actually work.",
                  },
                  {
                    icon: Search,
                    title: "Keep improving",
                    text: "Thoughtful iteration, practical AI integration, and attention to detail.",
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title}>
                    <Icon size={20} />
                    <span>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
        <RevealSection id="experience" className="shell experience-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 / EXPERIENCE & EDUCATION</p>
              <h2>Experience & education.</h2>
            </div>
            <p>
              Hands-on development shaped by real academic and administrative
              needs.
            </p>
          </div>
          <div className="experience-row">
            <div>
              <span className="eyebrow">INTERNSHIP</span>
              <p>Nueva Vizcaya State University</p>
            </div>
            <div>
              <h3>Full Stack Development</h3>
              <p>
                Worked on web applications for academic and administrative
                workflows, translating operational requirements into responsive
                interfaces and practical systems. Developed Tabulora for
                university event tabulation and scheduling.
              </p>
              <div className="tags">
                <span>Web applications</span>
                <span>University systems</span>
                <span>End-to-end development</span>
              </div>
            </div>
            <ArrowUpRight size={25} />
          </div>
          <div className="experience-row education-row">
            <div>
              <span className="eyebrow">EDUCATION</span>
              <p>Nueva Vizcaya State University</p>
            </div>
            <div>
              <h3>Bachelor of Science in Information Technology</h3>
              <p>
                Graduate · Software development, information systems, and
                applied technology.
              </p>
            </div>
            <BookOpen size={25} />
          </div>
        </RevealSection>
        <SkillsSection />
        <RevealSection id="contact" className="shell contact-section">
          <div className="contact-card">
            <p className="eyebrow">05 / LET’S CONNECT</p>
            <h2>
              Let’s work together.
              <br />
              <em>Get in touch.</em>
            </h2>
            <p className="contact-description">
              Open to software engineering, full stack development, and
              AI-focused opportunities.
            </p>
            <a
              className="button contact-button"
              href="https://mail.google.com/mail/?view=cm&fs=1&to=xandercharles08@gmail.com&su=Professional%20inquiry%20for%20Charles%20Xander%20Panis"
              target="_blank"
              rel="noopener noreferrer"
            >
              Email me <ArrowUpRight size={19} />
            </a>
            <a
              className="contact-email"
              href="mailto:xandercharles08@gmail.com"
            >
              xandercharles08@gmail.com
            </a>
            <div className="contact-other">
              <a href="tel:+639391985981">
                0939 198 5981 <ArrowUpRight size={14} />
              </a>
              <a
                href="https://www.facebook.com/CharlesXander.08/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </RevealSection>
      </main>
      <footer className="shell footer">
        <a className="wordmark" href="#">
          charles<span>.</span>
        </a>
        <span>© {new Date().getFullYear()} Charles Xander I. Panis</span>
        <a href="#">
          Back to top <ArrowUpRight size={14} />
        </a>
      </footer>
    </PortfolioMotion>
  );
}
