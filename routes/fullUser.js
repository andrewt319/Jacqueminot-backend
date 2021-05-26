const router = require('express').Router();
let FullUser = require('../models/fullUser.model');
let PhotoFiles = require('../models/img.model');
let Chunks = require('../models/chunk.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const JWT_SECRET = process.env.JWT_SECRET
const nodemailer = require('nodemailer');
const uploads = require("../middleware/upload");


const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
let connection = mongoose.connection;
let gfs; 

connection.once('open', () => {
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection('photos');
});


    router.route('/newUpload').post(async (req, res) => {
        try {
            await uploads(req, res);
        
            console.log(req.file);
            if (req.file == undefined) {
                return res.send(`You must select a file.`);
            }
    
            return res.send(`File has been uploaded.`);
        } catch (error) {
            console.log(error);
            return res.send(`Error when trying upload image: ${error}`);
        }
    });

    //get image from database
    router.route('/getUpload/:filename').get(async (req, res) => {
        gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
            // Check if file
            if (!file || file.length === 0) {
              return res.status(404).json({
                fail: true,
                err: 'No file exists'
              });
            }
        
            // Check if image
            if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            } else {
              res.status(404).json({
                fail: true,
                err: 'Not an image'
              });
            }
          });
    });

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

//get all users
router.route('/').get((req, res) => {
    FullUser.find()
        .then(fullUsers => res.json(fullUsers))
        .catch(err => res.status(400).json('Error: ' + err));
});

//get curr users using post... bad??
router.route('/curr').post((req, res) => {
    FullUser.find()
        .then(fullUsers => res.json(fullUsers))
        .catch(err => res.status(400).json('Error: ' + err));
});



// add/register a user
router.route('/add').post(async(req, res) => {
    const username = req.body.username;
    const password = await bcrypt.hash(req.body.password, 10);
    const {
        first,
        last,
        clss,
        fam,
        year,
        major,
        occupation,
        organization,
        additional,
        fb,
        linkedin
    } = req.body;

    const newFullUser = new FullUser({
        username: username,
        password: password,
        org: organization,
        first: first,
        last: last,
        major: major,
        year: year,
        occupation: occupation,
        clss: clss,
        fam: fam,
        additional: additional,
        fb: fb,
        linkedin: linkedin
    });

    const token = jwt.sign({ id: newFullUser._id, username: newFullUser.username },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    newFullUser.save()
        .then(() => res.json({ success: true, data: token }))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/login').post(async(req, res) => {
    const { username, password } = req.body;

    const user = await FullUser.findOne({ username }).lean();

    if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({ success: true, data: token });
    }else{
        return res.status(400).json({ sucess: false, message: 'Incorrect Password', user });
    }
})

//find mentors
router.route('/findMentors/:id').get(async(req, res) => {

    const user = await FullUser.findById(req.params.id).lean();

    FullUser.find({ major: user.major, beMentor: true })
        .then(matches => res.json(matches))
        .catch(err => res.status(400).json('Error: ' + err));
});

//find mentors
router.route('/findMentees/:id').get(async(req, res) => {

    const user = await FullUser.findById(req.params.id).lean();

    FullUser.find({ major: user.major, beMentee: true })
        .then(matches => res.json(matches))
        .catch(err => res.status(400).json('Error: ' + err));
});

