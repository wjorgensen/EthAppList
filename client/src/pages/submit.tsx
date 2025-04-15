import { useState } from 'react';
import Layout from '@/components/Layout';
import { categories } from '@/data/mockData';

export default function SubmitProject() {
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    longDescription: '',
    website: '',
    category: '',
    tags: '',
    logo: null as File | null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormState(prev => ({ ...prev, logo: e.target.files![0] }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // In a real application, you would send this data to your backend
      // For now, we'll just simulate a submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      setFormState({
        name: '',
        description: '',
        longDescription: '',
        website: '',
        category: '',
        tags: '',
        logo: null,
      });
    } catch (err) {
      setError('An error occurred while submitting your project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="submit-page">
        <div className="submit-page__header">
          <h1>Submit a Project</h1>
          <p>
            Share a blockchain project with the community. All submissions are reviewed before being published.
          </p>
        </div>

        {isSuccess ? (
          <div className="card success-message">
            <h2>Thank you for your submission!</h2>
            <p>
              Your project has been submitted successfully and will be reviewed by our team.
              Once approved, it will appear on the EthAppList.
            </p>
            <button 
              className="button primary" 
              onClick={() => setIsSuccess(false)}
            >
              Submit Another Project
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="submit-form card">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="name">Project Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                required
                placeholder="e.g. Aave"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Short Description *</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formState.description}
                onChange={handleChange}
                required
                placeholder="A brief one-line description (max 100 characters)"
                maxLength={100}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="longDescription">Full Description *</label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={formState.longDescription}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Provide a detailed description of the project, its features, and why it's valuable"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="website">Website URL *</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formState.website}
                onChange={handleChange}
                required
                placeholder="https://example.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formState.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formState.tags}
                onChange={handleChange}
                placeholder="Add tags separated by commas (e.g. DeFi, Trading, NFT)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="logo">Logo</label>
              <input
                type="file"
                id="logo"
                name="logo"
                onChange={handleFileChange}
                accept="image/*"
              />
              <p className="form-help">Recommended: Square image, at least 200x200px</p>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="button primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Project'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
} 