import { BookOpen } from "lucide-react";

/** Original vector marks for the portfolio, rather than official product logos. */
export function ProjectMark({ id }: { id: string }) {
  if (!["rrl", "tabulora", "ojt", "iguide"].includes(id)) {
    return <BookOpen strokeWidth={1} size={78} />;
  }
  return (
    <svg className={`project-mark mark-${id}`} width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="55" fill="currentColor" opacity=".06" />
      {id === "rrl" && <>
        <path d="M25 31h35l15 15v46H25z" fill="currentColor" opacity=".14" />
        <path d="M60 31v16h15M34 46h15M34 57h18M34 68h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="70" cy="66" r="22" fill="var(--mark-paper, #f9fcfd)" stroke="currentColor" strokeWidth="5" />
        <path d="m86 83 15 16" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M59 62h6v6h-6zm12 0h6v6h-6z" fill="currentColor" />
        <path d="m64 67-4 7m16-7-4 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </>}
      {id === "tabulora" && <>
        <path d="M23 67h22v29H23zM49 49h22v47H49zM75 75h22v21H75z" fill="currentColor" opacity=".18" />
        <path d="M49 49h22v47H49z" fill="currentColor" opacity=".8" />
        <path d="M21 96h78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="m60 20 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="currentColor" />
        <path d="m27 53 7 5 8-13m37 14 7 5 8-13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M57 65h4v16" stroke="var(--mark-paper, #fcfafe)" strokeWidth="3" strokeLinecap="round" />
      </>}
      {id === "ojt" && <>
        <circle cx="58" cy="57" r="31" stroke="currentColor" strokeWidth="9" opacity=".15" />
        <path d="M58 26a31 31 0 0 1 31 31" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
        <path d="M58 39v20l-12 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 97h48l18-18" stroke="currentColor" strokeWidth="3" strokeDasharray="3 6" strokeLinecap="round" />
        <circle cx="29" cy="97" r="5" fill="currentColor" />
        <circle cx="84" cy="81" r="19" fill="currentColor" />
        <path d="m75 81 6 6 12-13" stroke="var(--mark-paper, #f9fcf8)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </>}
      {id === "iguide" && <>
        <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="2" opacity=".4" />
        <path d="M60 17v9m0 68v9M17 60h9m68 0h9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="m78 32-9 37-37 19 19-37z" fill="currentColor" opacity=".18" />
        <path d="m78 32-9 37-18-18z" fill="currentColor" />
        <path d="m32 88 19-37 18 18z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="60" cy="60" r="6" fill="var(--mark-paper, #fffcf7)" />
      </>}
    </svg>
  );
}
