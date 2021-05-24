const router = require('express').Router();
let FullUser = require('../models/fullUser.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const JWT_SECRET = process.env.JWT_SECRET
const nodemailer = require('nodemailer');

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
        org,
        major,
        year,
        occupation,
        date,
        clss,
        fam,
        additional,
        fb,
        linkedin,
        beMentor,
        beMentee
    } = req.body;

    const newFullUser = new FullUser({
        username,
        password,
        org,
        first,
        last,
        major,
        year,
        occupation,
        date,
        clss,
        fam,
        additional,
        fb,
        linkedin,
        beMentor,
        beMentee
    });

    const token = jwt.sign({ id: newFullUser._id, username: newFullUser.username },
        JWT_SECRET
    );

    newFullUser.save()
        .then(() => res.json({ success: true, data: token }))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/login').post(async(req, res) => {
    const { username, password } = req.body;

    const user = await FullUser.findOne({ username }).lean();

    if (!user) {
        return res.json({ status: 'error', error: 'Invalid username/password1' });
    }

    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id, username: user.username },
            JWT_SECRET
        );

        return res.json({ status: 'ok', data: token });
    }

    return res.json({ status: 'error', error: 'Invalid username/password2', user });
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
router.route('/update').post(upload.single('pfp'), async(req, res) => {
    const token = req.body.token;
    const tempUser = jwt.verify(token, JWT_SECRET);
    let temp = "";
    if(req.body.password) {temp = await bcrypt.hash(req.body.password, 10) };
    FullUser.findById(tempUser.id)
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
            user.pfp = req.file ? req.file.path : user.pfp;
            user.pfpName = req.file ? req.file.originalname : user.pfpName;
            user.password = req.body.password ? temp : user.password;

            user.save()
                .then(() => res.json({message: 'User updated!', success: true}))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

//update by id, just for testing
router.route('/update/:id').post(upload.single('pfp'), async(req, res) => {

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
            user.pfp = req.file ? req.file.path : user.pfp;
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
            console.log(user);
            let boo = user !== null ? true : false;
            console.log(boo); 
            res.json({data: user, success: boo});

            //
        })
        .catch(err => {
            console.log(err);
            res.status(400).json('Error: ' + err);
        });

    
});

module.exports = router;