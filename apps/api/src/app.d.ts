declare global {
  namespace NodeJS {
    type ProcessEnv = import("./common/configs/env.config").EnvironmentVariables;
  }

  namespace Express {
    interface Request {
      idk: string;
      // user: import("./user/entities/user.entity").UserEntity;
    }
  }
}

export {};
