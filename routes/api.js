const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Addlibrary = require('../models/add-library');
const Books = require('../models/add-book');
const CheckIn = require('../models/checkIn');
const ReserveBook = require('../models/reservebook');
const mongoose = require('mongoose');
const fineList = require('../models/fine');
const jwt = require('jsonwebtoken');

const db = 'mongodb+srv://root:root@cluster0.gcrit.mongodb.net/library_management_system';

router.use(express.json());
mongoose.connect(db, err => {
    if (err) {
        console.error("Error", +err);
    } else {
        console.log('connected to mongo');
    }
})
function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send("Un Authorized request");
    }
    let token = req.headers.authorization.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send("Un authorized");
    }
    let payload = jwt.verify(token, 'secretKey');
    if (!payload) {
        return res.status(401).send("Unauthorized");
    }
    req.userId = payload.subject;
    next()
}
router.get('/', (req, res) => {
    res.send('from route api');
})

router.post('/register', (req, res) => {
    let userData = req.body
    let user = new User(userData);
    user.save((error, registeredUser) => {
        if (error) {
            console.log(error)
        } else {
            let payload = {
                subject: registeredUser._id,
                role: user.usertype,
                name: user.name,
                libraryname: user.library_name
            }
            let token = jwt.sign(payload, 'secretKey')
            res.status(200).send({
                token, payload
            });
        }
    })
})
router.post('/login', (req, res) => {
    let userData = req.body
    User.findOne({
        email: userData.email
    }, (error, user) => {
        if (error) {
            console.log(error)
        } else {
            if (!user) {
                res.status(401).send('Invalid email User doesnot exist')
            } else {
                if (user.password !== userData.password) {
                    res.status(401).send('Invalid Password Mail exist but different password')
                } else {
                    let payload = {
                        subject: user._id,
                        role: user.usertype,
                        name: user.name,
                        libraryname: user.library_name
                    }
                    let token = jwt.sign(payload, 'secretKey')
                    res.status(200).send({
                        token, payload
                    })
                }
            }


        }
    })
})
router.post("/add-library", verifyToken, async (req, res) => {
    // console.log(req.body)
    let library = new Addlibrary(req.body);
    library.save((error, data) => {
        res.status(200).send(data);
    })
})
router.get('/library-list', verifyToken, async (req, res) => {
    Addlibrary.find({}, (error, data) => {
        res.status(200).send(data);
    })
})
router.post("/add-book", verifyToken, async (req, res) => {
    // console.log(req.body)
    let book = new Books(req.body);
    book.save((error, data) => {
        res.status(200).send(data);
    })
})
router.get('/book-list', verifyToken, async (req, res) => {
    const item = req.query.libraryname;
    let name = {};
    item?.length == 0 ? name = name : name = { libraryname: req.query.libraryname };
    // console.log(name,item,"sasa")
    Books.find(name, (error, data) => {
        res.status(200).send(data);
    })
})

router.post("/check-in", verifyToken, async (req, res) => {
    let checkIn = new CheckIn(req.body);

    Books.deleteOne({ _id: req.body.bookId }, async (err, data1) => {
        checkIn.save((error, data) => {
            res.status(200).send(data)
        })
    })
    ReserveBook.deleteOne({ bookId: req.body.bookId }, async (err, data1) => {
        console.log("deleted");
    })

})

router.get("/check-in", verifyToken, async (req, res) => {
    CheckIn.find({ userId: req.query.userId }, async (error, data) => {
        await data.forEach(x => {
            console.log(new Date(x.endDate) < new Date(), (x.price))
            new Date(x.endDate) < new Date() && x.status == "check-in" ? x.fine = (x.price + 50) : x = x;
            console.log(x);
        })
        res.status(200).send(data);
    })
})

router.post("/renewal-book", verifyToken, async (req, res) => {
    CheckIn.updateMany({ bookId: req.body.bookId }, { $set: { status: "check-in", startDate: req.body.startDate, endDate: req.body.endDate } }, async (error, data) => {
        res.status(200).send(data);
    })
})

router.post("/pay-fine", verifyToken, async (req, res) => {
    CheckIn.updateMany({ bookId: req.body.bookId }, { $set: { status: "paid" } }, async (error, data) => {
        let obj = {
            userId: req.body.userId,
            libraryname: req.body.libraryname,
            amount: req.body.fine,
            status: "Paid",
            bookId: req.body.bookId,
            bookname: req.body.bookname,
        }
        let fine = new fineList(obj);
        fine.save()
        res.status(200).send(data)
    })
})
router.post("/check-out", verifyToken, async (req, res) => {
    CheckIn.updateMany({ bookId: req.body.bookId }, { $set: { status: "check-out", libraryname: req.body.libraryname } }, async (error, data1) => {
        let book = new Books(req.body);
        book.save((error, data) => {
            res.status(200).send({ data, data1 });
        })
    })
})
router.post("/reserve-book", verifyToken, async (req, res) => {
    let reserveBook = new ReserveBook(req.body);
    reserveBook.save((error, data) => {
        res.status(200).send(data);
    })
})
router.get("/reserve-book", verifyToken, async (req, res) => {
    ReserveBook.find({ userId: req.query.userId }, async (error, data) => {
        res.status(200).send(data);
    })

})
// router.post("/create-teams", verifyToken, async (req, res) => {
//     let data = { userId: req.userId, teams: req.body };
//     let team = new Teams(data);
//     team.save((error, data) => {
//         res.status(200).send(data);
//     })
// })
// router.post("/add-player", verifyToken, async (req, res) => {
//     let obj = [{
//         batsman1: req.body.batsman1,
//         batsman2: req.body.batsman2,
//         bowler: req.body.bowler
//     }];
//      Teams.updateOne({ _id: req.body._id }, { $set: { player_record: obj } }, async (err, data) => {
//         data ? res.status(200).send(data) : res.status(400).send("Nothing Found");
//     })
//     // console.log(req.body._id, "data");
//     await getPlayerRecords(req);
// })
// function getPlayerRecords(req){
//     Teams.find({ _id: req.body._id }, async (error, data) => {    
//         console.log(data, "data");
//         let over = await new Overs({ userId: data[0].userId, teamId: data[0]._id, overs: [] });
//         await over.save(async (error, overdata) => {
//             await console.log(overdata, "overData")
//         })
//     })
// }
// router.get("/records/:id", verifyToken, (req, res) => {
//     Teams.find({ _id: req.params.id }, (error, data) => {
//         res.status(200).send(data);
//     })
// })
// router.post("/overs-record", verifyToken, (req, res) => {
//     let item = {
//         bowler: req.body.bowler,
//         batsman: req.body.batsman,
//         ball_count: req.body.ball_count,
//         runs: req.body.runs,
//         extraRuns: req.body.extraRuns
//     };
//     Overs.updateOne({ teamId: req.body.teamId }, { $push: { 'overs': item } }, (err, result) => {
//         res.status(200).send(result);
//     })
// })
// router.get("/ball-records/:id", verifyToken, (req, res) => {
//     console.log(req.params.id);
//     Overs.find({ teamId: req.params.id }, async (error, data) => {
//         let dataItem = await data[0].overs ?? null;
//         console.log(dataItem)
//         res.status(200).send(data);
//     })
// })
module.exports = router;