const express = require('express');
const app = express();
const path = require('path');
const { title } = require('process');

// EJS를 템플릿 엔진으로 설정
app.set('view engine', 'ejs');

// views 디렉토리를 설정
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 경로 설정 (css, js, images)
app.use(express.static(path.join(__dirname, 'public')));

// 라우팅 설정
app.get('/', (req, res) => {
  res.render('pages/Main/index'), {title: 'Main page'};  // index.ejs 파일을 렌더링
});

// 라우팅 설정
app.get('/', (req, res) => {
  res.render('Map'), {title: 'Main page'};  // index.ejs 파일을 렌더링
});

// 라우팅 설정
app.get('/', (req, res) => {
  res.render('Login'), {title: 'Login page'};  // index.ejs 파일을 렌더링
});

// 라우팅 설정
app.get('/', (req, res) => {
  res.render('Thema'), {title: 'Thema page'};  // index.ejs 파일을 렌더링
});

// 라우팅 설정
app.get('/', (req, res) => {
  res.render('Thema2'), {title: 'Thema2 page'};  // index.ejs 파일을 렌더링
});

// 라우팅 설정
app.get('/', (req, res) => {
  res.render('Mypage'), {title: 'Mypage'};  // index.ejs 파일을 렌더링
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
