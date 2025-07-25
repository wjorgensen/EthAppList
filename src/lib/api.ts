import axios from 'axios';
import { getAuthToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create a configured axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors (401 Unauthorized, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optionally redirect to login or show a message
      console.error('Unauthorized request - token may be expired');
      
      // Could add a callback to logout user here
      // logout();
    }
    return Promise.reject(error);
  }
);

// Types
export interface Product {
  id: string;
  title: string;
  short_desc: string;
  long_desc: string;
  logo_url: string;
  website_url?: string;
  github_url?: string;
  docs_url?: string;
  audit_reports?: string[];
  markdown_content: string;
  submitter_id: string;
  approved: boolean;
  is_verified: boolean;
  analytics_list: string[];
  overall_score: number;
  security_score: number;
  ux_score: number;
  vibes_score: number;
  current_revision_number: number;
  last_editor_id?: string;
  created_at: string;
  updated_at: string;
  categories: Category[];
  chains: Chain[];
  upvote_count: number;
  trending_score?: number;
  submitter?: {
    id: string;
    wallet_address: string;
  };
  last_editor?: {
    id: string;
    wallet_address: string;
  };
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  product_count?: number;
}

export interface Chain {
  id: string;
  name: string;
  icon: string;
}

export interface PendingEdit {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  change_type: string;
  change_data: string;
  status: string;
  created_at: string;
}

// Products API

/**
 * Get a list of products with optional filtering
 */
export const getProducts = async (params?: {
  category?: string;
  chain?: string;
  search?: string;
  sort?: 'new' | 'top_day' | 'top_week' | 'top_month' | 'top_year' | 'top_all';
  page?: number;
  per_page?: number;
}) => {
  const response = await api.get<ProductsResponse>('/products', { params });
  return response.data;
};

/**
 * Get a specific product by ID
 */
export const getProductById = async (id: string) => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

/**
 * Submit a new product
 */
export const submitProduct = async (productData: {
  title: string;
  short_desc: string;
  long_desc: string;
  logo_url: string;
  markdown_content: string;
  is_verified?: boolean;
  analytics_list?: string[];
  overall_score?: number;
  security_score?: number;
  ux_score?: number;
  vibes_score?: number;
  categories: { id: string }[];
  chains: { id: string }[];
}) => {
  const response = await api.post<Product>('/products', productData);
  return response.data;
};

/**
 * Upvote a product
 */
export const upvoteProduct = async (id: string) => {
  await api.post(`/products/${id}/upvote`);
};

/**
 * Get trending products
 */
export const getTrendingProducts = async (limit: number = 20) => {
  const response = await api.get<Product[]>(`/products/trending?limit=${limit}`);
  return response.data;
};

/**
 * Get random products
 */
export const getRandomProducts = async (limit: number = 5) => {
  const response = await api.get<ProductsResponse>(`/products/random?per_page=${limit}`);
  return response.data;
};

/**
 * Get user vote states for multiple products
 */
export const getUserVoteStates = async (productIds: string[]) => {
  const ids = productIds.join(',');
  const response = await api.get<Record<string, boolean>>(`/user/vote-states?ids=${ids}`);
  return response.data;
};

/**
 * Update an existing product (direct update - for admin use)
 */
export const updateProduct = async (id: string, productData: {
  product: {
    title: string;
    short_desc: string;
    long_desc: string;
    logo_url: string;
    markdown_content: string;
    is_verified?: boolean;
    analytics_list?: string[];
    overall_score?: number;
    security_score?: number;
    ux_score?: number;
    vibes_score?: number;
    categories: { id: string }[];
    chains: { id: string }[];
  };
  edit_summary: string;
  minor_edit?: boolean;
}) => {
  await api.put(`/products/${id}`, productData);
};

/**
 * Submit a product edit revision (goes to approval queue)
 */
export const submitProductEdit = async (id: string, productData: {
  product: {
    title: string;
    short_desc: string;
    long_desc: string;
    logo_url: string;
    markdown_content: string;
    is_verified?: boolean;
    analytics_list?: string[];
    overall_score?: number;
    security_score?: number;
    ux_score?: number;
    vibes_score?: number;
    categories: { id: string }[];
    chains: { id: string }[];
  };
  edit_summary: string;
  minor_edit?: boolean;
}) => {
  const response = await api.post(`/products/${id}/edit`, productData);
  return response.data;
};

