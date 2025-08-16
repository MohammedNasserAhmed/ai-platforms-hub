export function validate(schemas) {
    return (req, res, next) => {
        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);
            if (!result.success)
                return res.status(400).json({ error: 'Invalid body', issues: result.error.issues });
            req.body = result.data;
        }
        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);
            if (!result.success)
                return res.status(400).json({ error: 'Invalid query', issues: result.error.issues });
            req.query = result.data;
        }
        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);
            if (!result.success)
                return res.status(400).json({ error: 'Invalid params', issues: result.error.issues });
            req.params = result.data;
        }
        next();
    };
}
