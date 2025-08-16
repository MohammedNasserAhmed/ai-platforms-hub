import { z } from 'zod';
import { RequestHandler } from 'express';

export type Schemas = {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
};

export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: 'Invalid body', issues: result.error.issues });
      req.body = result.data;
    }
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) return res.status(400).json({ error: 'Invalid query', issues: result.error.issues });
      req.query = result.data as any;
    }
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) return res.status(400).json({ error: 'Invalid params', issues: result.error.issues });
      req.params = result.data;
    }
    next();
  };
}
