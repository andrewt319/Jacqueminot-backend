const router = require('express').Router();
let User = require('../models/user.model');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'lkjsdfku4@#$@#o7w59 pajfclvkas%$#ur3daFDUA'

router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post(async(req, res) => {
    const username = req.body.username;
    let pass = req.body.password;
    const password = await bcrypt.hash(pass, 10);

    const newUser = new User({ username, password });

    newUser.save()
        .then(() => res.json('User added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/login').post(async(req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).lean();
    // const user = await User.findById("60a8f501395670536e0bac33")

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

router.route('/change-password').post(async(req, res) => {
    const token = req.body.token;
    let pass = req.body.newpassword;

    const user = jwt.verify(token, JWT_SECRET);

    console.log(user);

    const userr = await User.findById(user.id).lean();
    console.log(userr);
    res.json({ status: 'ok' });
});
module.exports = router;