//get specific user
router.route('/:id').get((req, res) => {
    FullUser.findById(req.params.id)
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

//get specific user by username
router.route('/email/:username').get((req, res) => {
    FullUser.findOne({username : req.params.username})
        .then(user => res.json({user: user}))
        .catch(err =>{ res.status(400).json('Error: ' + err); });
});


//delete current user
router.route('/').delete((req, res) => {
    const token = req.body.token;
    const tempUser = jwt.verify(token, JWT_SECRET);

    FullUser.findByIdAndDelete(tempUser.id)
        .then(() => res.json('User deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

//delete all must be before 'id' param
router.route('/deleteAll').delete((req, res) => {

    FullUser.deleteMany({})
        .then(() => res.json('All Deleted'))
        .catch(err => res.status(400).json('Error: ' + err));
});

//delete user by ID
router.route('/:id').delete((req, res) => {

    FullUser.findByIdAndDelete(req.params.id)
        .then(() => res.json('User deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});


//update current user
router.route('/update').post(async(req, res) => {

    try {
        await uploads(req, res);
    } catch (error) {
        return res.status(400).json({success: false, error: `Error when trying upload image: ${error}`});
    } 
    
    if(req.body.password) {temp = await bcrypt.hash(req.body.password, 10) };
    let token = req.body.token;
    const tempUser = jwt.verify(token, JWT_SECRET);
  
    FullUser.findById(tempUser.id)
        .then(user => {
            user.username = req.body.username ? req.body.username : user.username;
            user.first = req.body.first ? req.body.first : user.first;
            user.last = req.body.last ? req.body.last : user.last;
            user.org = req.body.org ? req.body.org : user.org;
            user.major = req.body.major ? req.body.major : user.major;
            user.other = req.body.other ? req.body.other : user.other;
            user.year = req.body.year ? req.body.year : user.year;
            user.occupation = req.body.occupation ? req.body.occupation : user.occupation;
            user.clss = req.body.clss ? req.body.clss : user.clss;
            user.fam = req.body.fam ? req.body.fam : user.fam
            user.additional = req.body.additional ? req.body.additional : user.additional;
            user.fb = req.body.fb ? req.body.fb : user.fb;
            user.linkedin = req.body.linkedin ? req.body.linkedin : user.linkedin;
            user.beMentor = req.body.beMentor != null ? req.body.beMentor : user.beMentor;
            user.beMentee = req.body.beMentee != null ? req.body.beMentee : user.beMentee;
            user.pfp = req.file ? req.file.filename : user.pfp;
            user.pfpName = req.file ? req.file.originalname : user.pfpName;  
            user.password = req.body.password ? temp : user.password;

            user.save()
                .then(() => res.status(200).json({message: 'User updated!', success: true}))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

//update by id, just for testing
router.route('/update/:id').post(async(req, res) => {

    try {
        await uploads(req, res);
    } catch (error) {
        return res.status(400).json({success: false, error: `Error when trying upload image: ${error}`});
    } 
    
    if(req.body.password) {temp = await bcrypt.hash(req.body.password, 10) };

    FullUser.findById(req.params.id)
        .then(user => {

            user.username = req.body.username ? req.body.username : user.username;
            user.first = req.body.first ? req.body.first : user.first;
            user.last = req.body.last ? req.body.last : user.last;
            user.org = req.body.org ? req.body.org : user.org;
            user.major = req.body.major ? req.body.major : user.major;
            user.year = req.body.year ? req.body.year : user.year;
            user.occupation = req.body.occupation ? req.body.occupation : user.occupation;
            user.clss = req.body.clss ? req.body.clss : user.clss;
            user.fam = req.body.fam ? req.body.fam : user.fam
            user.additional = req.body.additional ? req.body.additional : user.additional;
            user.fb = req.body.fb ? req.body.fb : user.fb;
            user.linkedin = req.body.linkedin ? req.body.linkedin : user.linkedin;
            user.beMentor = req.body.beMentor != null ? req.body.beMentor : user.beMentor;
            user.beMentee = req.body.beMentee != null ? req.body.beMentee : user.beMentee;
            user.pfp = req.file ? req.file.filename : user.pfp;
            user.pfpName = req.file ? req.file.originalname : user.pfpName;  
            user.password = req.body.password ? temp : user.password;

            user.save()
                .then(() => res.json('User updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

//search for user by name (or username)
router.route('/searchChat/:username').get((req, res) => {
    FullUser.find({ username: req.params.username })
        .then(matches => res.json(matches))
        .catch(err => res.status(400).json('Error: ' + err));
});

//reset password
router.route('/fp').post((req, res) => {
    FullUser.findOne({ username: req.body.username })
        .then(user => {
            let boo = user !== null ? true : false;

            //no user
            if(!boo){
                return res.status(400).json({success:false, message: 'User not found'})
            }

            //create unique key
            let secret = user.password + '-' + user.createdAt;
            let token = jwt.sign({ id: user._id, username: user.username}, 
                secret,
                { expiresIn: '1h'}
            );

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: `${process.env.EMAIL_ADDRESS}`,
                  pass: `${process.env.EMAIL_PASSWORD}`,
                },
              });

            // verify connection configuration
            // transporter.verify(function(error, success) {
            //     if (error) {
            //     console.log(error);
            //     } else {
            //     console.log("Server is ready to take our messages");
            //     }
            // });

            const mailOptions = {
                from: process.env.EMAIL_ADDRESS,
                to: `${user.username}`,
                subject: 'Link To Reset Password',
                text:
                  'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
                  + 'Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n'
                  + `${process.env.CLIENT_URL}/reset/${token}\n\n`
                  + 'If you did not request this, please ignore this email and your password will remain unchanged.\n\n'
                  + 'This link will expire in 1 hours'
            };

            transporter.sendMail(mailOptions, (err, response) => {
                if (err) {
                  console.error('there was an error: ', err);
                } else {
                  res.status(200).json({data: user, success: true, message: 'Email Sent!'});
                }
              });
        })
        .catch(err => {
            res.status(400).json('Error: ' + err);
        });

    
});

//reset password
router.route('/resetValid/:token').get((req, res) => {
    const token = req.params.token;
    const tempUser = jwt.decode(token);
    // console.log(tempUser)
    FullUser.findById(tempUser.id)
        .then(user => {
            if(!user){
                res.json({success:false});
            }
            //create unique key
            const secret = user.password + '-' + user.createdAt;
            const verifiedUser = jwt.verify(token,secret); 
            
            if(verifiedUser){
                res.status(200).json({first:user.first,pass:user.password, success:true});
            }else{
                res.status(400).json({success:false}); 
            }
        })
        .catch(err => {
            res.status(400).json('Error: ' + err); 
        })
    
});

//reset password
router.route('/resetPassword').post(async (req, res) => {
    const tempUser = jwt.decode(req.body.token);

    console.log(req.body.new1.length);

    //length
    if(req.body.new1.length < 6 || req.body.new2.length < 6){
        return res.status(400).json({success:false, message:"Password must be at least 6 characters"}) 
    }

    //confirm not allowed
    if(req.body.new1 != req.body.new2){
        return res.status(400).json({success:false, message:"Passwords Do Not Match"}) 
    }
    console.log(req.body.new1, " | ", req.body.original);
    //same password as before
    if(await bcrypt.compare(req.body.new1, req.body.original)){
        return res.status(400).json({success:false, message:"Cannot use the same password"})
    }
    console.log("temp");
    FullUser.findById(tempUser.id)
        .then(async user => {

            console.log(2);

            user.password = await bcrypt.hash(req.body.new1, 10);
            user.save()
                .then(() => res.status(200).json({success:true, message:"Updated"}))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => {
            res.status(400).json('Error: ' + err);  
        }) 
    
});

module.exports = router;