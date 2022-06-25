require('dotenv').config();
const express=require('express')
const app=express()
const jwt=require('jsonwebtoken')

let users=[
    {
        "email":"fairytailuzumaki@gmail.com",
        "password":"Kirito1151999",
        "name":"Ahmed",
        "gender":"male",
        "phone":"01027866191",
        "country":"Egypt"
    },
    {
        "email":"fairytailuzumaki2@gmail.com",
        "password":"Kirito1151999",
        "name":"Mei",
        "gender":"female",
        "phone":"No phone number",
        "country":"Soudi Arabia"
    },
    {
        "email":"fairytailuzumaki3@gmail.com",
        "password":"Kirito1151999",
        "name":"Mostafa",
        "gender":"male",
        "phone":"01027866191",
        "country":"Egypt"
    },
    {
        "email":"fairytailuzumaki4@gmail.com",
        "password":"Kirito1151999",
        "name":"Jihyo",
        "gender":"female",
        "phone":"No Phone number",
        "country":"South Korea"
    },
]

let tokens=[];

app.use(express.json())

app.get('/user',userAuthenticationToken,(req,res)=>{
    const userData=users.find(element=>element.email=== req.user.email);
    res.json({data:{
        "email":userData.email,
        "name":userData.name,
        "gender":userData.gender,
        "phone":userData.phone,
        "country":userData.country
    }})
})

app.delete('/logout',(req,res)=>{
    tokens.filter(element=>element!== req.body.token);
    res.sendStatus(200);
});

app.post('/token',(req,res)=>{
    const refreshToken=req.body.token;
    if(refreshToken==null) return res.sendStatus(401);
    if(!tokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken,process.env.REFRESH_TOKEN,(error,user)=>{
        if(error){
            res.sendStatus(403);
        }
        const userData={
            "email":user.email,
            "password":user.password
        }
        const accessToken=jwt.sign(userData,process.env.ACCESS_TOKEN,{expiresIn:'30s'});
        res.json({accessToken:accessToken});
    });
});

function userAuthenticationToken(req,res,next){
    const authHeader=req.headers['authorization'];
    console.log(authHeader);
    const token= authHeader && authHeader.split(' ')[1];
    if(token==null){
        return res.sendStatus(405);
    }
    jwt.verify(token,process.env.ACCESS_TOKEN,(err,user)=>{
        if(err){
            console.log(err.message);
            return res.sendStatus(403);
        }
        req.user=user;
        next();
    });
}

app.post('/login',(req,res)=>{
    const user=req.body;
    const foundUser=users.find(currentUser=>currentUser.email==user.email);
    if(foundUser){
        if(foundUser.password!=user.password){
            res.status(400).send('User\'s Password isn\'t match!!');
        }else{
            const accesToken=jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'30s'});
            const refreshToken=jwt.sign(user,process.env.REFRESH_TOKEN);
            tokens.push(refreshToken);
            res.json({
                accessToken:accesToken,
                refreshToken:refreshToken
            });
        }
    }else{
        res.status(401).send('User doesn\'t exist!!');
    }
})

app.listen(8080)