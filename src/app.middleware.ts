import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request } from 'express';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // const requestInfo = {
    //   method: req.method,
    //   path: req.baseUrl,
    //   params: req.params,
    //   query: req.query,
    //   body: req.body,
    // };

    // const logger = new Logger('Logger');
    // logger.log(requestInfo);

    next();
  }
}
