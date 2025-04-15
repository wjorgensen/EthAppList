import Image from 'next/image';
import Link from 'next/link';
import { handleImageError } from '@/utils/imageUtils';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  tags: string[];
  votes: number;
}

const ProjectCard = ({ id, name, description, logo, category, tags, votes }: ProjectCardProps) => {
  return (
    <div className="card project-card">
      <div className="project-card__header">
        <Image 
          src={logo} 
          alt={`${name} logo`} 
          width={48} 
          height={48} 
          onError={(e) => handleImageError(e, name)}
          unoptimized // Allow SVG fallbacks to work
        />
        <div>
          <h3 className="project-card__title">{name}</h3>
          <Link href={`/categories/${category.toLowerCase()}`} className="tag">
            {category}
          </Link>
        </div>
      </div>
      
      <p className="project-card__description">{description}</p>
      
      <div className="project-card__tags">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="project-card__meta">
        <Link href={`/projects/${id}`} className="button outline">
          Learn More
        </Link>
        <div className="votes">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L3 15H21L12 4Z"
              fill="currentColor"
            />
          </svg>
          {votes}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 