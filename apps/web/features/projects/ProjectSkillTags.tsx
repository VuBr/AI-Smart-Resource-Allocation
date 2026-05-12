interface ProjectSkillTagsProps {
  skills: string | null;
}

export function ProjectSkillTags({ skills }: ProjectSkillTagsProps) {
  if (!skills) return <span className="text-xs text-slate-400">—</span>;

  const tags = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