/**
 * Get edit history for a product
 */
export const getProductHistory = async (id: string, params?: {
  page?: number;
  per_page?: number;
}) => {
  const response = await api.get(`/products/${id}/history`, { params });
  return response.data;
};

// Categories API

/**
 * Get a list of all categories
 */
export const getCategories = async () => {
  const response = await api.get<Category[]>('/categories');
  return response.data;
};

/**
 * Submit a new category
 */
export const submitCategory = async (categoryData: {
  name: string;
  description: string;
}) => {
  const response = await api.post<Category>('/categories', categoryData);
  return response.data;
};

// Admin API

/**
 * Get all pending changes from Redis
 */
export const getPendingChanges = async () => {
  const response = await api.get('/admin/pending-changes');
  return response.data;
};

/**
 * Get specific pending product by ID
 */
export const getPendingProduct = async (id: string) => {
  const response = await api.get(`/admin/pending-products/${id}`);
  return response.data;
};

/**
 * Get specific pending edit by ID
 */
export const getPendingEdit = async (id: string) => {
  const response = await api.get(`/admin/pending-edits/${id}`);
  return response.data;
};

/**
 * Approve pending change and merge to main database
 */
export const approvePendingChange = async (id: string) => {
  await api.post(`/admin/approve/${id}`);
};

/**
 * Reject pending change and remove from Redis
 */
export const rejectPendingChange = async (id: string) => {
  await api.post(`/admin/reject/${id}`);
};

/**
 * Get a list of pending edits
 */
export const getPendingEdits = async () => {
  const response = await api.get<PendingEdit[]>('/admin/pending');
  return response.data;
};

/**
 * Approve a pending edit
 */
export const approveEdit = async (id: string) => {
  await api.post(`/admin/approve/${id}`);
};

/**
 * Reject a pending edit
 */
export const rejectEdit = async (id: string) => {
  await api.post(`/admin/reject/${id}`);
};

/**
 * Get recent edits across all products
 */
export const getRecentEdits = async (params?: {
  limit?: number;
}) => {
  const response = await api.get('/admin/recent-edits', { params });
  return response.data;
};

/**
 * Get pending edits and creations for a specific product
 */
export const getProductPendingEdits = async (productId: string) => {
  const response = await api.get(`/admin/products/${productId}`);
  return response.data;
};

/**
 * Get user profile and permissions
 */
export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

/**
 * Check if user has admin permissions
 * For now, any authenticated user can edit (subject to approval queue)
 * Only admin status needs to be checked via API
 */
export const getUserPermissions = async () => {
  try {
    // Try to get admin status from API - you can implement this endpoint later
    const response = await api.get('/user/profile');
    return {
      canAdd: true,     // Anyone authenticated can submit projects (pending approval)
      canEdit: true,    // Anyone authenticated can submit edits (pending approval)
      isAdmin: response.data?.is_admin || false,   // Check admin status if available
      isCurator: false  // Not used in your system
    };
  } catch (error) {
    // If no profile endpoint, assume authenticated user can edit but isn't admin
    console.warn('User profile endpoint not available, using authenticated user permissions');
    
    return {
      canAdd: true,     // Anyone authenticated can submit projects (pending approval)
      canEdit: true,    // Anyone authenticated can submit edits (pending approval)
      isAdmin: false,   // Can't determine admin status without API
      isCurator: false  // Not used in your system
    };
  }
};

// Score submission helper
export async function postScores(productId: string, scores: {
  overall: number;
  security: number;
  ux: number;
  vibes: number;
}) {
  const response = await api.post(`/products/${productId}/scores`, scores);
  return response.data;
}

/**
 * Check if the current user has submitted a score for a specific product
 */
export async function getUserScore(productId: string) {
  const response = await api.get(`/products/${productId}/my-score`);
  return response.data;
}

export default api;

// Example of how to use the API client:
// 
// // GET request
// export const fetchProjects = async () => {
//   const response = await api.get('/projects');
//   return response.data;
// };
// 
// // POST request with data
// export const createProject = async (projectData) => {
//   const response = await api.post('/projects', projectData);
//   return response.data;
// }; 