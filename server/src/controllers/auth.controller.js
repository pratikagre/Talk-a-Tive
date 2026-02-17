const asyncHandler = require("express-async-handler");
const supabase = require("../config/supabaseClient");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");

//@description     Register new user
//@route           POST /api/user
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    // Check if user exists
    const { data: userExists } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error } = await supabase
        .from('users')
        .insert([{
            name,
            email,
            password: hashedPassword,
            pic
        }])
        .select()
        .single();

    if (error) {
        console.error(error);
        res.status(400);
        throw new Error("Failed to create user");
    }

    if (user) {
        res.status(201).json({
            _id: user.id, // Frontend expects _id
            name: user.name,
            email: user.email,
            isAdmin: user.is_admin,
            pic: user.pic,
            token: generateToken(user.id),
        });
    } else {
        res.status(400);
        throw new Error("User not found");
    }
});

//@description     Auth the user
//@route           POST /api/user/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.is_admin,
            pic: user.pic,
            token: generateToken(user.id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
    let query = supabase.from('users').select('id, name, email, pic').neq('id', req.user.id);

    if (req.query.search) {
        query = query.or(`name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%`);
    }

    const { data: users, error } = await query;

    if (error) throw new Error(error.message);

    // Transform _id for frontend
    const formattedUsers = users.map(u => ({
        ...u,
        _id: u.id
    }));

    res.send(formattedUsers);
});

module.exports = { registerUser, authUser, allUsers };
