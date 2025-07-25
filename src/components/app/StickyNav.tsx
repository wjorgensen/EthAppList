interface StickyNavProps {
  sections: Array<{
    id: string;
    label: string;
  }>;
}

export default function StickyNav({ sections }: StickyNavProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav className="sticky top-16 z-30 bg-background/80 backdrop-blur-sm border-b border-border/40">
      <div className="container max-w-7xl mx-auto px-4">
        <ul className="flex gap-6 py-3 text-sm">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
} 