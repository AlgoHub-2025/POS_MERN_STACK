declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        id: string;
        email: string;
        role: string;
        tenantId: string;
      };
    }
  }
}

export {};
