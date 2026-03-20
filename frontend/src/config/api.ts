// export const API_BASE_URL = 'http://192.168.0.101:3000'
export const API_BASE_URL = 'http://localhost:3000'

export const ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  users: {
    profile: '/users/profile',
    all: '/user/all',           
    update: (id: string | number) => `/user/update/${id}`,
    logout: '/user/logout',
  },
  girls: {
    all: '/girls/all',
    unliked: '/girls/unliked',
    create: '/girls/create',
    like: (id: number | string) => `/girls/${id}/like`,
    unlike: (id: number | string) => `/girls/${id}/unlike`,
    dislike: (id: number | string) => `/girls/${id}/dislike`,
    liked: '/girls/liked',
  }
}
