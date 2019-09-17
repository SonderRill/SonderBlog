const express = require('express');
const router = express.Router()
const { check, validationResult } = require('express-validator');
let Article = require('../models/article.js')
let User = require('../models/user.js')

// add articles
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render("add_article", {
        title: 'Add Articles'
    })
})

router.post('/add',[

    check('title', 'Title must not be empty').isLength({min:1}),
    // check('author', 'Author must not be empty').isLength({min:1}),
    check('body', 'Body must not be empty').isLength({min:1})

    ], (req, res) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.render('add_article', {
            title: 'Add Article',
            errors: errors.errors
        })
        
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user.name;
        article.body = req.body.body;
        article.unique = req.user._id

        article.save((err) => {
            if (err) {
                console.log(err)
                return
            } else {
                req.flash('success','Article Added');
                res.redirect('/')
            }

        })
    }
})

// update articles
router.get('/edit/:id', ensureAuthenticated, (req, res) => {

    Article.findById(req.params.id, (err, article) => {
        

       if(req.user._id != '5d78ae77c500aa059cf3616f' && article.unique != req.user._id) {
            req.flash('danger', 'Not Authorized')
            return res.redirect('/')


        }
        else {
            return res.render('edit_article', {
                title:'Edit Article',
                article: article
            }) 
        }
        

    })
})

router.post('/edit/:id',[
    check('title', 'Title must not be empty').isLength({min:1}),
    check('author', 'Author must not be empty').isLength({min:1}),
    check('body', 'Body must not be empty').isLength({min:1})

    ], (req, res) => {
    const errors = validationResult(req)
    
    if(!errors.isEmpty()) {
        Article.findById(req.params.id, (err, article) => {
            res.render('edit_article', {
                title:'Edit',
                 article: article,
                author:article.name,
                errors:errors.errors
            })   
    })
    }
    else {
        let article = {}
        article.title = req.body.title;
        article.author = req.body.author
        article.body = req.body.body

        let query = {_id:req.params.id}

        Article.updateOne(query, article, (err) => {
            if (err) {
                console.log(err)
                return
            } else {
                req.flash('success','Article Update');
                res.redirect('/')
            }
        })
    } 
})

// delete articles
router.delete('/:id', (req, res) => {
    if(!req.user._id) {
        res.status(500).send()
    }

	let query = {_id:req.params.id}

    Article.findById(req.params.id, (err, article) => {
        if(req.user._id != '5d78ae77c500aa059cf3616f' && article.unique != req.user._id){
            return res.status(500).send()
        }
        else {
            Article.deleteOneg(query, (err) => {
            console.log(err)
            })

            req.flash('success','Article Delete');
            res.send('Success')
        }
    })

	
})

router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.unique, (err, user) => {
            res.render('article', {
                article: article,
                author: article.author
            })
        })
        

    })
})

function ensureAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }

    req.flash('danger', 'Please login')
    res.redirect('/users/login')
}



module.exports = router