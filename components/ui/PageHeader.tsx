interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export default function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-8 py-5">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {badge && (
            <span className="inline-block mb-2 text-xs font-semibold uppercase tracking-wider text-[#003189] bg-blue-50 px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );
}
