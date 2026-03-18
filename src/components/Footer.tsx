import type { Dictionary } from '@/lib/i18n'

interface FooterProps {
  lang: string
  dict: Dictionary
}

export default function Footer({ lang: _lang, dict: _dict }: FooterProps) {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-[1400px] mx-auto px-[clamp(20px,4vw,48px)] py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-[12px] text-muted">
          Buenos Aires — Mendoza — Tel Aviv — Berlin
        </p>

        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com/alustein"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-muted hover:text-foreground transition-colors"
          >
            @alustein
          </a>
          <span className="text-[12px] text-muted">
            © {new Date().getFullYear()} Alejandro Stein
          </span>
        </div>
      </div>
    </footer>
  )
}
