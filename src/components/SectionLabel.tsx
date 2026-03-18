interface SectionLabelProps {
  text: string
}

export default function SectionLabel({ text }: SectionLabelProps) {
  return (
    <p className="text-[16px] font-medium italic uppercase tracking-[0.05em] text-muted mb-6">
      {text}
    </p>
  )
}
