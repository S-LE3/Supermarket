
// Third-party packages (external tools) in Alphabetical order
const jwt = require('jsonwebtoken');

// Local files (personal data blueprints)
const OtpToken = require('../Models/OtpToken.models');
const User = require('../Models/Users.models');
const sendEmail = require('../Utilities/emailSender.utilities');

// Extracted encryption, generation, and validation logic
const { hashPassword, comparePassword } = require('../Utilities/password.utilities');
const { formatCurrencySymbol, normalizeStringInput } = require('../Utilities/formatters.utilities');
const { generateNumericOtp } = require('../Utilities/crypto.utilities');
const { validatePasswordStrength } = require('../Utilities/validators.utilities');

// Create User secure Params
exports.createUser = async (req, res) => {
    try {
        //Request Body
        const { name, email, password, gender, phone, role } = req.body; // include the following if need be: branchLocation: branchLocation || 'Main-Branch', assignedTill: assignedTill || 'Not-Assigned'

        // Check if all required fields are provided
        if (!req.body.name || !req.body.email || !req.body.password || !req.body.phone ) 
        {
            return res.status(400).json({  
                success: false, 
                message: 'Please provide all required fields (name, email, password, phone).' 
            });
        }    

        const normalizedEmail = normalizeStringInput(req.body.email);

        // Email Check
        const existingUser = await User.findOne({ email: normalizedEmail });
        if(existingUser) {
            return res.status(400).json({  
                success: false, 
                message: 'An account with this email address already exists.' 
            });
        }

        // Phone number Check
        const existingPhone = await User.findOne({ phone: req.body.phone });
        if(existingPhone) {
            return res.status(400).json({  
                success: false, 
                message: 'This phone number already exists' 
            });
        }

         //Password Validator
        if (!validatePasswordStrength(password)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must contain at least one capital letter, one special character, and one number.' 
            });
        }

        // // Replaces both individual search blocks with one quick look up:
        // const duplicateCheck = await User.findOne({
        //     $or: [ { email: req.body.email.toLowerCase().trim() ? 'Email' : 'Phone number'; ]
        // });

        // if (duplicateCheck) {
        //    const field = duplicateCheck.email === email: req.body.email.toLowerCase().trim() ? 'Email' : 'Phone number';
        //    return res.status(400).json({  
        //        success: false, 
        //        message: `This ${field} already exists` //or  message: `Registration failed. ${field} is already assigned to an employee.`
        // });
        // }

        // Encrypt Password using utility file
        const hashedPassword = await hashPassword(req.body.password);

// Creating User     

        const user = new User({ 
            name, 
            email: normalizedEmail, 
            password: hashedPassword, // Special assignment (uses custom encrypted variable)
            gender, 
            phone, 
            role: req.body.role || 'salesperson', // Default role is 'salesperson' if not provided
            hasAdminAccess: req.body.hasAdminAccess || false // Default is false if not provided
            // branchLocation: branchLocation || 'Main-Branch',
            // assignedTill: assignedTill || 'Not-Assigned'
        });

        await user.save();

        // Generate a cryptographcally secure 6-digit OTP using utility file
        const generatedOtp = generateNumericOtp();
        
        // Temporarily log it to shared tokens collection
        const tokenLog = new OtpToken({
            email: normalizedEmail,
            otpCode: generatedOtp,
            tokenType: 'USER_VERIFICATION'
        });
        await tokenLog.save();

        // Trigger nodemailer automation to ship to the OTP in the background
        const emailSubject = 'Confirm Your Supermarket Terminal Profile OTP';
        const emailBody = `Hello ${name},\n\n` +
        `Your profile has been opened on the Inventory Engine.\n` +
        `Your verification OTP code is: ${generatedOtp}\n` +
        `This code expires in 5 minutes.`;
        
        sendEmail(normalizedEmail, emailSubject, emailBody); // Fires without await to eliminate response delays
       
       
        const userResponse = user.toObject();  // Removes the password hash from the response data
        delete userResponse.password;

        res.status(201).json({ 
            success: true, 
            message: 'User created successfully. Verification OTP dispatched to email.', //or message: 'Employee record established successfully.',
            user: userResponse 
        });
    } catch (error) {
        res.status(500).json({  
            success: false, 
            message: 'Error creating user', //or message: 'Internal server error processing employee record.',
            error: error.message 
        });
    }
};

