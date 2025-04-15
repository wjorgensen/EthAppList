import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  description: string;
  icon: string;
  projectCount: number;
}

const CategoryCard = ({ name, description, icon, projectCount }: CategoryCardProps) => {
  return (
    <Link href={`/categories/${name.toLowerCase()}`}>
      <div className="card category-card">
        <div className="category-card__header">
          <div className="category-card__icon" aria-hidden="true">
            {icon}
          </div>
          <h3 className="category-card__title">{name}</h3>
        </div>
        <p className="category-card__description">{description}</p>
        <div className="category-card__count">
          {projectCount} {projectCount === 1 ? 'project' : 'projects'}
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard; 