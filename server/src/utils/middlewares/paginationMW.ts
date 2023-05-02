import { Response, NextFunction, RequestHandler} from 'express';
import { RequestWithPagination } from '../../models';

const MAX_SIZE = 10;

export function paginationMW(): RequestHandler {
  return function (
    req: RequestWithPagination, 
    res: Response, 
    next: NextFunction): void {
    req.pagination = settingPageAndSize(req);
    next();
  };
}

function settingPageAndSize(req: RequestWithPagination) {
  return {
    page : settingPage(req),
    size : settingSize(req),
  };
}

function settingPage(req: RequestWithPagination): number {
  return Math.max((Number(req.query.page) || 0), 0);
}

function settingSize(req: RequestWithPagination): number {
  let size = Number(req.query.size) || MAX_SIZE;
  if (size > 10 || size < 1) size = 10;
  return size;
}