// Register a User/Employee
// exports.registerUser = async (req, res) => {
//     try {
//         const { name, email, password, role } = req.body;

//         // Process user saving here
//         const user = new User({ name, email, password, role });
//         await user.save();

//         // Trigger the utility
//         const emailSubject = 'Welcome to the Inventory Management Engine';
//         const emailBody = `Hello ${name},\n\nYour employee account has been successfully created as a ${role}.\n\nPlease contact your system administrator to assign your checkout terminal pin.`;
        
//         // Fires cleanly in the background
//         sendEmail(user.email, emailSubject, emailBody);

//         return res.status(201).json({
//             success: true,
//             message: 'Employee account created successfully. Verification OTP dispatched to email.'
//         });
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// };

// Verify OTP token
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide email and OTP.' });
        }

        const normalizedEmail = normalizeStringInput(req.body.email);

        // Scan the shared token collection specifically for user verification rows
        const validToken = await OtpToken.findOne({ 
            email: normalizedEmail, 
            tokenType: 'USER_VERIFICATION' 
        });

        if (!validToken) {
            return res.status(401).json({ success: false, message: 'OTP has expired or was never requested.' });
        }

         // Assumes OtpToken model saves a "createdAt" timestamp
        const fiveMinutes = 5 * 60 * 1000; 
        const tokenAge = Date.now() - new Date(validToken.createdAt).getTime();

        if (tokenAge > fiveMinutes) {
            // Clean up the expired token immediately after five minutes so it can never be used again
            await OtpToken.deleteOne({ _id: validToken._id });
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        // Check if they already maxed out their tries
        if (validToken.attempts >= 4) {
            await OtpToken.deleteOne({ _id: validToken._id }); // Wipe token for safety
            return res.status(429).json({ 
                success: false, 
                message: 'Too many failed attempts. This OTP is locked. Please request a new one.' 
            });
        }

        // Compare the codes
        if (validToken.otpCode !== otp.trim()) {
            // Wrong code! Atomically increment the failed attempts directly in the database
            const updatedToken = await OtpToken.findOneAndUpdate(
                { _id: validToken._id },
                { $inc: { attempts: 1 } },
                { new: true } // Returns the modified version immediately
            );

            const attemptsLeft = 4 - updatedToken.attempts;

            
            if (attemptsLeft <= 0) {
                await OtpToken.deleteOne({ _id: validToken._id }); // Burn token on final fail
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid OTP. Maximum attempts reached. Token invalid.' });
            }

            return res.status(400).json({ 
                success: false, 
                message: `Invalid confirmation code. You have ${attemptsLeft} attempts remaining.` 
            });
        }

        await OtpToken.deleteOne({ _id: validToken._id });

        // Mark the actual employee as verified in your primary collection
        await User.findOneAndUpdate(
            { email: normalizedEmail },
            { isEmailVerified: true }
        );

        res.status(200).json({ success: true, message: 'Profile verified successfully!' }); // or Employee profile verified successfully!
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Login a User/Employee (Supermarket POS / Admin Terminal Auth)
exports.loginUser = async (req, res) => {
    try{
        const { email, password } = req.body;

        // Fail Fast: Check if the client provided both fields
        if (!email || !password) {
            return res.status(400).json({  
                success: false, 
                message: 'Please provide both email and password' 
            });
        }

        // Find the User by their Email
        const user = await User.findOne({ email: normalizeStringInput(req.body.email) })
        // Security Rule: If the user doesn't exist, stop immediately i.e check if user exists
        if(!user) {
            return res.status(401).json({  
                success: false, 
                message: 'The email address or password you entered is incorrect.' //or message: 'Authentication failed. Invalid credentials or locked terminal account.'
            });
        }

        // Block users whose accounts are unverified
        if (!user.isEmailVerified) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access blocked. Please confirm your email registration account via OTP before signing in.' 
            });
        }

        // Verify Password: Compare plain-text input with the database hash to check if password is correct
        const isPasswordValid = await comparePassword(password, user.password);
        // Security Rule: If the password doesn't match, stop immediately i.e i.e check if password exists
        if (!isPasswordValid) {
            return res.status(401).json({  
                success: false, 
                message: 'The email address or password you entered is incorrect.' //ormessage: 'Authentication failed. Invalid credentials or locked terminal account.'
            });
        }

        // Generate a token (JWT or any other method can be used)
        // const token = generateToken(user); // Implement the generation token here
        
        // Generate a token using JWT
        // Safe payload: No passswords
        const token = jwt.sign({ id: user._id,name: user.name, email: user.email, role: user.role }, //or { id: user._id, name: user.name, role: user.role, branch: user.branchLocation }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' }); // or { expiresIn: '8h' } // for typical retail shift length duration

        // Clean and format the production user template response payload (Clean Approach)
        const userResponse = user.toObject();
        delete userResponse.password;

        // // Clean and format the production user template response payload (Enterprise Whitelist Approach)
        // const userResponse = {
        //     id: user._id,
        //     name: user.name,
        //     email: user.email,
        //     phone: user.phone,
        //     role: user.role,
        //     stationDetails: {
        //         branch: user.branchLocation,
        //         assignedRegister: user.assignedTill
        //     }
        // };

        res.status(200).json({  
            success: true, 
            message: 'Login successful', //or message: 'Employee terminal authentication successful.',
            token, 
            user: userResponse 
        });
    } catch (error) {
        res.status(500).json({  
            success: false, 
            message: 'Error logging in, please try again later', //or message: 'System error handling terminal login process.', 
            error: error.message 
        });
    }
};

