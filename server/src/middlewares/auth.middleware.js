const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const supabase = require("../config/supabaseClient");

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // decodes token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { data: user, error } = await supabase
                .from('users')
                .select('id, name, email, pic, is_admin')
                .eq('id', decoded.id)
                .single();

            if (error || !user) throw new Error("User not found");

            // Attach user to req object
            req.user = user;

            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

module.exports = { protect };
