import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { getCategoryById, getCategoryProjects, Category, Project } from '@/data/mockData';
import Link from 'next/link';

interface CategoryPageProps {
  category: Category;
  projects: Project[];
}

export default function CategoryPage({ category, projects }: CategoryPageProps) {
  if (!category) {
    return (
      <Layout>
        <div className="not-found">
          <h1>Category Not Found</h1>
          <p>The category you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="button primary">
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="category-page">
        <div className="category-page__header">
          <div className="category-page__icon" aria-hidden="true">
            {category.icon}
          </div>
          <h1>{category.name}</h1>
          <p className="category-page__description">{category.description}</p>
        </div>

        {projects.length > 0 ? (
          <div className="project-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                logo={project.logo}
                category={project.category}
                tags={project.tags}
                votes={project.votes}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No projects found in this category yet.</p>
            <Link href="/submit" className="button primary">
              Submit the First Project
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const category = getCategoryById(id);
  const projects = getCategoryProjects(id).sort((a, b) => b.votes - a.votes);
  
  return {
    props: {
      category: category || null,
      projects,
    },
  };
}; 