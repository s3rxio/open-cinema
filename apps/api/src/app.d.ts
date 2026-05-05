type EnvironmentVariables =
  import("./common/configs/env.config").EnvironmentVariables;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {
      TZ?: string;
    }
  }

  namespace Express {
    interface Request {
      idk: string;
      user: import("./app/user/entities/user.entity").User;
    }
  }
}

export {};
