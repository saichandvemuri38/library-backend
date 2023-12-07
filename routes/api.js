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

// const db = 'mongodb+srv://root:root@cluster0.gcrit.mongodb.net/library_management_system';
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
                fname: user.fname ,
                lname:user.lname,
                libraryname: user.library_name,

                // confirmPassword:user.confirmPassword,
                
                // dob:user.dob,
                
                // email:user.email,
               
                // fname:user.fname,
                
                // lname:user.lname,
              
                // password:user.password,
             
                // phoneNumber:user.phoneNumber,

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
                        fname: user.fname ,
                        lname:user.lname,
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
router.post('/forgot-password', (req, res) => {
    let userData = req.body
    if(userData.password == ''){
        User.findOne({
            email: userData.email
        }, (error, user) => {
            if (error) {
                console.log(error)
            } else {
                if (!user) {
                    res.status(401).send('Invalid email User doesnot exist')
                }
                else{
                    res.send("true");
                }
            }
        });
    }
    else{
        User.updateMany({ email: userData.email }, { $set: { password:userData.password } }, async (error, data) => {
            res.status(200).send({data,changed:true});
        })
    }
 
})
router.post("/add-library", verifyToken, async (req, res) => {
    let library = new Addlibrary(req.body);
    library.save((error, data) => {
        res.status(200).send(data);
    })
})
router.get('/user-records',verifyToken,(req,res)=>{
    User.findById(req.query.id, (error, data) => {
        res.status(200).send(data);
    })
})
router.get('/library-list', verifyToken, async (req, res) => {
    Addlibrary.find({}, (error, data) => {
        res.status(200).send(data);
    })
})
router.post("/add-book", verifyToken, async (req, res) => {
    let book = new Books(req.body);
    book.save((error, data) => {
        res.status(200).send(data);
    })
})
router.get('/book-list', verifyToken, async (req, res) => {
    const item = req.query.libraryname;
    let name = {};
    item?.length == 0 ? name = name : name = { libraryname: req.query.libraryname };
    Books.find(name, (error, data) => {
        res.status(200).send(data);
    })
})
router.get('/book', verifyToken, async (req, res) => {
    Books.find({libraryname:req.query.libraryname}, (error, data) => {
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
            console.log(new Date(x.endDate) < new Date() && x.status == "on-hand")
            new Date(x.endDate) < new Date() && x.status == "on-hand" ? x.fine = (x.price + 50) : x = x;
        })
        console.log(data);
        res.status(200).send(data);
    })
})
router.post("/renewal-book", verifyToken, async (req, res) => {
    CheckIn.updateMany({ bookId: req.body.bookId }, { $set: { status: "on-hand", startDate: req.body.startDate, endDate: req.body.endDate } }, async (error, data) => {
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
            bookname: req.body.name,
            userName:req.body.userName
        }
        let fine = new fineList(obj);
        fine.save()
        res.status(200).send(data)
    })
})
router.post("/check-out", verifyToken, async (req, res) => {
    let date = new Date();
    CheckIn.updateMany({ bookId: req.body.bookId }, { $set: { status: "check-out", libraryname: req.body.libraryname, endDate: date } }, async (error, data1) => {
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
router.delete('/delete-reserve-book', verifyToken, async (req, res) => {
    ReserveBook.deleteMany({ _id: req.query.id }, async (error, deletedata) => {
        let book = new Books(req.body);
        book.save((error, data) => {
            res.status(200).send({ data, deletedata });
        })
    })

});
router.get('/fine-list',verifyToken,(req,res)=>{
    fineList.find({libraryname: req.query.libraryname} , (error, data) => {
        res.status(200).send(data);
    })
})
module.exports = router;