// Resend a fresh Verification OTP Token Code
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Ensure an email string was provided
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide an email address.' 
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if the user profile actually exists in your main database collection
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'No account found with this email address.' 
            });
        }

        // If they are already verified, block them from spamming your mail server
        if (user.isEmailVerified) {
            return res.status(400).json({ 
                success: false, 
                message: 'This account profile is already verified. Please go directly to login.' 
            });
        }

        const lastToken = await OtpToken.findOne({ 
            email: normalizedEmail, 
            tokenType: 'USER_VERIFICATION' 
        }).
        sort({ createdAt: -1 });
        
        if (lastToken) {
            const timeSinceLastOtp = Date.now() - new Date(lastToken.createdAt).getTime();
            const cooldown = 60 * 1000; // 1 minute cooldown
        
            if (timeSinceLastOtp < cooldown) {
                const secondsLeft = Math.ceil((cooldown - timeSinceLastOtp) / 1000);
                return res.status(429).json({ 
                    success: false, 
                    message: `Please wait ${secondsLeft} seconds before requesting another code.` 
                });
            }
        }

        // Wipe out any old or expired OTP tokens for this email to keep the database clean
        await OtpToken.deleteMany({ 
            email: normalizedEmail, 
            tokenType: 'USER_VERIFICATION' 
        });

        // Generate a fresh Cryptographically Secure 6-digit number
        const freshOtp = generateNumericOtp();

        // Persist the fresh token to your temporary cache collection
        const tokenLog = new OtpToken({
            email: normalizedEmail,
            otpCode: freshOtp,
            tokenType: 'USER_VERIFICATION'
        });
        await tokenLog.save();

        // Dispatch the fresh numbers via your Nodemailer utility layer
        const emailSubject = 'Fresh Verification OTP Dispatched';
        const emailBody = `Hello ${user.name},\n\n` + 
        `You requested a new verification token.\n` +
        `Your fresh 6-digit OTP code is: ${freshOtp}\n` +
        `This token code expires in 5 minutes.`;
        
        sendEmail(normalizedEmail, emailSubject, emailBody); // Background thread execution

        res.status(200).json({
            success: true,
            message: 'A new verification OTP code has been successfully sent to your email inbox.'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error resending verification code.', 
            error: error.message 
        });
    }
};

