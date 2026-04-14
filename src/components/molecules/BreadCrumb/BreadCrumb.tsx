import { Link } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';

interface BreadCrumbItem {
  label: string;
  path: string;
}

interface BreadCrumbProps {
  items: BreadCrumbItem[];
}

export function BreadCrumb({ items }: BreadCrumbProps) {
  const { mode } = useTheme();

  return (
    <nav className="mb-8">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span 
                style={{ color: mode === 'light' ? '#cbd5e1' : '#475569' }}
              >
                /
              </span>
            )}
            {index === items.length - 1 ? (
              <span 
                className="text-sm font-bold"
                style={{ color: mode === 'light' ? '#0f172a' : '#ffffff' }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: mode === 'light' ? '#64748b' : '#94a3b8' }}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
