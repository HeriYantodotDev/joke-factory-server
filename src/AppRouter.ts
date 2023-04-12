import { Router } from 'express';

export class AppRouter {
  private static __router: Router;

  static get router(): Router {
    if (!AppRouter.__router) {
      AppRouter.__router = Router();
    }

    return AppRouter.__router;
  }
}
