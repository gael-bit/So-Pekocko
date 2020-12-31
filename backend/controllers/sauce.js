const Sauce = require('../models/sauce');
const fs = require('fs');


exports.getSauces = (req, res,next) =>{
	Sauce.find()
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) =>{
	Sauce.findOne({_id: req.params.id })
	.then(sauce => {
		res.status(200).json(sauce);
	})
	.catch(error => res.status(404).json({error}));
};

exports.createSauce = (req, res, next) =>{
    const sauceObjet = JSON.parse(req.body.sauce);
	delete sauceObjet._id;
	const sauce = new Sauce({
        ...sauceObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/image/${req.file.filename}`,
        likes : 0,
        dislikes : 0,
	});
	console.log(sauce);
    sauce.save()
    .then(() => res.status(201).json({ message : 'Objet enregistré !'}))
	.catch(error => {console.log(error); res.status(400).json({message : "Objet non enregistré !"})});
};

exports.modifySauce = (req, res, next) =>{
    const sauceObjet = req.file ?
    { 
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/image/${req.file.filename}`
    } : {...req.body};
	Sauce.updateOne({_id: req.params.id}, { ...sauceObjet, _id: req.params.id})
	.then(() => res.status(201).json({ message : 'Objet mit à jour !'}))
	.catch(error => res.status(400).json({error : "Objet non mit à jour !"}));
};

exports.deleteSauce = (req, res, next) =>{
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split('/image/')[1];
        fs.unlink(`image/${filename}`,() => {
            Sauce.deleteOne({_id: req.params.id})
            .then(() => res.status(201).json({ message: 'Objet supprimé !'}))
	        .catch(error => res.status(400).json({error}));
        });
    })
	.catch(error => res.status(500).json({error}));
};

exports.sauceLiked = (req, res, next) =>{
    console.log(req.body, "HELLO", req.params);
    Sauce.findOne({_id: req.params.id}) 
        .then(sauceInfos =>{
            switch (req.body.like){
                case 0 :    
                   for(let i = 0; i < sauceInfos.usersLiked.length; i++ ) {
                        if(sauceInfos.usersLiked[i]){
                            return removeLiked(req.params.id, req.body.userId, res);
                        }
                   }
                   return removeDisliked(req.params.id, req.body.userId, res);
                case 1 : 
                    return addLike(req.params.id, req.body.userId, res);
                case -1 :
                    return addDislike(req.params.id, req.body.userId, res);
                default :
                    res.status(404).json({"msg":"mal structured request"});
                    return ;
            }


        });

};


function removeDisliked(idSauce, idUser, res){
    Sauce.updateOne({ _id: idSauce }, { 
        $inc: { dislikes: -1},
        $pull: { usersDisliked: idUser }
      })
	.then(() => res.status(201).json({ message : 'Objet mit à jour !'}))
	.catch(error => res.status(404).json({error}));

}

function removeLiked(idSauce, idUser, res){
    Sauce.updateOne({ _id: idSauce }, { 
        $inc: { likes: -1},
        $pull: { usersLiked: idUser }
      })
	.then(() => res.status(201).json({ message : 'Objet mit à jour !'}))
	.catch(error => res.status(404).json({error}));


}

function addLike(idSauce, idUser, res){
    Sauce.updateOne({ _id: idSauce }, { 
        $inc: { likes: 1},
        $push: { usersLiked: idUser }
      })
	.then(() => res.status(201).json({ message : 'Objet mit à jour !'}))
	.catch(error => res.status(404).json({error}));


}

function addDislike(idSauce, idUser, res){
    Sauce.updateOne({ _id: idSauce }, { 
        $inc: { dislikes: 1},
        $push: { usersDisliked: idUser }
      })
	.then(() => res.status(201).json({ message : 'Objet mit à jour !'}))
	.catch(error => res.status(404).json({error}));
}

/*De Lionel H para todos:  06:34 PM
Sauce.updateOne({ _id: req.params.id }, {
                $inc: { likes: 1},
                $push: { usersLiked: req.body.userId }
              })
*/

/*De Lionel H para todos:  06:34 PM
Sauce.updateOne({ _id: req.params.id }, { if(dislikes : 0)
                $inc: { dislikes: -1},
                $push: { usersDisliked: req.body.userId }
              })
*/