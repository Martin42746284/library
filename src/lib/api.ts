import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

//Types pour les données de l'API
export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  created_at: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  stock: number;
  created_at: string;
}

export interface Borrowing {
  id: number;
  user_id: number;
  book_id: number;
  borrowed_at: string;
  returned_at: string | null;
  books?: Book;
}

export interface Stats {
  total_books: number;
  total_users: number;
  borrowed_books: number;
}

//Configuration des URL de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/api`;

const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//Intercepteur pour ajouter le token d'authentification à chaque requête
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Intercepteur de réponse pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Helper function to extract data from response
const getResponseData = (response: any): any => {
  return response.data || response;
};

//Service pour l'authentification
export const authService = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/login', { username, password });
        const data = response.data;
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },
    register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/register', { username, email, password });
        const data = response.data;
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

// Fonction pour obtenir l'ID de l'utilisateur connecté
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Erreur lors du décodage de l\'utilisateur:', error);
    return null;
  }
};

// Fonction pour vérifier si l'utilisateur est admin
export const isUserAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin' || false;
};

//Service User
export const userService = {
    getProfile: async (): Promise<User> => {
        const response = await apiClient.get('/users/me');
        return response.data.data || response.data;
    },
    getUser: async (id: number): Promise<User> => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data.data || response.data;
    },
    getAllUsers: async (): Promise<User[]> => {
        const response = await apiClient.get('/users');
        return response.data.data || response.data || [];
    }
};

//Service Book
export const bookService = {
    getBooks: async (): Promise<Book[]> => {
        const response = await apiClient.get('/books');
        return response.data.data || response.data || [];
    },
    getBook: async (id: number): Promise<Book> => {
        const response = await apiClient.get(`/books/${id}`);
        return response.data.data || response.data;
    },
    createBook: async (bookData: Omit<Book, 'id' | 'created_at'>): Promise<Book> => {
        const response = await apiClient.post('/books', bookData);
        return response.data.data || response.data;
    },
    updateBook: async (id: number, bookData: Partial<Omit<Book, 'id' | 'created_at'>>): Promise<Book> => {
        const response = await apiClient.put(`/books/${id}`, bookData);
        return response.data.data || response.data;
    },
    deleteBook: async (id: number): Promise<void> => {
        await apiClient.delete(`/books/${id}`);
    }
};

//Service Borrowing
export const borrowingService = {
    borrowBook: async (bookId: number): Promise<Borrowing> => {
        const response = await apiClient.post(`/borrowings/${bookId}`);
        return response.data.data || response.data;
    },
    returnBook: async (bookId: number): Promise<Borrowing> => {
        const response = await apiClient.put(`/borrowings/${bookId}/return`);
        return response.data.data || response.data;
    },
    getUserBorrowings: async (): Promise<Borrowing[]> => {
        const response = await apiClient.get('/borrowings/me');
        return response.data.data || response.data || [];
    }
};

//Service Stats
export const statsService = {
    getTopBooks: async (): Promise<any> => {
        const response = await apiClient.get('/stats/books');
        return response.data.data || response.data;
    },
    getTopUsers: async (): Promise<any> => {
        const response = await apiClient.get('/stats/users');
        return response.data.data || response.data;
    }
};

export { apiClient, API_URL, API_BASE_URL };
