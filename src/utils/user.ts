const USER_KEY = '@Students:auth';

export type Auth = {
  token: string;
  student: {
    id: string;
    name: string;
  }
}

export const setCurrentUserData = (auth: Auth) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(auth));
  }
}

export const getCurrentUserData = (): Auth | undefined => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(USER_KEY);

    return item ? JSON.parse(item) as Auth : undefined;
  }
}