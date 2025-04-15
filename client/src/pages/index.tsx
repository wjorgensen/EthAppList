import { useState } from 'react';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import Image from 'next/image';
import { categories, projects, getCategoryProjects } from '@/data/mockData';
import Link from 'next/link';
import { handleImageError } from '@/utils/imageUtils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'trending' | 'latest'>('trending');
  
  // Get top projects across all categories by votes for the "Hot Today" section
  const hotProjects = [...projects]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);
  
  // Sort projects by votes (descending) for trending
  const trendingProjects = [...projects]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 6);
  
  // Sort projects by createdAt (descending) for latest
  const latestProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
  
  const displayedProjects = activeTab === 'trending' ? trendingProjects : latestProjects;

  return (
    <Layout>
      {/* Hot Today Section */}
      <section className="hot-today">
        <div className="section-header">
          <h2>Hot Today 🔥</h2>
        </div>
        
        <div className="hot-projects">
          {hotProjects.map((project, index) => (
            <Link href={`/projects/${project.id}`} key={project.id} className="hot-project-card">
              <div className="hot-project-rank">{index + 1}</div>
              <div className="hot-project-content">
                <div className="hot-project-header">
                  <Image 
                    src={project.logo} 
                    alt={`${project.name} logo`} 
                    width={48} 
                    height={48} 
                    className="hot-project-logo"
                    onError={(e) => handleImageError(e, project.name)}
                    unoptimized
                  />
                  <div>
                    <h3 className="hot-project-title">{project.name}</h3>
                    <Link href={`/categories/${project.category.toLowerCase()}`} className="tag">
                      {project.category}
                    </Link>
                  </div>
                </div>
                <p className="hot-project-description">{project.description}</p>
                <div className="hot-project-stats">
                  <div className="votes">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 4L3 15H21L12 4Z" fill="currentColor" />
                    </svg>
                    {project.votes} votes
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories with Top Projects */}
      <section>
        <div className="section-header">
          <h2>Categories</h2>
          <Link href="/categories" className="section-header__link">
            View all
          </Link>
        </div>
        <div className="categories-with-projects">
          {categories.map((category) => {
            // Get top 3 projects for this category
            const topCategoryProjects = getCategoryProjects(category.id)
              .sort((a, b) => b.votes - a.votes)
              .slice(0, 3);
              
            return (
              <div key={category.id} className="category-with-projects">
                <div className="category-header">
                  <div className="category-icon" aria-hidden="true">
                    {category.icon}
                  </div>
                  <h3 className="category-title">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <Link href={`/categories/${category.id}`} className="view-category">
                    View all {projects.filter(p => p.category.toLowerCase() === category.id.toLowerCase()).length} projects →
                  </Link>
                </div>
                
                <div className="category-top-projects">
                  {topCategoryProjects.length > 0 ? (
                    topCategoryProjects.map((project) => (
                      <Link key={project.id} href={`/projects/${project.id}`} className="top-project">
                        <div className="top-project-header">
                          <Image 
                            src={project.logo} 
                            alt={`${project.name} logo`} 
                            width={32} 
                            height={32} 
                            onError={(e) => handleImageError(e, project.name)}
                            unoptimized
                          />
                          <h4>{project.name}</h4>
                        </div>
                        <div className="top-project-votes">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 4L3 15H21L12 4Z" fill="currentColor" />
                          </svg>
                          {project.votes}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="no-projects">No projects yet</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* All Projects Section */}
      <section>
        <div className="section-header">
          <h2>Explore Projects</h2>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveTab('trending')}
            >
              Trending
            </button>
            <button
              className={`tab ${activeTab === 'latest' ? 'active' : ''}`}
              onClick={() => setActiveTab('latest')}
            >
              Latest
            </button>
          </div>
        </div>
        <div className="project-grid">
          {displayedProjects.map((project) => (
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
        <div className="view-all">
          <Link href="/projects" className="button outline">
            View All Projects
          </Link>
        </div>
      </section>
    </Layout>
  );
}
