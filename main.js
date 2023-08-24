//pm2 start ./pm2-config.json
//pm2 logs 0  

let sessionID = "";


////////////////////////////////////// 1. setting start //////////////////////////////////////
// path 모듈 (nodejs 내장 모듈)
// 운영체제 별로 상이할 수 있는 경로 관련 구분자가 다른 문제를 해결하기 위함
var path = require("path");
const PORT = 9099;

const express = require("express");
const axios = require('axios');
const app = express(); // 서버 생성

// 비밀번호 암호화 모듈
const bcrypt = require('bcrypt');
// salt : 공격자가 암호를 유추할 수 없도록 평문 데이터에 의미없는 데이터를 뿌려 넣는것 
const saltRounds = 10;

app.use(express.json()); // 본문에서 들어오는 json 데이터를 구문 분석하고 body 에서 사용할 수 있도록 해준다
app.use(express.urlencoded({ // 본문에서 들어오는 urlencoded 데이터를 구문 분석하고 body 에서 사용할 수 있도록 해준다 
    extended: false // false : body의 값이 임의의 객체가 아닌 문자열 또는 배열만 가능함을 의미
}));

var bodyParser = require('body-parser') // body 데이터를 분석하여 req.body로 출력해주는 미들웨어
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    limit: '150mb',
    extended: true
}))

var requestIp = require('request-ip'); // 클라이언트의 IP 주소를 요청 객체에 추가하는 미들웨어를 제공

app.set("view engine", "ejs"); // 기본 보기 엔진을 EJS(Embedded JavaScript)로 설정
app.set("views", path.join(__dirname, "views")); // 애플리케이션의 보기가 저장되는 디렉토리를 설정


app.listen(PORT, "0.0.0.0", () => { // 웹서버를 시작하고 지정된 포트에서 들어오는 연결 수신 대기
    console.log(`server started on PORT ${PORT} // ${new Date()}`);
});

// __dirname : 현재 파일이 위치한 폴더의 절대경로(directory + name)
// app.use("/cal_ex", express.static(path.join(__dirname, "/cal_ex")));

// app.use("/node_modules", express.static(path.join(__dirname, "/node_modules")));
// app.use("/assets", express.static(path.join(__dirname, "/assets")));
// app.use("/citek", express.static(path.join(__dirname, "/citek")));

// app.use('/bootstrap', express.static(path.join(__dirname, "/node_modules/bootstrap/dist")));
// app.use('/jquery', express.static(path.join(__dirname, "/node_modules/jquery/dist")));

////////////////////////////////////// 1. setting end //////////////////////////////////////

////////////////////////////////////// 2. DB start //////////////////////////////////////
const mysql2 = require("mysql2/promise");
const _pool = mysql2.createPool({ // 노트북 로컬
    host: "localhost",
    user: "root",
    password: "root",
    database: "wysiwyg",
    port: "3306",
    dateStrings: "date",
    connectionLimit: 10,
});

// _pool에 의해 생성된 연결 풀에서 연결 개체를 반환하는 비동기 함수 
// 연결이 사용된 후 다시 풀로 해제되도록 보장하므로 안전하다
async function _getConn() {
    return await _pool.getConnection(async (conn) => conn);
}
async function asyncQuery(sql, params = []) {
    const conn = await _getConn();
    try {
        const [rows, _] = await conn.query(sql, params);
        conn.release();
        return rows;
    } catch (err) {
        return err;
        console.log(
            `!! asyncQuery Error \n::${err}\n[sql]::${sql}\n[Param]::${params}`
        );
    } finally {
        conn.release();
    }
    return false;
}

////////////////////////////////////// 2. DB end //////////////////////////////////////

////////////////////////////////////// 3. 페이지 렌더링 start //////////////////////////////////////

// 메인
app.get("/", async (req, res) => {
	let rows = await asyncQuery(`
		SELECT UserID FROM tb_User
	`);

    console.log(rows);

	res.render("index", {
            rows: rows
        });
});

// app.get("/", async (req, res) => {

// 	res.render("index");
// });


////////////////////////////////////// 3. 페이지 렌더링 end //////////////////////////////////////