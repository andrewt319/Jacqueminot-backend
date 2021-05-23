const router = require('express').Router();
let FullUser = require('../models/fullUser.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const JWT_SECRET = 'lkjsdfku4@#$@#o7w59 pajfclvkas%$#ur3daFDUA'

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
        name,
        body,
        major,
        year,
        occupation,
        date,
        clss,
        fam,
        description,
        fb,
        linkedin,
        mentor,
        mentee
    } = req.body;

    const newFullUser = new FullUser({
        username,
        password,
        name,
        major,
        year,
        occupation,
        date,
        clss,
        fam,
        description,
        fb,
        linkedin,
        mentor,
        mentee
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

    FullUser.find({ major: user.major, mentor: "Open" })
        .then(matches => res.json(matches))
        .catch(err => res.status(400).json('Error: ' + err));
});

//find mentors
router.route('/findMentees/:id').get(async(req, res) => {

    const user = await FullUser.findById(req.params.id).lean();

    FullUser.find({ major: user.major, mentee: "Open" })
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
    console.log(req.file.path);

    const token = req.body.token;
    const tempUser = jwt.verify(token, JWT_SECRET);
    FullUser.findById(tempUser.id)
        .then(user => {
            user.username = req.body.username ? req.body.username : user.username;
            user.name = req.body.name ? req.body.name : user.name;
            user.bio = req.body.bio ? req.body.bio : user.bio;
            user.major = req.body.major ? req.body.major : user.major;
            user.year = req.body.year ? req.body.year : user.year;
            user.occupation = req.body.occupation ? req.body.occupation : user.occupation;
            user.clss = req.body.clss ? req.body.clss : user.clss;
            user.fam = req.body.fam ? req.body.fam : user.fam
            user.description = req.body.description ? req.body.description : user.description;
            user.fb = req.body.fb ? req.body.fb : user.fb;
            user.linkedin = req.body.linkedin ? req.body.linkedin : user.linkedin;
            user.mentor = req.body.mentor ? req.body.mentor : user.mentor;
            user.mentee = req.body.mentee ? req.body.mentee : user.mentee;
            user.pfp = req.file.path ? req.file.path : user.pfp;

            user.save()
                .then(() => res.json('User updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

//update by id, just for testing
router.route('/update/:id').post(upload.single('pfp'), async(req, res) => {
    console.log(req.file.path);
    FullUser.findById(req.params.id)
        .then(user => {
            user.username = req.body.username ? req.body.username : user.username;
            user.name = req.body.name ? req.body.name : user.name;
            user.bio = req.body.bio ? req.body.bio : user.bio;
            user.major = req.body.major ? req.body.major : user.major;
            user.year = req.body.year ? req.body.year : user.year;
            user.occupation = req.body.occupation ? req.body.occupation : user.occupation;
            user.clss = req.body.clss ? req.body.clss : user.clss;
            user.fam = req.body.fam ? req.body.fam : user.fam
            user.description = req.body.description ? req.body.description : user.description;
            user.fb = req.body.fb ? req.body.fb : user.fb;
            user.linkedin = req.body.linkedin ? req.body.linkedin : user.linkedin;
            user.mentor = req.body.mentor ? req.body.mentor : user.mentor;
            user.mentee = req.body.mentee ? req.body.mentee : user.mentee;
            user.pfp = req.file.path ? req.file.path : user.pfp;

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



module.exports = router;