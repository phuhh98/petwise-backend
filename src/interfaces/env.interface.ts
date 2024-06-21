declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * string saparate by double pipes for a list of allowed origin
       * e.g.:  http://localhost:8000||http://localhost:5000
       */
      CORS_ALLOWED_ORIGIN: string;
      /**
       * Firebase storage bucket name
       * It start with gs://<whatever>
       */
      FIREBASE_STORAGE_BUCKET: string;
      GEMINI_API_KEY: string;

      PORT: number;
    }
  }
}

export {};
