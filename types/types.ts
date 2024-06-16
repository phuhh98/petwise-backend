declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
      GEMINI_API_KEY: string;
    }
  }
}

export {};
