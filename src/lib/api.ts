import axios from 'axios';
import { getAuthToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-29b8.up.railway.app/api';

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
  markdown_content: string;
  submitter_id: string;
  approved: boolean;
  is_verified: boolean;
  analytics_list: string[];
  security_score: number;
  ux_score: number;
  decent_score: number;
  vibes_score: number;
  created_at: string;
  updated_at: string;
  categories: Category[];
  chains: Chain[];
  upvote_count: number;
  submitter: {
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
  security_score?: number;
  ux_score?: number;
  decent_score?: number;
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
 * Update an existing product
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
    security_score?: number;
    ux_score?: number;
    decent_score?: number;
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
 * Get user profile and permissions
 */
export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

/**
 * Check if user has curator/admin permissions
 */
export const getUserPermissions = async () => {
  const response = await api.get('/user/permissions');
  return response.data;
};

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