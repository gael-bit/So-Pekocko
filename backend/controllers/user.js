const User = require('../models/user');
const bcrypt = require('bcrypt');
const token = require('jsonwebtoken');

exports.signup = (req, res,next) =>{
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
            .then(() => res.status(201).json({ message : 'Objet enregistré !'}))
            .catch(error => res.status(409).json({error : "Objet non enregistré !"}));
    })
    .catch(error => res.status(500).json({error}));
	
};

exports.login = (req, res,next) =>{
	console.log("find you!");
	console.log("hello",req.body);
	User.findOne({email: req.body.email })
	.then(user => {
        if(!user){
            return res.status(401).json({error: 'Utilisateur non trouvé !'});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if(!valid) {
                return res.status(401).json({error : "Mot de passe incorrect !"});
            }
            res.status(200).json({
                userId: user._id,
                token: token.sign({userID: user.id}, 'RANDOM_TOKEN_SECRET', {expiresIn: '24h'})
            });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};