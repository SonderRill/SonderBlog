const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const passport = require('passport')
const bodyParser = require('body-parser')

let User = require('../models/user.js')


router.get('/register',(req, res) => {
	res.render('register')
})

router.post('/register', [

	check('name', 'Name is required'),
	check('email', 'Email is required'),
	check('email', 'Email is not valid').isEmail(),
	check('userName', 'Email is required'),
	check('password', 'Password is required'),
	check('password2', 'Password do not mutch').custom((value, {req}) => {
		if(value !== req.body.password){
			throw new Error('Password dont match')
		}
		
			return value
		
	})
	], 

	(req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const userName = req.body.userName;
    const password = req.body.password;
    const password2 = req.body.password2;

	const errors = validationResult(req)

	if(!errors.isEmpty()) {
		res.render('register',{
			errors:errors.errors
		})
	}

	else {
		let newUser = new User({
			name,
			email,
			userName,
			password
		})
		bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(newUser.password, salt, (err, hash) => {
			if(err) {
				console.log(err)
			}

			newUser.password = hash;
			newUser.save(err => {
				if(err) {
					console.log(err)
					return;
				}
				else {
					req.flash('success', 'You are new registered and can log in')
					res.redirect('/users/login')
				}
				
			})
		})
	})
	}

	

})

router.get('/login', (req, res) => {
	res.render('login')
})


router.post('/login',
		passport.authenticate('local',{
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true,
		successFlash:`You are login. You can add a new article.`
	})
)

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'You are logout')
	res.redirect('/users/login')
})



module.exports = router

