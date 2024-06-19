declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GEMINI_API_KEY: string;
      PORT: number;
      /**
       * string saparate by double pipes for a list of allowed origin
       * e.g.:  http://localhost:8000||http://localhost:5000
       */
      CORS_ALLOWED_ORIGIN: string;
    }
  }
}

export {};
