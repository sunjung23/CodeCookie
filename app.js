const express = require('express');
const app = express();
const path = require('path');
const { title } = require('process');
const { MongoClient, ObjectId } = require('mongodb')       // mongodb 
const session = require('express-session')       // passport 라이브러리
const passport = require('passport')             // passport 라이브러리
const LocalStrategy = require('passport-local') // passport 라이브러리
const MongoStore = require('connect-mongo')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// EJS를 템플릿 엔진으로 설정
app.set('view engine', 'ejs');

// views 디렉토리를 설정
app.set('views', path.join(__dirname, 'views/'));

// 정적 파일 경로 설정 (css, js, images)
app.use(express.static(path.join(__dirname, 'public')));

// DB 연결
let db
const url = 'mongodb+srv://user:1234@cluster0.b3bf6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('CodeCookie')

    // 서버 시작
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch((err)=>{
  console.log(err)
})

// passport
app.use(passport.initialize())
app.use(session({
  secret: 'password',
  resave : false,
  saveUninitialized : false,
  cookie : {maxAge : 60 * 60 * 1000},
  store : MongoStore.create({
    mongoUrl : 'mongodb+srv://user:1234@cluster0.b3bf6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    dbName : 'CodeCookie'
  })
}))

app.use(passport.session())

passport.use(new LocalStrategy(async (username, password, cb) => {
  let result = await db.collection('user').findOne({ username : username})
  if (!result) {
    return cb(null, false, { message: '없는 아이디 입니다' })
  }
  if (result.password == password) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비밀번호 불일치' });
  }
}))

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username })
  })
})

passport.deserializeUser(async (user, done) => {
  let result = await db.collection('user').findOne({_id :new ObjectId(user.id)})
  delete result.password
  process.nextTick(() => {
    return done(null, result)
  })
})


// 라우팅 설정
app.get('/', (req, res) => {
  res.render('pages/Main/index'), {title: 'Main page'};  // index.ejs 파일을 렌더링
});

// 라우팅 설정
app.get('/Map', (req, res) => {
  res.render('pages/Map', {title: 'Map page'});  // index.ejs 파일을 렌더링
});


// 라우팅 설정
app.get('/Thema1', (req, res) => {
  res.render('pages/Thema/Thema1', {title: 'Thema page'});  // index.ejs 파일을 렌더링
});

// 라우팅 설정
app.get('/Thema2', (req, res) => {
  res.render('pages/Thema/Thema2', {title: 'Thema2 page'});  // index.ejs 파일을 렌더링
});

// 로그인페이지
app.get('/Login', (req, res) => {
  console.log(req.user)
  res.render('pages/Login', {title: 'Login page'});  // index.ejs 파일을 렌더링
});

app.post('/login', async (req, res, next) => {

  passport.authenticate('local', (error, user, info) => {
      if (error) return res.status(500).json(error)
      if (!user) return res.status(401).json(info.message)
      req.logIn(user, (err) => {
        if (err) return next(err)
        res.redirect('/')
      })
  })(req, res, next)

}) 

// 로그아웃
app.get('/logout', (req, res, next)=> {
  req.logout((err) => {
    if (err) { return next(err); }
    
    req.session.save(function() {
      res.redirect('/');
    });
  });
});

// 회원가입 페이지
app.get('/register',(req,res)=>{
  res.render('pages/register')
})

app.post('/register',async(req,res)=>{
  await db.collection('user').insertOne({
    username : req.body.username,
    password : req.body.password,
    friend : []
  })
  res.redirect('/')
})

// 마이페이지
app.get('/Mypage', async(req, res) => {
  let result = req.user
  if (req.user){
    res.render('pages/Mypage', {result : result }) 
  }else {
    res.send('로그인 필요')
  }  
});

// 유저목록 페이지
app.get('/user',async(req,res)=>{
  let result = await db.collection('user').find().toArray()
  let user = req.user
  res.render('pages/user',{result : result, user:user})
})

// 유저 검색기능
app.get('/usersearch', async(req,res)=>{
  let result = await db.collection('user').find({username : {$regex : req.query.search} }).toArray()
  let user = req.user
  res.render('pages/usersearch.ejs',{result : result, user : user})
})

// 친구추가 기능
app.get('/addfriend', async(req,res)=>{
  let user = await db.collection('user').findOne({username : req.user.username})
  let filter = user.friend

  if (filter.indexOf(req.query.friendname) == -1) {
    await db.collection('user').updateOne(
      {username : req.query.username},
      {$push : {friend : req.query.friendname} }
    )
    await db.collection('user').updateOne(
      {username : req.query.friendname},
      {$push : {friend : req.query.username}}
    )
    let friend = await db.collection('user').findOne({username : req.user.username})
    res.render('pages/friendlist', {friend : friend.friend} )
  } else {
    res.send('이미 친구추가 되있음')
  }
  
})

// 친구목록 페이지
app.get('/friendlist',async(req,res)=>{
  if(req.user) {
    let friend = await db.collection('user').findOne({username : req.user.username})
    res.render('pages/friendlist', {friend : friend.friend} )
  } else {
    res.send('로그인 필요')
  }  
})

