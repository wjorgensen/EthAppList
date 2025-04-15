import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getProjectById, getCategoryProjects, Project } from '@/data/mockData';
import { handleImageError } from '@/utils/imageUtils';

interface ProjectDetailProps {
  project: Project;
  relatedProjects: Project[];
}

export default function ProjectDetail({ project, relatedProjects }: ProjectDetailProps) {
  if (!project) {
    return (
      <Layout>
        <div className="not-found">
          <h1>Project Not Found</h1>
          <p>The project you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="button primary">
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="project-detail">
        <div className="project-detail__header">
          <Image 
            src={project.logo} 
            alt={`${project.name} logo`} 
            width={80} 
            height={80} 
            className="project-detail__logo"
            onError={(e) => handleImageError(e, project.name)}
            unoptimized
          />
          <div>
            <h1 className="project-detail__title">{project.name}</h1>
            <div className="project-detail__tags">
              <Link href={`/categories/${project.category.toLowerCase()}`} className="tag category-tag">
                {project.category}
              </Link>
              {project.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="project-detail__actions">
            <a 
              href={project.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="button primary"
            >
              Visit Website
            </a>
            <button className="button outline vote-button">
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
              Upvote ({project.votes})
            </button>
          </div>
        </div>

        <div className="project-detail__content">
          <div className="card">
            <h2>About {project.name}</h2>
            <div className="project-detail__description">
              {project.longDescription.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {relatedProjects.length > 0 && (
            <div className="related-projects">
              <h2>More {project.category} Projects</h2>
              <div className="related-projects__grid">
                {relatedProjects.map((relatedProject) => (
                  <Link 
                    href={`/projects/${relatedProject.id}`}
                    key={relatedProject.id}
                    className="related-project"
                  >
                    <Image 
                      src={relatedProject.logo} 
                      alt={`${relatedProject.name} logo`} 
                      width={36} 
                      height={36} 
                      onError={(e) => handleImageError(e, relatedProject.name)}
                      unoptimized
                    />
                    <div>
                      <h3>{relatedProject.name}</h3>
                      <span className="votes">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 4L3 15H21L12 4Z"
                            fill="currentColor"
                          />
                        </svg>
                        {relatedProject.votes}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const project = getProjectById(id);
  
  let relatedProjects: Project[] = [];
  
  if (project) {
    relatedProjects = getCategoryProjects(project.category.toLowerCase())
      .filter(p => p.id !== project.id)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3);
  }
  
  return {
    props: {
      project: project || null,
      relatedProjects,
    },
  };
}; 