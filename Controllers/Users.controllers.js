
// Third-party packages (external tools) in Alphabetical order
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Local files (personal data blueprints)
const User = require('../Models/Users.models');

// Create User secure Params
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, gender, phone, role } = req.body;

        // Check if all required fields are provided
        if (!req.body.name || !req.body.email || !req.body.password || !req.body.phone )
        {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }    

        // Email Check
        const existingUser = await User.findOne({ email: req.body.email });
        if(existingUser) {
            return res.status(400).json({ message: 'Email already exists' })
        }

        // Phone number Check
        const existingPhone = await User.findOne({ phone: req.body.phone });
        if(existingPhone) {
            return res.status(400).json({ message: 'Phone number already exists' })
        }

        // // Replaces both of your individual search blocks with one quick look up:
        // const duplicateCheck = await User.findOne({
        //     $or: [ { email: req.body.email }, { phone: req.body.phone } ]
        // });

        // if (duplicateCheck) {
        //    const field = duplicateCheck.email === req.body.email ? 'Email' : 'Phone number';
        //    return res.status(400).json({ message: `${field} already exists` });
        // }

        // Encrypt Password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

// Creating User     

        const user = new User({ 
            name, 
            email, 
            password: hashedPassword, // Special assignment (uses custom encrypted variable)
            gender, 
            phone, 
            role: req.body.role || 'salesperson', // Default role is 'salesperson' if not provided
            hasAdminAccess: req.body.hasAdminAccess || false // Default is false if not provided
        });

        await user.save();
       
        const userResponse = user.toObject();  // Removes the password hash from the response data
        delete userResponse.password;

        res.status(201).json({ message: 'User created successfully', user: userResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message })
    }
};

// Login a User
exports.loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;

        // Fail Fast: Check if the client provided both fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Find the User by their Email
        const user = await User.findOne({ email: email.toLowerCase().trim() })
        // Security Rule: If the user doesn't exist, stop immediately i.e check if user exists
        if(!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify Password: Compare plain-text input with the database hash to check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        // Security Rule: If the password doesn't match, stop immediately i.e i.e check if password exists
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a token 
        // const token = generateToken(user); // Implement the generation token here

        const token = jwt.sign({ id: user._id, role: user.role }, // Safe payload: No passswords
        process.env.JWT_SECRET,
        { expiresIn: '1h' });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({ message: 'Login successful', token, user: userResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};


