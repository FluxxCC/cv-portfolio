export type Project = {
  id: string;
  name: string;
  /** Short product type, e.g. "Laundry Management System". */
  subtitle: string;
  category: string;
  summary: string;
  description: string;
  tags: string[];
  features: string[];
  url?: string;
  linkLabel?: string;
  status?: string;
  /** Colour family used by the classic page's styles. */
  tone: string;
  /** Accent colour used in the 3D views. */
  color: string;
  /** Screenshot of the live site, if there is one. */
  image?: string;
  /** False when the site refuses to be shown inside another page. */
  embed?: boolean;
};

export const projects: Project[] = [
  {
    id: "rrl",
    name: "RRL Finder",
    subtitle: "AI-Powered Academic Research Tool",
    category: "AI-POWERED ACADEMIC RESEARCH TOOL",
    summary: "Less searching. More discovering.",
    description:
      "A research platform that helps students and researchers discover relevant scholarly articles, find related literature, and streamline the research process through centralized academic search.",
    tags: ["Next.js", "API integration", "AI-assisted research"],
    features: [
      "Centralized academic search",
      "Related literature discovery",
      "A streamlined research process",
    ],
    url: "https://rrlfinder.zentra.surf",
    tone: "blue",
    color: "#3b6cf0",
    image: "/projects/rrl.png",
    embed: false,
  },
  {
    id: "washfold",
    name: "Wash & Fold",
    subtitle: "Laundry Management System",
    category: "LAUNDRY MANAGEMENT SYSTEM",
    summary: "Orders, payments, and branches in one place.",
    description:
      "A laundry management system designed to simplify order processing, monitor laundry workflows, manage payments, and track business performance across multiple branches.",
    tags: ["Order processing", "Payments", "Multi-branch"],
    features: [
      "Simplified order processing",
      "Laundry workflow monitoring",
      "Payments and branch performance tracking",
    ],
    url: "https://washandfold.zentra.surf",
    tone: "navy",
    color: "#0e86b8",
    image: "/projects/washfold.png",
  },
  {
    id: "tabulora",
    name: "Tabulora",
    subtitle: "Real-Time Event Tabulation System",
    category: "REAL-TIME EVENT TABULATION SYSTEM",
    summary: "Every score. One clear result.",
    description:
      "A digital tabulation platform for competitions and events that automates scoring, consolidates judges' results, and provides real-time monitoring of rankings and final scores.",
    tags: ["Live tabulation", "Event management", "Dashboards"],
    features: [
      "Automated scoring",
      "Consolidated judges' results",
      "Real-time rankings and final scores",
    ],
    url: "https://tabulora.vercel.app",
    tone: "violet",
    color: "#8b5cf6",
    image: "/projects/tabulora.png",
    embed: false,
  },
  {
    id: "zentra",
    name: "Zentra",
    subtitle: "Software Development & Digital Solutions",
    category: "SOFTWARE DEVELOPMENT & DIGITAL SOLUTIONS",
    summary: "Modern software for real-world business problems.",
    description:
      "A software development brand focused on building modern web applications, business management systems, and digital solutions that help businesses streamline operations and solve real-world problems.",
    tags: ["Web applications", "Business systems", "Digital solutions"],
    features: [
      "Modern web applications",
      "Business management systems",
      "Digital solutions that streamline operations",
    ],
    url: "https://zentra.surf",
    tone: "blue",
    color: "#12b5d6",
    image: "/projects/zentra.png",
  },
  {
    id: "arms",
    name: "ARMS",
    subtitle: "Automated Records Management System",
    category: "AUTOMATED RECORDS MANAGEMENT SYSTEM",
    summary: "Grades, attendance, and DepEd forms, automated.",
    status: "In development",
    description:
      "A school records management system designed for teachers to manage grades, attendance, and student records while automating the generation of DepEd forms and report cards.",
    tags: ["School records", "DepEd forms", "Report cards"],
    features: [
      "Grades and attendance management",
      "Student records",
      "Automated DepEd forms and report cards",
    ],
    url: "https://arms.zentra.surf",
    tone: "green",
    color: "#3fae8c",
    image: "/projects/arms.png",
  },
  {
    id: "ojt",
    name: "OJTonTrack",
    subtitle: "OJT Monitoring & Performance Management System",
    category: "OJT MONITORING & PERFORMANCE MANAGEMENT",
    summary: "A clearer picture of every internship.",
    description:
      "A web-based platform for monitoring student internship attendance, tracking OJT progress, managing reports, and evaluating student performance through a centralized system for students, instructors, coordinators, and supervisors.",
    tags: ["Role-based access", "Attendance", "Reporting"],
    features: [
      "Internship attendance monitoring",
      "OJT progress and report tracking",
      "Student performance evaluation",
    ],
    url: "https://ojtontrack.vercel.app",
    linkLabel: "Live demo",
    tone: "peach",
    color: "#f97316",
    image: "/projects/ojt.png",
  },
];
