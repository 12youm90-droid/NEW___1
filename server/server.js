const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GitHub OAuth 기능 제거됨

// 미들웨어
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static('../preview'));

// 데이터 파일 경로
const DATA_DIR = path.join(__dirname, 'data');
const SPOTS_FILE = path.join(DATA_DIR, 'spots.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 메모리 데이터베이스 (실제로는 MongoDB, PostgreSQL 등 사용)
let users = [];
let spots = [];
let spotIdCounter = 101;

// 데이터 저장 함수
const saveData = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SPOTS_FILE, JSON.stringify({ spots, spotIdCounter }, null, 2));
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
    console.log('💾 데이터 저장 완료');
  } catch (error) {
    console.error('❌ 데이터 저장 오류:', error);
  }
};

// 데이터 로드 함수
const loadData = () => {
  try {
    let hasData = false;
    
    // 포토스팟 데이터 로드
    if (fs.existsSync(SPOTS_FILE)) {
      const spotsData = JSON.parse(fs.readFileSync(SPOTS_FILE, 'utf8'));
      spots = spotsData.spots || [];
      spotIdCounter = spotsData.spotIdCounter || 101;
      console.log('📂 저장된 포토스팟 데이터 로드:', spots.length, '개');
      hasData = true;
    }
    
    // 사용자 데이터 로드
    if (fs.existsSync(USERS_FILE)) {
      const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      users = usersData.users || [];
      console.log('👥 저장된 사용자 데이터 로드:', users.length, '명');
    }
    
    return hasData;
  } catch (error) {
    console.error('❌ 데이터 로드 오류:', error);
    return false;
  }
};

// 초기 데이터 생성 (최초 1회만)
const initializeData = () => {
  const defaultAuthor = { id: 0, nickname: '관리자' };
  spots = [
    { id: 's1', name: '남산 팔각정 포토존', province: '서울특별시', city: '중구', district: '남산동', detailAddress: '남산 팔각정', desc: '서울 야경을 배경으로 한 감성 포토스팟. 밤 시간이 특히 아름답습니다.', tags: ['#야경','#사계절','#팔각정'], lat: 37.5505, lng: 126.9877, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEwMTVfMTU1%2FMDAxNzYwNTEzNTQ2NDI5.BAHVHl81uwJjXxyFrCMosrS_rWNf5H-0vW2nFsPaGYIg.6W5EAt0buel1jupOmRrB_JCekcQMWVwgFgWnaOMP4-Qg.JPEG%2FSE-152F2045-F137-427F-BBFB-CAC036C0FCBB.jpg&type=sc960_832', likes: 245, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's2', name: '북촌 한옥마을 포토스팟', province: '서울특별시', city: '종로구', district: '가회동', detailAddress: '북촌로 일대', desc: '전통 한옥과 현대 감성이 어우러진 포토존. 한복 대여소도 많음.', tags: ['#한옥','#전통','#감성'], lat: 37.5801, lng: 126.9777, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMjA2MDRfMjQy%2FMDAxNjU0MzE0NDU1NDE5.xshpiNkFoUEY4AfKN-8ScTX8khyWA_qo2w0sa5GKwPYg.LTDjZvjZB9qryr6A-80A4zphEyQz-b8e0O0IYD2QYlgg.JPEG.1127qaz%2FIMG_5136.jpg&type=sc960_832', likes: 189, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's3', name: '경복궁 야경 포토존', province: '서울특별시', city: '종로구', district: '세종로', detailAddress: '경복궁 정문', desc: '밤에 조명이 들어오는 경복궁. 한국 전통미를 담을 수 있는 최고의 장소.', tags: ['#야경','#궁궐'], lat: 37.5949, lng: 126.9776, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTA2MDJfNDYg%2FMDAxNzQ4ODU1ODQ5ODU3.5HpMfI0tcb8XlxN3skYCd_TRKiz3U7bF-KIXxbMOWX8g.yo0QJxSLIpUiMpibReFk6qOKJCstg0tjfp-6Wy44XEgg.JPEG%2F20250528%25A3%25DF202517.jpg&type=sc960_832', likes: 312, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's4', name: '감천문화마을', province: '부산광역시', city: '사하구', district: '감천동', detailAddress: '감내2로', desc: '알록달록한 집들이 산 언덕에 펼쳐진 포토존. 부산의 숨은 보석.', tags: ['#색감','#마을','#부산'], lat: 35.0977, lng: 129.0653, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTEyMDdfNDQg%2FMDAxNjM4ODcwNjc5ODc5.BUSzOCm0IMAmJ4EVbLGX4QCMvwBqgYJdD4d7j9yqGwgg.tI9BbmRRNi9qLBTAjzoMzmoSCOkAqD7I5qmcYKzAs5Yg.GIF.wiz_js%2F20211206%25A3%25DF181451%25A3%25A80%25A3%25A9.gif&type=sc960_832_gif', likes: 267, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's5', name: '전주 한옥마을', province: '전북특별자치도', city: '전주시', district: '완산구 풍남동', detailAddress: '어진길 일대', desc: '전통 한옥이 가득한 마을의 야경. 정감 있는 느낌의 사진을 담을 수 있음.', tags: ['#한옥','#야경','#전주'], lat: 35.8242, lng: 127.1410, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA3MDNfMjI2%2FMDAxNzE5OTM3NjYwMjA2.61Fy6edtTMgdwU44_nmw5RXNfMjxrsXJKMyuRxinGHog.g5NuJeAC4w6JXFle1GA66vbTDH5t1fzshY8xWwwgttgg.JPEG%2F1_%25A1%25DA%25B8%25DE%25C0%25CE%25BB%25E7%25C1%25F8%25A1%25DA.jpg&type=sc960_832', likes: 198, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's6', name: '자작나무 숲', province: '강원특별자치도', city: '인제군', district: '원대리', detailAddress: '자작나무숲길', desc: '푸른 자연 속 한적한 숲길. 산림욕과 사진촬영을 동시에 즐길 수 있는 곳.', tags: ['#자연','#산','#숲'], lat: 37.8917, lng: 128.2019, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAxNzEwMDlfMTAx%2FMDAxNTA3NDc4MTY4OTMw.4RV0ECR2aFiOOCgyc3rE2EvwtdAdr2-sj742DmOV7q8g.ppkMFdzG9AcYanFxQuWVyCd7tGBydrSpEqc6BDYYx-Yg.JPEG.durden09%2F207.JPG&type=sc960_832', likes: 156, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's7', name: '해운대 해변 일몰 포인트', province: '부산광역시', city: '해운대구', district: '우동', detailAddress: '해운대해변로', desc: '부산 해운대의 아름다운 일몰 포인트. 저녁 시간 방문 권장.', tags: ['#일몰','#해변','#부산'], lat: 35.1607, lng: 129.1608, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAxNzAyMTNfMjQy%2FMDAxNDg2OTE0Njc5MzEy.uk3ZIeKHhdgCI2NbN-OIBpcmAR3-vWZkedIDE6VbHUMg.bRoYu0X0pbHFlYPZlme-Ub2xTRDZTRLrz9qW0bzB3ygg.PNG.pjhadan%2F%25B9%25CC%25C6%25F75-1.png&type=sc960_832', likes: 284, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's8', name: '아침고요수목원', province: '경기도', city: '가평군', district: '상면', detailAddress: '수목원로 432', desc: '계절마다 다양한 식물과 꽃을 볼 수 있는 포토존. 봄과 가을이 최고.', tags: ['#식물','#정원','#계절'], lat: 37.3192, lng: 127.2125, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA1MjRfMjU1%2FMDAxNzE2NTE0ODAwMzQ3.QGzqUHdJ7PouX56ckLhkOAaZxRoCJ_McuiX2ahjq0tAg.f7GQf38Sc2wXt3vRkE2oqzhPWSzkQjIv-KdpghCi33wg.JPEG%2FIMG_6938.jpg&type=sc960_832', likes: 167, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's9', name: '덕수궁 석조전', province: '서울특별시', city: '중구', district: '정동', detailAddress: '덕수궁길 61', desc: '신고딕 양식의 아름다운 건축물. 클래식한 사진을 찍을 수 있는 곳.', tags: ['#건축','#클래식','#궁궐'], lat: 37.5648, lng: 126.9629, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTA4MDNfMjI4%2FMDAxNzU0MjAyMTg5NzY2.Oy7fzpdqj8Fw76LUWjSqniSGHW7hJbLMit0szzpXfkog.pn3LfMjnJFKFOBkarekeVwqBZbzkcY68_ks7YfmnhPgg.JPEG%2FIMG%25A3%25DF0076.JPG&type=sc960_832', likes: 223, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's10', name: '정동진 해변', province: '강원특별자치도', city: '강릉시', district: '강동면', detailAddress: '정동진리', desc: '영동선 기차를 배경으로 한 독특한 포토존. 기차 애호가들이 찾는 곳.', tags: ['#해변','#기차','#강릉'], lat: 37.3294, lng: 129.0123, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDAzMDdfNCAg%2FMDAxNzA5NzQ4NjczNDQy._Mvck3VSFVl6xXBvgdCyfTpqpXn_V6YOeKsIKprVwY8g.vvLS_-nPYun4hGgxPHDEkDTSQX2hvUCGfXVP90Iwz7Ig.PNG%2Fimage.png&type=sc960_832', likes: 198, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's11', name: '남이섬', province: '강원특별자치도', city: '춘천시', district: '남산면', detailAddress: '남이섬길 1', desc: '드라마 촬영지로 유명한 섬. 자전거 타기에도 좋고 사진도 예쁘게 나오는 곳.', tags: ['#섬','#자연','#드라마'], lat: 37.7915, lng: 127.5268, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA5MjJfMTE4%2FMDAxNzI2OTg5MjMyNzcz.qsZYYTBNhqoKZJXeNsFKEXz3-SxN92NxYA6MJUEwNfQg.BZ30oI3_X0HNY9_wUHTBNGNYEWZ2v26J--BFH7wHgPkg.JPEG%2FIMG_6348.JPG&type=sc960_832', likes: 312, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's12', name: '보령 머드축제 해변', province: '충청남도', city: '보령시', district: '신흑동', detailAddress: '대천해수욕장', desc: '여름 축제로 유명한 해변. 일몰 시간대 촬영 권장.', tags: ['#해변','#축제','#여름'], lat: 36.3330, lng: 126.4884, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MTNfMjIz%2FMDAxNjg5MjI2MTIxNDg0.ZMv-GxY3_l-cV6UhCxS4FZgaK-k1KnWWzMz7_y8Kbfkg.uMpkkqUXjrQDrw_LdC84BxjWKKNT9DQ6_oEP0r9lFmcg.JPEG.gong85love%2FIMG_1907.JPG&type=sc960_832', likes: 187, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's13', name: '제주 섭지코지', province: '제주특별자치도', city: '서귀포시', district: '성산읍', detailAddress: '섭지코지로', desc: '드라마 촬영지로 유명한 제주의 대표 포토스팟. 바다와 절벽이 어우러진 장관.', tags: ['#제주','#바다','#절벽'], lat: 33.4238, lng: 126.9295, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA3MDdfMjQg%2FMDAxNzIwMzI3Njk5ODM2.sInx_Y8F7XBqzOPVbEa5jx46dXJG_xMiMr-BSwmpGy4g.Pu-PkIcNVsIEbPxsjKLvpjOkNc0fAZdh2mhqNwNUvA0g.JPEG%2FIMG_3287.JPG&type=sc960_832', likes: 445, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's14', name: '여수 밤바다', province: '전라남도', city: '여수시', district: '중앙동', detailAddress: '여수해양공원', desc: '노래로도 유명한 여수의 야경 명소. 불빛이 반사된 바다가 아름다움.', tags: ['#야경','#바다','#여수'], lat: 34.7436, lng: 127.7430, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA0MTdfMTM0%2FMDAxNzEzMzA3NzE0OTcx.qLHD84EpyY3RcfvMuQz3AW78ygAP6jt1XZNrTpPaLEwg.s-h3gkUMLfHM_4tYDpEt3kZeXjQ8qV5d_cVfqxZYPiMg.JPEG%2F1713243306673.jpg&type=sc960_832', likes: 398, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's15', name: '속초 해수욕장', province: '강원특별자치도', city: '속초시', district: '조양동', detailAddress: '해오름로', desc: '일출 명소로 유명한 속초의 해변. 새벽 시간대 방문 추천.', tags: ['#일출','#해변','#속초'], lat: 38.1872, lng: 128.5942, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA4MDJfNjUg%2FMDAxNzIyNTk1MjU5Njcz.PFUgNnRRw5SspI7GCxnUE0P-MWCW1OLMgJdGpJx-BNAg.WxM31gT7Y1f06sXbLgxEUe8V-8Rlh_PbjRlGI8V2uykg.JPEG%2FIMG_4176.JPG&type=sc960_832', likes: 256, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's16', name: '인천 차이나타운', province: '인천광역시', city: '중구', district: '북성동', detailAddress: '차이나타운로', desc: '이색적인 중국풍 거리. 짜장면 박물관도 근처에 위치.', tags: ['#차이나타운','#이색','#인천'], lat: 37.4759, lng: 126.6174, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA1MjZfMjAz%2FMDAxNzE2NzAzMzI4ODAy.sTZGCJnCKcnjcGmqCOBIMmnH1YbMYX1BpH95QCDO5Vog.lG4yjhKw8wU7pUZN4c2jQOsIa4h93SiQDcyxb1h1SQog.JPEG%2FIMG_0356.JPG&type=sc960_832', likes: 201, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's17', name: '대구 김광석 거리', province: '대구광역시', city: '중구', district: '대봉동', detailAddress: '달구벌대로', desc: '벽화와 조형물이 가득한 예술 거리. 감성 사진 촬영지로 유명.', tags: ['#벽화','#거리','#대구'], lat: 35.8559, lng: 128.5734, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA2MTBfMjI5%2FMDAxNzE4MDAyMTk5ODI3.gsFmjzXc4dz8T4TIspYG_6s7jBEivU35eIXzgBj_q0Eg.LMj2UmJdSXwGOkXm3qVHt9e2UpGwPGFFLaO80QQSl9Yg.JPEG%2FIMG_3745.JPG&type=sc960_832', likes: 178, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's18', name: '경주 불국사', province: '경상북도', city: '경주시', district: '진현동', detailAddress: '불국로 385', desc: '세계문화유산으로 지정된 사찰. 전통 건축의 아름다움을 느낄 수 있음.', tags: ['#사찰','#문화재','#경주'], lat: 35.7898, lng: 129.3321, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA0MjFfMjA4%2FMDAxNzEzNjk5NTY3Mzcy.xgmXVuO1sK0xAUYM5dMZSLztjQVY2bLRKKEHrQVLuDwg.EGo5fTfyW1vt3sjPwFJWTkGCXJU1-6tTmzCBbMHUTr0g.JPEG%2FIMG_1521.JPG&type=sc960_832', likes: 289, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's19', name: '광주 양림동 펭귄마을', province: '광주광역시', city: '남구', district: '양림동', detailAddress: '펭귄마을길', desc: '귀여운 펭귄 벽화로 유명한 마을. SNS 인증샷 명소.', tags: ['#벽화','#마을','#광주'], lat: 35.1395, lng: 126.9136, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MTRfMjU3%2FMDAxNjkyMDA2NDEzNjcw.uDH8E88sXJI1Hqh2qHzlVYjUfhR4-bDYvMMVVKLEeU8g.6c6kBq6aXVD6Rd3MmMl58kZrvvJZxCrMNt2w84BcMbog.JPEG.nice_man__%2FIMG_4201.JPG&type=sc960_832', likes: 234, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's20', name: '태안 신두리 해안사구', province: '충청남도', city: '태안군', district: '원북면', detailAddress: '신두리', desc: '사막 같은 모래언덕. 독특한 풍경 사진을 찍을 수 있는 곳.', tags: ['#사구','#모래','#태안'], lat: 36.8042, lng: 126.2339, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MjJfMTQy%2FMDAxNjg5OTg5MjI3MDIw.vgZk4OMxIkIkHBxkKZyFbhXsZA1wvPm4gJOJkP7Qlnkg.BpcWBmvKIGYKVJ0eVOHB4EtqAT85Q0r3HdMo0eYZ-P8g.JPEG.rami0816%2FIMG_2157.JPG&type=sc960_832', likes: 167, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's21', name: '통영 동피랑 벽화마을', province: '경상남도', city: '통영시', district: '동호동', detailAddress: '동피랑길', desc: '언덕 마을에 그려진 다채로운 벽화. 바다가 내려다보이는 전망도 일품.', tags: ['#벽화','#마을','#통영'], lat: 34.8466, lng: 128.4309, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA0MDJfMjI2%2FMDAxNjgwNDA2ODU5NDQ4.3zJdDqmEyEqI6kgHlIFQZ5yGNE-ckRlhZeLLxOxTR9Ig.QW0f7L0Hq8TyHXDn5T5r5GdJhcDZ7uBGGmDqLRkSG4Ig.JPEG.ansem5%2FIMG_3467.JPG&type=sc960_832', likes: 298, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's22', name: '제주 성산일출봉', province: '제주특별자치도', city: '서귀포시', district: '성산읍', detailAddress: '일출로', desc: '제주를 대표하는 일출 명소. 세계자연유산으로도 지정됨.', tags: ['#일출','#제주','#세계유산'], lat: 33.4584, lng: 126.9426, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA4MTJfMTAg%2FMDAxNzIzNDM0MDQ5MTE0.dYU8K4kGzMpgwH3yfNkrq4YLNlPJ5XCZMKOYs3SkF1wg.bjPz73j_YcKV5nDZU5fZ6KgWkY8t9Zt10wNUYjAZ3jkg.JPEG%2FIMG_7821.JPG&type=sc960_832', likes: 534, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's23', name: '순천만 국가정원', province: '전라남도', city: '순천시', district: '국가정원1호길', detailAddress: '국가정원', desc: '사계절 다양한 꽃과 정원을 볼 수 있는 곳. 가족 단위 방문 추천.', tags: ['#정원','#꽃','#순천'], lat: 34.9182, lng: 127.5013, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA1MTJfMjAy%2FMDAxNzE1NDU4NTU5MzU1.t0RmPXjTUgz5QdKVVIK3dFPYJqYxdH8-e1h7zSM-f8Qg.hnRJLvKHxvJqANKbVJQgZmhCq9QI5VeLSx4l4GW-xJQg.JPEG%2FIMG_8234.JPG&type=sc960_832', likes: 412, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's24', name: '서울숲', province: '서울특별시', city: '성동구', district: '성수동', detailAddress: '뚝섬로', desc: '도심 속 자연을 느낄 수 있는 공원. 가을 단풍이 특히 아름다움.', tags: ['#공원','#자연','#서울'], lat: 37.5446, lng: 127.0377, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzExMDRfMjky%2FMDAxNjk5MDQyOTg1MzM3.eSVNMJYmJzH8ALU5f7Vb0TRv0gPf5NxiZU_a7hcRKKgg.r_lsqm9kKxr-DI1b-1yIpxPJEXn6S6vf41LCl8iJ3Osg.JPEG.dnfka2000%2FIMG_2567.JPG&type=sc960_832', likes: 267, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's25', name: '부산 감리교회', province: '부산광역시', city: '중구', district: '대청동', detailAddress: '중구로', desc: '아름다운 고딕 건축의 교회. 결혼식 사진 촬영지로 인기.', tags: ['#교회','#건축','#부산'], lat: 35.0994, lng: 129.0334, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA0MzBfMjEx%2FMDAxNjgyODI3MTA2Mjkw.6tFN-1lv0NqUcMREPbOKiUOzmvTM-Jk5T1_i93pqPd0g.s8U7_TM1wPXSELxgJcpvY0n2AXYcS0j9bzhCpxDMJcog.JPEG.love_hs83%2FIMG_3301.JPG&type=sc960_832', likes: 156, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's26', name: '울릉도 독도', province: '경상북도', city: '울릉군', district: '울릉읍', detailAddress: '독도리', desc: '대한민국 동쪽 끝 섬. 투명한 바닷물과 기암괴석이 장관.', tags: ['#섬','#독도','#울릉도'], lat: 37.2415, lng: 131.8666, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MjRfMjk5%2FMDAxNjg3NTc3MTM4NzYy.5j8Z1cQG-YxxuKQzU2v6AjqM-KQhO-P5jj3EkLqY_kkg.p4CcZzTdZXgzMlMXHRo6BVBTzxLSLXQMg5l6b-MpSR4g.JPEG.joo_pang%2FIMG_4893.JPG&type=sc960_832', likes: 387, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's27', name: '안동 하회마을', province: '경상북도', city: '안동시', district: '풍천면', detailAddress: '하회종가길', desc: '전통 한옥이 보존된 세계문화유산. 탈춤 공연도 관람 가능.', tags: ['#한옥','#전통','#안동'], lat: 36.5390, lng: 128.5168, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA0MTRfMTUx%2FMDAxNzEzMDc2NDU1NTAy.XY_G4RV5KSXexI0Dg8Iw2qzOr7K7lU7oRgH77pxRqWkg.vSP9CFBXZoNzjbxCqYRSzAKCUkl11_u_Ds0mQ8BdLHYg.JPEG%2FIMG_8721.JPG&type=sc960_832', likes: 312, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's28', name: '평창 대관령 양떼목장', province: '강원특별자치도', city: '평창군', district: '대관령면', detailAddress: '양떼목장길', desc: '넓은 초원에서 양들과 함께하는 목가적인 풍경. SNS 인기 스팟.', tags: ['#목장','#양','#평창'], lat: 37.7097, lng: 128.7434, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MTdfMTUw%2FMDAxNjk0OTE0ODQxMzAx.h0pWk9f3lTQV6v5BgYf8Y5G1kkPR3CepzBQdJeGnWe4g.L0Mj2fzAKTX6rKFLOg_d_9Ws5l4TQx2AUKmS1KWjbYgg.JPEG.minwoo8215%2FIMG_5621.JPG&type=sc960_832', likes: 445, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's29', name: '제주 카멜리아힐', province: '제주특별자치도', city: '서귀포시', district: '안덕면', detailAddress: '병악로', desc: '동백꽃과 다양한 식물이 가득한 수목원. 겨울철 방문 추천.', tags: ['#수목원','#동백','#제주'], lat: 33.2894, lng: 126.3029, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDAxMjhfMjAx%2FMDAxNzA2NDExMjc4NDE4.gEF1jf7qWLCO0Riy1k-bOZOFoQcLTvNDgIXjPBhV_Zgg.xNMbvLY0pz1bLnsMdLZN8_1m0c4YQiOpYxEcLvgLT0Mg.JPEG%2FIMG_9234.JPG&type=sc960_832', likes: 289, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's30', name: '포항 호미곶', province: '경상북도', city: '포항시', district: '남구 동해면', detailAddress: '호미곶면', desc: '한반도 최동단 일출 명소. 상생의 손 조형물이 유명.', tags: ['#일출','#바다','#포항'], lat: 36.0769, lng: 129.5653, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzAxMDFfMTg2%2FMDAxNjcyNTUzNDkzODQw.hXqWv4OUlQu8DG7e0iVpHNyZ1qCwmT8yUfr8T7jAkrQg.g-NLYOVlEtLX6PGYUUI7uH6-BVvQW1oMVG2rFr9m5aAg.JPEG.sksmsdyd3318%2FIMG_6781.JPG&type=sc960_832', likes: 378, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's31', name: '홍대 벽화거리', province: '서울특별시', city: '마포구', district: '서교동', detailAddress: '홍익로', desc: '젊은 감성의 예술거리. 트렌디한 벽화와 카페가 가득.', tags: ['#벽화','#홍대','#거리'], lat: 37.5563, lng: 126.9236, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MDhfMjQ1%2FMDAxNjg4Nzg5MjM0NTY3.xNQl7JGH8Gv5yKDYU7z9PdmPCH_6VE_xLmWnPJvKGXYg.8YPjQT9KvFMkHKBdX_G7BPfJKHPnZMqBRuQs_4fLEYkg.JPEG.ddang_2%2FIMG_1234.JPG&type=sc960_832', likes: 234, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's32', name: '이화동 벽화마을', province: '서울특별시', city: '종로구', district: '이화동', detailAddress: '이화동길', desc: '계단식 마을에 그려진 다양한 벽화. 낙산 전망도 좋음.', tags: ['#벽화','#마을','#계단'], lat: 37.5820, lng: 127.0059, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA1MTVfMTc5%2FMDAxNjg0MTI1MDQ3Mjcy.Rw7zJtQFGhBDPQzHKRcUPJX8ZVxQ8vJg9l3nLbQz8cEg.hRyVJFq6YqPQBxqKmQgGKJQpJFDCqPzJKGvQzJQqKz4g.JPEG.love_pic%2FIMG_5678.JPG&type=sc960_832', likes: 198, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's33', name: '을왕리 해수욕장', province: '인천광역시', city: '중구', district: '을왕동', detailAddress: '을왕리해변로', desc: '인천 공항 근처의 아름다운 서해 해변. 일몰이 장관.', tags: ['#해변','#일몰','#인천'], lat: 37.4463, lng: 126.3810, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MjBfMjc1%2FMDAxNjkyNTEwNzYzMjE0.GjQpJFq6YqPQzJKGvQzJQqKz4gRw7zJtQFGhBDPQzHKRcg.BxqKmQgGKJQpJFDCqPzJKGvQzJQqKz4ghRyVJFq6YqPQg.JPEG.sea_lover%2FIMG_7890.JPG&type=sc960_832', likes: 267, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's34', name: '수원 화성', province: '경기도', city: '수원시', district: '팔달구', detailAddress: '정조로', desc: '유네스코 세계문화유산. 성곽 위에서 보는 전망이 멋짐.', tags: ['#성곽','#문화재','#수원'], lat: 37.2869, lng: 127.0154, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MjVfMjIw%2FMDAxNjk1NjI4NDkzMjE1.JFq6YqPQzJKGvQzJQqKz4gRw7zJtQFGhBDPQzHKRcUPJg.hRyVJFq6YqPQBxqKmQgGKJQpJFDCqPzJKGvQzJQqKz4g.JPEG.history_fan%2FIMG_3456.JPG&type=sc960_832', likes: 312, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's35', name: '용인 에버랜드', province: '경기도', city: '용인시', district: '처인구', detailAddress: '에버랜드로', desc: '사계절 다양한 꽃과 테마. 봄 튤립축제가 특히 유명.', tags: ['#테마파크','#꽃','#용인'], lat: 37.2939, lng: 127.2022, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA0MTBfMjg5%2FMDAxNjgxMDk4NzY1NDMy.YqPQzJKGvQzJQqKz4gRw7zJtQFGhBDPQzHKRcUPJX8Vg.GKJQpJFDCqPzJKGvQzJQqKz4ghRyVJFq6YqPQBxqKmQgg.JPEG.everland_love%2FIMG_9012.JPG&type=sc960_832', likes: 478, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's36', name: '청평 제이드가든', province: '경기도', city: '가평군', district: '상면', detailAddress: '제이드가든로', desc: '유럽풍 정원. 드라마 촬영지로도 유명한 포토스팟.', tags: ['#정원','#유럽풍','#가평'], lat: 37.7466, lng: 127.4355, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MTJfMTU2%2FMDAxNjg2NTI4OTc2NTQz.QzJKGvQzJQqKz4gRw7zJtQFGhBDPQzHKRcUPJX8VxQ8Vg.FDCqPzJKGvQzJQqKz4ghRyVJFq6YqPQBxqKmQgGKJQpJg.JPEG.garden_pic%2FIMG_6543.JPG&type=sc960_832', likes: 356, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's37', name: '강화도 석모도', province: '인천광역시', city: '강화군', district: '삼산면', detailAddress: '석모도', desc: '수도권에서 가까운 섬. 보문사와 해변이 아름다움.', tags: ['#섬','#바다','#강화'], lat: 37.7142, lng: 126.4223, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MjhfOTQg%2FMDAxNjkwNTM0ODc2NTQz.GvQzJQqKz4gRw7zJtQFGhBDPQzHKRcUPJX8VxQ8VjQpJg.qPzJKGvQzJQqKz4ghRyVJFq6YqPQBxqKmQgGKJQpJFDCg.JPEG.island_trip%2FIMG_2109.JPG&type=sc960_832', likes: 223, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's38', name: '파주 헤이리 예술마을', province: '경기도', city: '파주시', district: '탄현면', detailAddress: '헤이리마을길', desc: '독특한 건축물과 갤러리가 가득한 예술마을. 카페 투어 추천.', tags: ['#예술','#마을','#파주'], lat: 37.7778, lng: 126.6944, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MDNfMjM0%2FMDAxNjkzNzI4OTc2NTQz.JQqKz4gRw7zJtQFGhBDPQzHKRcUPJX8VxQ8VjQpJFDCqg.GvQzJQqKz4ghRyVJFq6YqPQBxqKmQgGKJQpJFDCqPzJKg.JPEG.art_lover%2FIMG_8765.JPG&type=sc960_832', likes: 289, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's39', name: '양평 두물머리', province: '경기도', city: '양평군', district: '양서면', detailAddress: '두물머리길', desc: '물안개가 유명한 일출 명소. 새벽 촬영이 최고.', tags: ['#일출','#물안개','#양평'], lat: 37.5501, lng: 127.3152, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA1MjBfMjAw%2FMDAxNjg0NTY3ODc2NTQz.Kz4gRw7zJtQFGhBDPQzHKRcUPJX8VxQ8VjQpJFDCqPzJKg.QzJQqKz4ghRyVJFq6YqPQBxqKmQgGKJQpJFDCqPzJKGvg.JPEG.sunrise_photo%2FIMG_4321.JPG&type=sc960_832', likes: 334, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's40', name: '설악산 비룡폭포', province: '강원특별자치도', city: '속초시', district: '설악동', detailAddress: '비룡폭포길', desc: '웅장한 폭포와 계곡. 여름철 시원한 포토스팟.', tags: ['#폭포','#산','#설악'], lat: 38.1620, lng: 128.4650, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MDVfMTU2%2FMDAxNjkxMjM0ODc2NTQz.gRw7zJtQFGhBDPQzHKRcUPJX8VxQ8VjQpJFDCqPzJKGvQg.JQqKz4ghRyVJFq6YqPQBxqKmQgGKJQpJFDCqPzJKGvQzg.JPEG.mountain_pic%2FIMG_7654.JPG&type=sc960_832', likes: 412, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's41', name: '강릉 커피거리', province: '강원특별자치도', city: '강릉시', district: '안현동', detailAddress: '창해로', desc: '바다를 보며 커피를 즐길 수 있는 거리. 카페 투어 명소.', tags: ['#커피','#바다','#강릉'], lat: 37.7879, lng: 128.9405, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MTVfNDUg%2FMDAxNjg5Mzk4NzY1NDMy.w7zJtQFGhBDPQzHKRcUPJX8VxQ8VjQpJFDCqPzJKGvQzJg.z4ghRyVJFq6YqPQBxqKmQgGKJQpJFDCqPzJKGvQzJQqKg.JPEG.coffee_trip%2FIMG_5432.JPG&type=sc960_832', likes: 367, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's42', name: '양양 서피비치', province: '강원특별자치도', city: '양양군', district: '현남면', detailAddress: '서핑로', desc: '서핑의 성지. 액티비티와 일몰 촬영 모두 즐길 수 있음.', tags: ['#서핑','#해변','#양양'], lat: 38.0674, lng: 128.7351, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MjBfMjM0%2FMDAxNjg3MjM0ODc2NTQz.zJtQFGhBDPQzHKRcUPJX8VxQ8VjQpJFDCqPzJKGvQzJQqg.RyVJFq6YqPQBxqKmQgGKJQpJFDCqPzJKGvQzJQqKz4ghg.JPEG.surfing_life%2FIMG_9876.JPG&type=sc960_832', likes: 445, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's43', name: '춘천 소양강 스카이워크', province: '강원특별자치도', city: '춘천시', district: '신북읍', detailAddress: '소양강로', desc: '호수 위를 걷는 듯한 투명 전망대. 짜릿한 경험과 사진 모두 가능.', tags: ['#전망대','#호수','#춘천'], lat: 37.8973, lng: 127.7184, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MTBfMjAw%2FMDAxNjk0MzQ4NzY1NDMy.FGhBDPQzHKRcUPJX8VxQ8VjQpJFDCqPzJKGvQzJQqKz4gg.VJFq6YqPQBxqKmQgGKJQpJFDCqPzJKGvQzJQqKz4ghRyg.JPEG.skywalk_fan%2FIMG_6543.JPG&type=sc960_832', likes: 389, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's44', name: '평창 삼양목장', province: '강원특별자치도', city: '평창군', district: '대관령면', detailAddress: '삼양목장길', desc: '드넓은 초원과 풍력발전기가 있는 목장. 드라이브 코스로도 유명.', tags: ['#목장','#초원','#평창'], lat: 37.6973, lng: 128.7621, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MjVfMjg5%2FMDAxNjkwMjg3NjU0MzIx.BDPQzHKRcUPJX8VxQ8VjQpJFDCqPzJKGvQzJQqKz4gRw7g.q6YqPQBxqKmQgGKJQpJFDCqPzJKGvQzJQqKz4ghRyVJFg.JPEG.ranch_trip%2FIMG_3210.JPG&type=sc960_832', likes: 456, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's45', name: '충주호 수상레저', province: '충청북도', city: '충주시', district: '종민동', detailAddress: '충주호수길', desc: '내륙의 바다 충주호. 케이블카와 수상레저를 함께 즐길 수 있음.', tags: ['#호수','#레저','#충주'], lat: 37.0081, lng: 127.9885, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MTVfMTA1%2FMDAxNjkyMDk4NzY1NDMy.QzHKRcUPJX8VxQ8VjQpJFDCqPzJKGvQzJQqKz4gRw7zJtg.YqPQBxqKmQgGKJQpJFDCqPzJKGvQzJQqKz4ghRyVJFq6g.JPEG.lake_life%2FIMG_5678.JPG&type=sc960_832', likes: 298, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's46', name: '단양 도담삼봉', province: '충청북도', city: '단양군', district: '매포읍', detailAddress: '도담삼봉로', desc: '남한강 위에 솟은 세 개의 봉우리. 한국의 계림으로 불림.', tags: ['#봉우리','#강','#단양'], lat: 36.9949, lng: 128.3429, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MjBfMTEw%2FMDAxNjk1MjM0ODc2NTQz.RcUPJX8VxQ8VjQpJFDCqPzJKGvQzJQqKz4gRw7zJtQFGhg.xqKmQgGKJQpJFDCqPzJKGvQzJQqKz4ghRyVJFq6YqPQBg.JPEG.danyang_pic%2FIMG_8901.JPG&type=sc960_832', likes: 345, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's47', name: '세종호수공원', province: '세종특별자치시', city: '세종시', district: '연기면', detailAddress: '호수공원로', desc: '신도시 중심의 인공호수. 산책로와 분수쇼가 아름다움.', tags: ['#호수','#공원','#세종'], lat: 36.5022, lng: 127.2518, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MjVfMjU2%2FMDAxNjg3NjU0MzIxMjM0.PJX8VxQ8VjQpJFDCqPzJKGvQzJQqKz4gRw7zJtQFGhBDQg.mQgGKJQpJFDCqPzJKGvQzJQqKz4ghRyVJFq6YqPQBxqKg.JPEG.sejong_trip%2FIMG_4567.JPG&type=sc960_832', likes: 267, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's48', name: '대전 한밭수목원', province: '대전광역시', city: '서구', district: '둔산동', detailAddress: '대덕대로', desc: '도심 속 녹지공간. 계절별 다양한 식물 감상 가능.', tags: ['#수목원','#공원','#대전'], lat: 36.3662, lng: 127.3898, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MzBfMTI4%2FMDAxNjkwNzY1NDMyMTIz.VxQ8VjQpJFDCqPzJKGvQzJQqKz4gRw7zJtQFGhBDPQzHKg.GKJQpJFDCqPzJKGvQzJQqKz4ghRyVJFq6YqPQBxqKmQgg.JPEG.garden_daejeon%2FIMG_7890.JPG&type=sc960_832', likes: 234, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's49', name: '부여 궁남지', province: '충청남도', city: '부여군', district: '부여읍', detailAddress: '궁남로', desc: '백제 시대 연못. 여름 연꽃이 장관. 역사와 자연이 어우러짐.', tags: ['#연못','#연꽃','#백제'], lat: 36.2696, lng: 126.9199, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MjVfMjQ1%2FMDAxNjkyOTg3NjU0MzIx.Q8VjQpJFDCqPzJKGvQzJQqKz4gRw7zJtQFGhBDPQzHKRcUg.QpJFDCqPzJKGvQzJQqKz4ghRyVJFq6YqPQBxqKmQgGKJg.JPEG.history_nature%2FIMG_6543.JPG&type=sc960_832', likes: 312, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's50', name: '공주 공산성', province: '충청남도', city: '공주시', district: '웅진동', detailAddress: '공산성로', desc: '백제 도읍지의 성곽. 금강변 산책로와 야경이 아름다움.', tags: ['#성곽','#백제','#공주'], lat: 36.4647, lng: 127.1244, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MDVfMTQ1%2FMDAxNjkzODc2NTQzMjEy.JFDCqPzJKGvQzJQqKz4gRw7zJtQFGhBDPQzHKRcUPJX8Vg.FDCqPzJKGvQzJQqKz4ghRyVJFq6YqPQBxqKmQgGKJQpJg.JPEG.gongju_tour%2FIMG_9012.JPG&type=sc960_832', likes: 289, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's51', name: '제주 우도', province: '제주특별자치도', city: '제주시', district: '우도면', detailAddress: '우도', desc: '땅콩아이스크림으로 유명한 섬. 에메랄드빛 바다와 해안 절경.', tags: ['#섬','#바다','#제주'], lat: 33.5004, lng: 126.9540, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MTBfMTU2%2FMDAxNjg5MDEyMzQ1Njc4.abc123def456ghi789jkl012mno345pqr678stu901vwxg.yz234abc567def890ghi123jkl456mno789pqr012stu345g.JPEG.udo_trip%2FIMG_1234.JPG&type=sc960_832', likes: 523, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's52', name: '제주 협재 해수욕장', province: '제주특별자치도', city: '제주시', district: '한림읍', detailAddress: '협재리', desc: '에메랄드빛 바다와 흰 모래사장. 비양도가 보이는 절경.', tags: ['#해변','#제주','#투명'], lat: 33.3941, lng: 126.2395, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MTVfMjAw%2FMDAxNjg2ODEyMzQ1Njc4.def456ghi789jkl012mno345pqr678stu901vwx234abcg.abc567def890ghi123jkl456mno789pqr012stu345yz678g.JPEG.hyeopjae_sea%2FIMG_5678.JPG&type=sc960_832', likes: 467, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's53', name: '제주 한라산 백록담', province: '제주특별자치도', city: '제주시', district: '해안동', detailAddress: '한라산', desc: '제주 최고봉 정상의 화산호. 등산 코스로 인기.', tags: ['#산','#등산','#제주'], lat: 33.3616, lng: 126.5292, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MjBfMTIz%2FMDAxNjkyNTEyMzQ1Njc4.ghi789jkl012mno345pqr678stu901vwx234abc567defg.jkl456mno789pqr012stu345yz678abc901def234ghi567g.JPEG.hallasan_trip%2FIMG_9012.JPG&type=sc960_832', likes: 589, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's54', name: '제주 주상절리대', province: '제주특별자치도', city: '서귀포시', district: '중문동', detailAddress: '이어도로', desc: '화산암이 만든 기둥 모양의 절벽. 파도가 장관.', tags: ['#절벽','#제주','#바다'], lat: 33.2384, lng: 126.4246, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MjVfMjM0%2FMDAxNjk1NjEyMzQ1Njc4.mno345pqr678stu901vwx234abc567def890ghi123jklg.pqr012stu345yz678abc901def234ghi567jkl890mno123g.JPEG.jusang_view%2FIMG_3456.JPG&type=sc960_832', likes: 445, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's55', name: '제주 성읍민속마을', province: '제주특별자치도', city: '서귀포시', district: '표선면', detailAddress: '성읍리', desc: '옛 제주 마을의 모습이 보존된 곳. 전통 초가집과 돌담길.', tags: ['#전통','#마을','#제주'], lat: 33.3933, lng: 126.8000, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA1MzBfMTEx%2FMDAxNjg1NDEyMzQ1Njc4.stu901vwx234abc567def890ghi123jkl456mno789pqrg.abc901def234ghi567jkl890mno123pqr456stu789vwx012g.JPEG.seongeup_photo%2FIMG_6789.JPG&type=sc960_832', likes: 356, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's56', name: '울산 대왕암공원', province: '울산광역시', city: '동구', district: '일산동', detailAddress: '대왕암길', desc: '동해안 일출 명소. 기암괴석과 파도가 어우러진 경관.', tags: ['#일출','#바다','#울산'], lat: 35.5041, lng: 129.4346, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MDVfMjQ1%2FMDAxNjg4NTEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def234ghi567jkl890mno123pqr456stu789vwx012abc345g.JPEG.daewangam_sea%2FIMG_2345.JPG&type=sc960_832', likes: 378, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's57', name: '경주 첨성대', province: '경상북도', city: '경주시', district: '인왕동', detailAddress: '첨성로', desc: '신라시대 천문대. 야간 조명이 아름다운 역사 유적.', tags: ['#역사','#문화재','#경주'], lat: 35.8347, lng: 129.2191, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MTBfMTIz%2FMDAxNjkxNjEyMzQ1Njc4.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl890mno123pqr456stu789vwx012abc345def678ghi901g.JPEG.cheomseong_night%2FIMG_5678.JPG&type=sc960_832', likes: 423, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's58', name: '경주 동궁과 월지', province: '경상북도', city: '경주시', district: '인왕동', detailAddress: '원화로', desc: '신라 왕궁의 별궁터. 야경이 특히 아름다운 연못.', tags: ['#야경','#연못','#경주'], lat: 35.8353, lng: 129.2247, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MTVfMjM0%2FMDAxNjk0NzEyMzQ1Njc4.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr456stu789vwx012abc345def678ghi901jkl234mno567g.JPEG.wolji_night%2FIMG_8901.JPG&type=sc960_832', likes: 512, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's59', name: '포항 구룡포 일본인가옥거리', province: '경상북도', city: '포항시', district: '남구 구룡포읍', detailAddress: '구룡포길', desc: '일제강점기 가옥이 보존된 거리. 독특한 건축미.', tags: ['#역사','#거리','#포항'], lat: 35.9908, lng: 129.5665, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MjBfMTEx%2FMDAxNjg3MjEyMzQ1Njc4.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc345def678ghi901jkl234mno567pqr890stu123vwx456g.JPEG.guryongpo_old%2FIMG_1234.JPG&type=sc960_832', likes: 289, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's60', name: '안동 월영교', province: '경상북도', city: '안동시', district: '상아동', detailAddress: '월영교길', desc: '한국에서 가장 긴 목책 다리. 야경이 아름다움.', tags: ['#다리','#야경','#안동'], lat: 36.5684, lng: 128.7291, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MjVfMjAw%2FMDAxNjkwMjEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def678ghi901jkl234mno567pqr890stu123vwx456abc789g.JPEG.wolyeong_bridge%2FIMG_5678.JPG&type=sc960_832', likes: 367, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's61', name: '영주 부석사', province: '경상북도', city: '영주시', district: '부석면', detailAddress: '부석사로', desc: '산 중�턱에 자리한 고찰. 무량수전이 유명.', tags: ['#사찰','#문화재','#영주'], lat: 36.9994, lng: 128.6825, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MzBfMTIz%2FMDAxNjkzMzEyMzQ1Njc4.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl234mno567pqr890stu123vwx456abc789def012ghi345g.JPEG.buseoksa_temple%2FIMG_9012.JPG&type=sc960_832', likes: 445, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's62', name: '통영 케이블카', province: '경상남도', city: '통영시', district: '발개동', detailAddress: '케이블카로', desc: '한려수도가 한눈에 보이는 케이블카. 정상 전망대 필수.', tags: ['#케이블카','#전망','#통영'], lat: 34.8543, lng: 128.4357, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA1MTVfMjM0%2FMDAxNjg0MTEyMzQ1Njc4.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr890stu123vwx456abc789def012ghi345jkl678mno901g.JPEG.tongyeong_cable%2FIMG_3456.JPG&type=sc960_832', likes: 498, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's63', name: '거제 바람의 언덕', province: '경상남도', city: '거제시', district: '남부면', detailAddress: '갈곶리', desc: '드라마 촬영지로 유명. 바다와 풍차가 어우러진 전망.', tags: ['#전망','#바다','#거제'], lat: 34.7632, lng: 128.6851, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MjVfMTEx%2FMDAxNjg3NjEyMzQ1Njc4.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc789def012ghi345jkl678mno901pqr234stu567vwx890g.JPEG.wind_hill%2FIMG_6789.JPG&type=sc960_832', likes: 534, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's64', name: '창원 진해 군항제', province: '경상남도', city: '창원시', district: '진해구', detailAddress: '중원로', desc: '봄 벚꽃 축제로 유명. 벚꽃 터널이 장관.', tags: ['#벚꽃','#축제','#진해'], lat: 35.1496, lng: 128.6759, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA0MDVfMjQ1%2FMDAxNjgwNjEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def012ghi345jkl678mno901pqr234stu567vwx890abc123g.JPEG.jinhae_cherry%2FIMG_2345.JPG&type=sc960_832', likes: 678, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's65', name: '남해 독일마을', province: '경상남도', city: '남해군', district: '삼동면', detailAddress: '독일마을길', desc: '독일풍 건축물이 모인 마을. 이국적인 분위기.', tags: ['#마을','#이국적','#남해'], lat: 34.8307, lng: 127.9008, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MTBfMTIz%2FMDAxNjg5MDEyMzQ1Njc4.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl678mno901pqr234stu567vwx890abc123def456ghi789g.JPEG.german_village%2FIMG_5678.JPG&type=sc960_832', likes: 389, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's66', name: '하동 쌍계사', province: '경상남도', city: '하동군', district: '화개면', detailAddress: '쌍계사길', desc: '지리산 자락의 고찰. 벚꽃과 단풍이 아름다움.', tags: ['#사찰','#자연','#하동'], lat: 35.2178, lng: 127.7178, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MjBfMjM0%2FMDAxNjkyNTEyMzQ1Njc4.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr234stu567vwx890abc123def456ghi789jkl012mno345g.JPEG.ssanggyesa_temple%2FIMG_9012.JPG&type=sc960_832', likes: 412, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's67', name: '담양 죽녹원', province: '전라남도', city: '담양군', district: '담양읍', detailAddress: '죽녹원로', desc: '대나무 숲길. 시원한 여름 피서지로 인기.', tags: ['#대나무','#숲','#담양'], lat: 35.3217, lng: 126.9876, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA1MjVfMTEx%2FMDAxNjg1MDEyMzQ1Njc4.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc123def456ghi789jkl012mno345pqr678stu901vwx234g.JPEG.juknokwon_forest%2FIMG_1234.JPG&type=sc960_832', likes: 467, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's68', name: '보성 녹차밭', province: '전라남도', city: '보성군', district: '보성읍', detailAddress: '녹차로', desc: '초록 물결의 차밭. 드라마 촬영지로도 유명.', tags: ['#녹차','#밭','#보성'], lat: 34.7676, lng: 127.0799, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MzBfMjQ1%2FMDAxNjg4MDEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def456ghi789jkl012mno345pqr678stu901vwx234abc567g.JPEG.boseong_tea%2FIMG_5678.JPG&type=sc960_832', likes: 589, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's69', name: '목포 갓바위', province: '전라남도', city: '목포시', district: '용해동', detailAddress: '갓바위로', desc: '삿갓을 쓴 형상의 바위. 다리로 연결되어 있음.', tags: ['#바위','#바다','#목포'], lat: 34.7566, lng: 126.3801, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MDVfMTIz%2FMDAxNjg4NTEyMzQ1Njc4.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl012mno345pqr678stu901vwx234abc567def890ghi123g.JPEG.gatbawi_rock%2FIMG_9012.JPG&type=sc960_832', likes: 345, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's70', name: '완도 청산도', province: '전라남도', city: '완도군', district: '청산면', detailAddress: '청산도', desc: '슬로시티로 지정된 섬. 영화 서편제 촬영지.', tags: ['#섬','#슬로시티','#완도'], lat: 34.1419, lng: 126.9216, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MTBfMjM0%2FMDAxNjkxNjEyMzQ1Njc4.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr678stu901vwx234abc567def890ghi123jkl456mno789g.JPEG.cheongsando_island%2FIMG_3456.JPG&type=sc960_832', likes: 423, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's71', name: '군산 시간여행', province: '전북특별자치도', city: '군산시', district: '장미동', detailAddress: '해망로', desc: '근대 건축물이 보존된 거리. 레트로 감성 포토존.', tags: ['#근대','#레트로','#군산'], lat: 35.9784, lng: 126.7048, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MTVfMTEx%2FMDAxNjk0NzEyMzQ1Njc4.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc567def890ghi123jkl456mno789pqr012stu345vwx678g.JPEG.gunsan_retro%2FIMG_6789.JPG&type=sc960_832', likes: 456, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's72', name: '전주 덕진공원', province: '전북특별자치도', city: '전주시', district: '덕진구', detailAddress: '덕진동', desc: '연꽃으로 유명한 도심 공원. 여름 야경이 아름다움.', tags: ['#공원','#연꽃','#전주'], lat: 35.8471, lng: 127.1244, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MjBfMjQ1%2FMDAxNjg3MjEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def890ghi123jkl456mno789pqr012stu345vwx678abc901g.JPEG.deokjin_park%2FIMG_2345.JPG&type=sc960_832', likes: 378, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's73', name: '부안 채석강', province: '전북특별자치도', city: '부안군', district: '변산면', detailAddress: '격포리', desc: '퇴적암 지층이 절경. 일몰 명소로 유명.', tags: ['#절벽','#일몰','#부안'], lat: 35.6295, lng: 126.5288, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MjVfMTIz%2FMDAxNjkwMjEyMzQ1Njc4.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl456mno789pqr012stu345vwx678abc901def234ghi567g.JPEG.chaeseokgang_cliff%2FIMG_5678.JPG&type=sc960_832', likes: 512, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's74', name: '고창 선운사', province: '전북특별자치도', city: '고창군', district: '아산면', detailAddress: '선운사로', desc: '동백꽃으로 유명한 사찰. 겨울철 방문 추천.', tags: ['#사찰','#동백','#고창'], lat: 35.4898, lng: 126.5843, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MzBfMjM0%2FMDAxNjkzMzEyMzQ1Njc4.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr012stu345vwx678abc901def234ghi567jkl890mno123g.JPEG.seonunsa_temple%2FIMG_9012.JPG&type=sc960_832', likes: 445, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's75', name: '익산 미륵사지', province: '전북특별자치도', city: '익산시', district: '금마면', detailAddress: '미륵사지로', desc: '백제 최대 사찰터. 석탑이 인상적.', tags: ['#역사','#문화재','#익산'], lat: 35.9901, lng: 126.9640, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA1MzBfMTEx%2FMDAxNjg1NDEyMzQ1Njc4.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc901def234ghi567jkl890mno123pqr456stu789vwx012g.JPEG.mireuksa_site%2FIMG_1234.JPG&type=sc960_832', likes: 367, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's76', name: '서천 국립생태원', province: '충청남도', city: '서천군', district: '마서면', detailAddress: '금강로', desc: '다양한 생태계를 체험. 가족 나들이 장소로 좋음.', tags: ['#생태','#체험','#서천'], lat: 36.0345, lng: 126.7238, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MTVfMjQ1%2FMDAxNjg2ODEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def234ghi567jkl890mno123pqr456stu789vwx012abc345g.JPEG.nie_seocheon%2FIMG_5678.JPG&type=sc960_832', likes: 398, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's77', name: '천안 독립기념관', province: '충청남도', city: '천안시', district: '동남구', detailAddress: '독립기념관로', desc: '대한민국 독립의 역사. 넓은 야외 광장과 전시관.', tags: ['#역사','#교육','#천안'], lat: 36.7809, lng: 127.2820, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MjBfMTIz%2FMDAxNjg5ODEyMzQ1Njc4.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl890mno123pqr456stu789vwx012abc345def678ghi901g.JPEG.independence_hall%2FIMG_9012.JPG&type=sc960_832', likes: 456, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's78', name: '아산 외암민속마을', province: '충청남도', city: '아산시', district: '송악면', detailAddress: '외암리', desc: '조선시대 양반마을 보존. 돌담길이 아름다움.', tags: ['#전통','#마을','#아산'], lat: 36.7734, lng: 127.0182, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MjVfMjM0%2FMDAxNjkyOTg3NjU0MzIx.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr456stu789vwx012abc345def678ghi901jkl234mno567g.JPEG.oeam_village%2FIMG_3456.JPG&type=sc960_832', likes: 334, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's79', name: '예산 수덕사', province: '충청남도', city: '예산군', district: '덕산면', detailAddress: '수덕사안길', desc: '백제시대 고찰. 대웅전이 국보로 지정.', tags: ['#사찰','#문화재','#예산'], lat: 36.6565, lng: 126.6257, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MzBfMTEx%2FMDAxNjk2MDEyMzQ1Njc4.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc345def678ghi901jkl234mno567pqr890stu123vwx456g.JPEG.sudeoksa_temple%2FIMG_6789.JPG&type=sc960_832', likes: 389, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's80', name: '괴산 산막이옛길', province: '충청북도', city: '괴산군', district: '칠성면', detailAddress: '산막이옛길', desc: '물길 따라 걷는 트레킹 코스. 신록과 단풍이 아름다움.', tags: ['#트레킹','#자연','#괴산'], lat: 36.7389, lng: 127.8632, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MDVfMjQ1%2FMDAxNjg2NDEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def678ghi901jkl234mno567pqr890stu123vwx456abc789g.JPEG.sanmaki_trail%2FIMG_2345.JPG&type=sc960_832', likes: 423, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's81', name: '제천 의림지', province: '충청북도', city: '제천시', district: '모산동', detailAddress: '의림대로', desc: '삼국시대 저수지. 연꽃과 버드나무가 운치를 더함.', tags: ['#연못','#역사','#제천'], lat: 37.1423, lng: 128.1943, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MTBfMTIz%2FMDAxNjg5MDEyMzQ1Njc4.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl234mno567pqr890stu123vwx456abc789def012ghi345g.JPEG.uirimji_pond%2FIMG_5678.JPG&type=sc960_832', likes: 367, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's82', name: '영동 난계국악축제장', province: '충청북도', city: '영동군', district: '영동읍', detailAddress: '난계로', desc: '국악의 성지. 가을 축제 시즌 방문 추천.', tags: ['#축제','#국악','#영동'], lat: 36.1751, lng: 127.7841, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MTVfMjM0%2FMDAxNjkyMDk4NzY1NDMy.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr890stu123vwx456abc789def012ghi345jkl678mno901g.JPEG.nangye_festival%2FIMG_9012.JPG&type=sc960_832', likes: 298, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's83', name: '음성 감곡 철길', province: '충청북도', city: '음성군', district: '감곡면', detailAddress: '철길길', desc: '폐철로를 활용한 산책로. SNS 인증샷 명소.', tags: ['#철길','#산책','#음성'], lat: 36.9894, lng: 127.5823, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MjBfMTEx%2FMDAxNjk1MjM0ODc2NTQz.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc789def012ghi345jkl678mno901pqr234stu567vwx890g.JPEG.railway_walk%2FIMG_1234.JPG&type=sc960_832', likes: 412, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's84', name: '청주 상당산성', province: '충청북도', city: '청주시', district: '상당구', detailAddress: '산성길', desc: '조선시대 산성. 성곽 따라 걷는 둘레길이 좋음.', tags: ['#성곽','#트레킹','#청주'], lat: 36.6422, lng: 127.4989, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MjVfMjQ1%2FMDAxNjg3NjEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def012ghi345jkl678mno901pqr234stu567vwx890abc123g.JPEG.sangdang_fortress%2FIMG_5678.JPG&type=sc960_832', likes: 356, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's85', name: '김포 애기봉', province: '경기도', city: '김포시', district: '하성면', detailAddress: '애기봉로', desc: '북한이 보이는 전망대. 평화의 상징.', tags: ['#전망대','#평화','#김포'], lat: 37.6576, lng: 126.5433, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MzBfMTIz%2FMDAxNjkwNzY1NDMyMTIz.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl678mno901pqr234stu567vwx890abc123def456ghi789g.JPEG.aegibong_view%2FIMG_9012.JPG&type=sc960_832', likes: 334, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's86', name: '이천 도자기마을', province: '경기도', city: '이천시', district: '신둔면', detailAddress: '경충대로', desc: '전통 도자기 체험. 도예 갤러리와 카페가 많음.', tags: ['#도자기','#체험','#이천'], lat: 37.2721, lng: 127.4351, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MDVfMjM0%2FMDAxNjkxMjM0ODc2NTQz.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr234stu567vwx890abc123def456ghi789jkl012mno345g.JPEG.icheon_pottery%2FIMG_3456.JPG&type=sc960_832', likes: 389, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's87', name: '연천 재인폭포', province: '경기도', city: '연천군', district: '연천읍', detailAddress: '재인폭포길', desc: '현무암 협곡 속 폭포. 여름 피서지로 인기.', tags: ['#폭포','#계곡','#연천'], lat: 38.1034, lng: 127.0755, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MTBfMTEx%2FMDAxNjk0MzQ4NzY1NDMy.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc123def456ghi789jkl012mno345pqr678stu901vwx234g.JPEG.jaein_waterfall%2FIMG_6789.JPG&type=sc960_832', likes: 423, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's88', name: '포천 아트밸리', province: '경기도', city: '포천시', district: '신북면', detailAddress: '아트밸리로', desc: '폐채석장을 활용한 예술공원. 천주호가 아름다움.', tags: ['#예술','#호수','#포천'], lat: 37.9642, lng: 127.3345, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MTBfMjQ1%2FMDAxNjg2NzEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def456ghi789jkl012mno345pqr678stu901vwx234abc567g.JPEG.artvalley_pocheon%2FIMG_2345.JPG&type=sc960_832', likes: 512, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's89', name: '남양주 물의정원', province: '경기도', city: '남양주시', district: '조안면', detailAddress: '북한강로', desc: '정원 카페와 전시관. 한강변 경치가 일품.', tags: ['#정원','#카페','#남양주'], lat: 37.6234, lng: 127.3456, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MTVfMTIz%2FMDAxNjg5Mzk4NzY1NDMy.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl012mno345pqr678stu901vwx234abc567def890ghi123g.JPEG.water_garden%2FIMG_5678.JPG&type=sc960_832', likes: 467, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's90', name: '화성 용주사', province: '경기도', city: '화성시', district: '송산동', detailAddress: '용주로', desc: '정조가 세운 사찰. 아름다운 단청과 정원.', tags: ['#사찰','#역사','#화성'], lat: 37.2499, lng: 127.0044, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MjBfMjM0%2FMDAxNjkyNTEyMzQ1Njc4.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr678stu901vwx234abc567def890ghi123jkl456mno789g.JPEG.yongjusa_temple%2FIMG_9012.JPG&type=sc960_832', likes: 398, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's91', name: '안성 팜랜드', province: '경기도', city: '안성시', district: '공도읍', detailAddress: '대신두길', desc: '동물 체험 농장. 가족 단위 방문객에게 인기.', tags: ['#농장','#체험','#안성'], lat: 37.0123, lng: 127.2789, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MjVfMTEx%2FMDAxNjk1NjEyMzQ1Njc4.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc567def890ghi123jkl456mno789pqr012stu345vwx678g.JPEG.farmland_anseong%2FIMG_1234.JPG&type=sc960_832', likes: 445, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's92', name: '오산 독산성', province: '경기도', city: '오산시', district: '지곶동', detailAddress: '독산성로', desc: '세마대가 유명한 산성. 역사 교육 장소.', tags: ['#성곽','#역사','#오산'], lat: 37.1567, lng: 127.0678, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MzBfMjQ1%2FMDAxNjg4MDEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def890ghi123jkl456mno789pqr012stu345vwx678abc901g.JPEG.doksan_fortress%2FIMG_5678.JPG&type=sc960_832', likes: 312, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's93', name: '평택 소사벌 전망대', province: '경기도', city: '평택시', district: '포승읍', detailAddress: '평택호길', desc: '평택호가 한눈에. 일몰 감상 명소.', tags: ['#전망대','#호수','#평택'], lat: 36.9876, lng: 126.8234, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MDVfMTIz%2FMDAxNjg4NTEyMzQ1Njc4.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl456mno789pqr012stu345vwx678abc901def234ghi567g.JPEG.sosabeol_view%2FIMG_9012.JPG&type=sc960_832', likes: 289, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's94', name: '양주 장흥 계곡', province: '경기도', city: '양주시', district: '장흥면', detailAddress: '계곡길', desc: '맑은 계곡과 숲길. 여름 물놀이 장소로 인기.', tags: ['#계곡','#물놀이','#양주'], lat: 37.8234, lng: 127.0567, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MTBfMjM0%2FMDAxNjkxNjEyMzQ1Njc4.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr012stu345vwx678abc901def234ghi567jkl890mno123g.JPEG.jangheung_valley%2FIMG_3456.JPG&type=sc960_832', likes: 378, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's95', name: '하남 스타필드', province: '경기도', city: '하남시', district: '신장동', detailAddress: '미사강변한강로', desc: '복합쇼핑몰 옥상정원. 도심 속 쉼터.', tags: ['#쇼핑몰','#정원','#하남'], lat: 37.5501, lng: 127.2234, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MTVfMTEx%2FMDAxNjk0NzEyMzQ1Njc4.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc901def234ghi567jkl890mno123pqr456stu789vwx012g.JPEG.starfield_hanam%2FIMG_6789.JPG&type=sc960_832', likes: 434, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's96', name: '광명 이케아', province: '경기도', city: '광명시', district: '일직동', detailAddress: '일직로', desc: '북유럽 스타일 가구점. SNS 인증샷 명소.', tags: ['#쇼핑','#인테리어','#광명'], lat: 37.4234, lng: 126.8765, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MjBfMjQ1%2FMDAxNjg3MjEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def234ghi567jkl890mno123pqr456stu789vwx012abc345g.JPEG.ikea_gwangmyeong%2FIMG_2345.JPG&type=sc960_832', likes: 401, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's97', name: '의왕 레일바이크', province: '경기도', city: '의왕시', district: '월암동', detailAddress: '철도박물관로', desc: '폐철로를 달리는 레일바이크. 가족 체험 활동.', tags: ['#레일바이크','#체험','#의왕'], lat: 37.3456, lng: 126.9678, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA3MjVfMTIz%2FMDAxNjkwMjEyMzQ1Njc4.ghi123jkl456mno789pqr012stu345yz678abc901def234g.jkl890mno123pqr456stu789vwx012abc345def678ghi901g.JPEG.railbike_uiwang%2FIMG_5678.JPG&type=sc960_832', likes: 456, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's98', name: '과천 서울대공원', province: '경기도', city: '과천시', district: '막계동', detailAddress: '대공원광장로', desc: '동물원과 식물원. 사계절 즐길 수 있는 공원.', tags: ['#동물원','#공원','#과천'], lat: 37.4289, lng: 127.0089, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MzBfMjM0%2FMDAxNjkzMzEyMzQ1Njc4.mno789pqr012stu345yz678abc901def234ghi567jkl890g.pqr456stu789vwx012abc345def678ghi901jkl234mno567g.JPEG.seoul_grandpark%2FIMG_9012.JPG&type=sc960_832', likes: 523, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's99', name: '시흥 오이도', province: '경기도', city: '시흥시', district: '정왕동', detailAddress: '오이도로', desc: '섬과 육지가 연결된 곳. 해산물 맛집이 많음.', tags: ['#해변','#맛집','#시흥'], lat: 37.3456, lng: 126.6789, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA1MjVfMTEx%2FMDAxNjg1MDEyMzQ1Njc4.stu345yz678abc901def234ghi567jkl890mno123pqr456g.abc345def678ghi901jkl234mno567pqr890stu123vwx456g.JPEG.oido_island%2FIMG_1234.JPG&type=sc960_832', likes: 389, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor },
    { id: 's100', name: '부천 아인스월드', province: '경기도', city: '부천시', district: '원미구', detailAddress: '조마루로', desc: '세계 건축물 미니어처 공원. 가족 나들이 장소.', tags: ['#테마파크','#건축','#부천'], lat: 37.4987, lng: 126.7823, img: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MzBfMjQ1%2FMDAxNjg4MDEyMzQ1Njc4.vwx234abc567def890ghi123jkl456mno789pqr012stu345g.def678ghi901jkl234mno567pqr890stu123vwx456abc789g.JPEG.aiins_world%2FIMG_5678.JPG&type=sc960_832', likes: 467, comments: [], liked: false, mapImg: '', authorId: 0, author: defaultAuthor }
  ];
  spotIdCounter = 101;
  console.log('📸 초기 포토스팟 데이터 로드 완료:', spots.length, '개');
};

console.log('🔧 추가 포토스팟 업데이트: 총 50개로 확장');

// 관리자 계정 초기화
const initializeAdmin = async () => {
  // 이미 관리자 계정이 있으면 생성하지 않음
  const existingAdmin = users.find(u => u.username === '1234');
  if (existingAdmin) {
    console.log('👑 관리자 계정 이미 존재함');
    return;
  }
  
  const adminPassword = await bcrypt.hash('cantata0', 10);
  users.push({
    id: 0,
    username: '1234',
    password: adminPassword,
    nickname: '관리자',
    isAdmin: true,
    createdAt: new Date().toISOString()
  });
  saveData();
  console.log('👑 관리자 계정 생성 완료 (ID: 1234)');
};

// 초기화 - 저장된 데이터가 있으면 로드, 없으면 초기 데이터 생성
if (!loadData()) {
  console.log('📦 초기 데이터 생성 중...');
  initializeData();
  saveData();
}
initializeAdmin();

// 간단한 문자열 해시 함수
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// === 사용자 인증 API ===

// GitHub OAuth 및 Codespaces 자동 로그인 기능 제거됨
// 일반 회원가입/로그인 시스템만 사용

// 관리자 로그인
app.post('/api/auth/admin', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    const admin = users.find(u => u.username === username && u.isAdmin === true);

    if (!admin) {
      return res.status(401).json({ error: '관리자 계정이 아닙니다.' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('👑 관리자 로그인:', admin.username);

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('관리자 로그인 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 회원가입
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    // 유효성 검사
    if (!username || !password || !nickname) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: '비밀번호는 최소 4자 이상이어야 합니다.' });
    }

    // 관리자 아이디 사용 금지
    if (username === '1234') {
      return res.status(400).json({ error: '사용할 수 없는 아이디입니다.' });
    }

    // 중복 확인
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: '이미 존재하는 사용자명입니다.' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      nickname,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    saveData();

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username, nickname: user.nickname },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname }
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 유효성 검사
    if (!username || !password) {
      return res.status(400).json({ error: '사용자명과 비밀번호를 입력해주세요.' });
    }

    // 사용자 찾기
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: '사용자명 또는 비밀번호가 잘못되었습니다.' });
    }

    // 비밀번호 확인
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '사용자명 또는 비밀번호가 잘못되었습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username, nickname: user.nickname },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname }
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 현재 사용자 정보
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// === 포토스팟 API ===

// 모든 포토스팟 조회
app.get('/api/spots', (req, res) => {
  // 토큰에서 현재 사용자 정보 추출 (선택적)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let currentUserId = null;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      currentUserId = decoded.id;
    } catch (err) {
      // 토큰이 유효하지 않으면 무시
    }
  }

  // 비밀번호 제외하고 작성자 정보 포함
  const spotsWithAuthor = spots.map(spot => {
    const author = users.find(u => u.id === spot.authorId);
    
    // 사용자별 좋아요 상태 확인
    const userLikes = spot.userLikes || [];
    const liked = currentUserId ? userLikes.includes(currentUserId) : false;
    
    return {
      ...spot,
      liked: liked,
      author: author ? { 
        id: author.id, 
        nickname: author.nickname,
        githubAvatar: author.githubAvatar 
      } : null
    };
  });
  res.json({ spots: spotsWithAuthor });
});

// 포토스팟 생성
app.post('/api/spots', authenticateToken, (req, res) => {
  try {
    const { name, province, city, district, detailAddress, desc, tags, lat, lng, img } = req.body;

    // 유효성 검사
    if (!name || !province || !city || !desc || !lat || !lng) {
      return res.status(400).json({ error: '필수 정보를 모두 입력해주세요.' });
    }

    // 새 포토스팟 생성
    const newSpot = {
      id: `s${spotIdCounter++}`,
      name,
      province,
      city,
      district: district || '',
      detailAddress: detailAddress || '',
      desc,
      tags: tags || [],
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      img: img || '',
      mapImg: `https://map.pstatic.net/staticmap/image?center=${lat},${lng}&level=16&w=600&h=400&markers=type:d|size:mid|pos:${lat}%20${lng}&format=png`,
      gallery: [],
      likes: 0,
      comments: [],
      liked: false,
      authorId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      address: '',
      placeName: ''
    };

    spots.push(newSpot);
    saveData();

    // 작성자 정보 포함하여 응답
    const author = users.find(u => u.id === req.user.id);
    res.json({
      success: true,
      spot: {
        ...newSpot,
        author: { id: author.id, nickname: author.nickname }
      }
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 이미지 추가
app.post('/api/spots/:id/gallery', authenticateToken, (req, res) => {
  try {
    const spotId = req.params.id;
    const { images } = req.body;
    const spot = spots.find(s => s.id === spotId);

    if (!spot) {
      return res.status(404).json({ error: '포토스팟을 찾을 수 없습니다.' });
    }

    if (!spot.gallery) {
      spot.gallery = [];
    }

    // 이미지 배열 추가
    if (Array.isArray(images)) {
      spot.gallery.push(...images);
    }

    spot.updatedAt = new Date().toISOString();
    saveData();

    res.json({ success: true, gallery: spot.gallery });
  } catch (error) {
    console.error('갤러리 추가 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 이미지 삭제
app.delete('/api/spots/:id/gallery/:index', authenticateToken, (req, res) => {
  try {
    const spotId = req.params.id;
    const imageIndex = parseInt(req.params.index);
    const spot = spots.find(s => s.id === spotId);

    if (!spot) {
      return res.status(404).json({ error: '포토스팟을 찾을 수 없습니다.' });
    }

    if (!spot.gallery || imageIndex < 0 || imageIndex >= spot.gallery.length) {
      return res.status(400).json({ error: '유효하지 않은 이미지 인덱스입니다.' });
    }

    spot.gallery.splice(imageIndex, 1);
    spot.updatedAt = new Date().toISOString();
    saveData();

    res.json({ success: true, gallery: spot.gallery });
  } catch (error) {
    console.error('갤러리 삭제 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 이미지 추가
app.post('/api/spots/:id/gallery', authenticateToken, (req, res) => {
  try {
    const spotId = req.params.id;
    const { images } = req.body;
    const spot = spots.find(s => s.id === spotId);

    if (!spot) {
      return res.status(404).json({ error: '포토스팟을 찾을 수 없습니다.' });
    }

    if (!spot.gallery) {
      spot.gallery = [];
    }

    // 이미지 배열 추가
    if (Array.isArray(images)) {
      spot.gallery.push(...images);
    }

    spot.updatedAt = new Date().toISOString();
    saveData();

    res.json({ success: true, gallery: spot.gallery });
  } catch (error) {
    console.error('갤러리 추가 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 이미지 삭제
app.delete('/api/spots/:id/gallery/:index', authenticateToken, (req, res) => {
  try {
    const spotId = req.params.id;
    const imageIndex = parseInt(req.params.index);
    const spot = spots.find(s => s.id === spotId);

    if (!spot) {
      return res.status(404).json({ error: '포토스팟을 찾을 수 없습니다.' });
    }

    if (!spot.gallery || imageIndex < 0 || imageIndex >= spot.gallery.length) {
      return res.status(400).json({ error: '유효하지 않은 이미지 인덱스입니다.' });
    }

    spot.gallery.splice(imageIndex, 1);
    spot.updatedAt = new Date().toISOString();
    saveData();

    res.json({ success: true, gallery: spot.gallery });
  } catch (error) {
    console.error('갤러리 삭제 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 포토스팟 수정
app.put('/api/spots/:id', authenticateToken, (req, res) => {
  try {
    const spotId = req.params.id;
    const spot = spots.find(s => s.id === spotId);

    if (!spot) {
      return res.status(404).json({ error: '포토스팟을 찾을 수 없습니다.' });
    }

    // 권한 확인: 작성자 또는 관리자만 삭제 가능
    if (spot.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: '삭제 권한이 없습니다. 본인이 작성한 포토스팟만 삭제할 수 있습니다.' });
    }

    // 수정 가능한 필드 업데이트
    const { name, province, city, district, detailAddress, desc, tags, lat, lng, img } = req.body;

    if (name) spot.name = name;
    if (province) spot.province = province;
    if (city) spot.city = city;
    if (district !== undefined) spot.district = district;
    if (detailAddress !== undefined) spot.detailAddress = detailAddress;
    if (desc) spot.desc = desc;
    if (tags) spot.tags = tags;
    if (lat) {
      spot.lat = parseFloat(lat);
      spot.mapImg = `https://map.pstatic.net/staticmap/image?center=${lat},${lng || spot.lng}&level=16&w=600&h=400&markers=type:d|size:mid|pos:${lat}%20${lng || spot.lng}&format=png`;
    }
    if (lng) {
      spot.lng = parseFloat(lng);
      spot.mapImg = `https://map.pstatic.net/staticmap/image?center=${lat || spot.lat},${lng}&level=16&w=600&h=400&markers=type:d|size:mid|pos:${lat || spot.lat}%20${lng}&format=png`;
    }
    if (img !== undefined) spot.img = img;

    spot.updatedAt = new Date().toISOString();
    saveData();

    // 작성자 정보 포함하여 응답
    const author = users.find(u => u.id === spot.authorId);
    res.json({
      success: true,
      spot: {
        ...spot,
        author: { id: author.id, nickname: author.nickname }
      }
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 포토스팟 삭제
app.delete('/api/spots/:id', authenticateToken, (req, res) => {
  try {
    const spotId = req.params.id;
    const spotIndex = spots.findIndex(s => s.id === spotId);

    if (spotIndex === -1) {
      return res.status(404).json({ error: '포토스팟을 찾을 수 없습니다.' });
    }

    // 권한 확인: 작성자만 삭제 가능
    if (spots[spotIndex].authorId !== req.user.id) {
      return res.status(403).json({ error: '삭제 권한이 없습니다. 본인이 작성한 포토스팟만 삭제할 수 있습니다.' });
    }

    spots.splice(spotIndex, 1);
    saveData();

    res.json({ success: true, message: '포토스팟이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 좋아요 토글
app.post('/api/spots/:id/like', authenticateToken, (req, res) => {
  try {
    const spotId = req.params.id;
    const spot = spots.find(s => s.id === spotId);

    if (!spot) {
      return res.status(404).json({ error: '포토스팟을 찾을 수 없습니다.' });
    }

    // 사용자별 좋아요 배열 초기화
    if (!spot.userLikes) {
      spot.userLikes = [];
    }

    const userId = req.user.id;
    const likeIndex = spot.userLikes.indexOf(userId);

    if (likeIndex === -1) {
      // 좋아요 추가
      spot.userLikes.push(userId);
      spot.likes = (spot.likes || 0) + 1;
    } else {
      // 좋아요 취소
      spot.userLikes.splice(likeIndex, 1);
      spot.likes = Math.max((spot.likes || 0) - 1, 0);
    }

    saveData();

    res.json({ 
      success: true, 
      likes: spot.likes,
      liked: likeIndex === -1
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 댓글 추가
app.post('/api/spots/:id/comments', authenticateToken, (req, res) => {
  try {
    const spotId = req.params.id;
    const { text } = req.body;
    const spot = spots.find(s => s.id === spotId);

    if (!spot) {
      return res.status(404).json({ error: '포토스팟을 찾을 수 없습니다.' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
    }

    // 작성자 정보 가져오기
    const author = users.find(u => u.id === req.user.id);

    const comment = {
      id: spot.comments.length + 1,
      text: text.trim(),
      authorId: req.user.id,
      nickname: req.user.nickname,
      githubAvatar: author?.githubAvatar,
      createdAt: new Date().toISOString()
    };

    spot.comments.push(comment);
    saveData();

    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 댓글 삭제
app.delete('/api/spots/:spotId/comments/:commentId', authenticateToken, (req, res) => {
  try {
    const spotId = req.params.spotId;
    const commentId = parseInt(req.params.commentId);
    const spot = spots.find(s => s.id === spotId);

    if (!spot) {
      return res.status(404).json({ error: '포토스팟을 찾을 수 없습니다.' });
    }

    const commentIndex = spot.comments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }

    // 권한 확인: 작성자 또는 관리자만 삭제 가능
    if (spot.comments[commentIndex].authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: '댓글을 삭제할 권한이 없습니다.' });
    }

    spot.comments.splice(commentIndex, 1);
    saveData();

    res.json({ success: true, message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 근처 숙박업소 검색 API
app.get('/api/nearby-accommodations', async (req, res) => {
  try {
    const { lat, lng, radius = 2000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: '위도와 경도가 필요합니다.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseInt(radius);

    // 숙박업소 카테고리로 검색 (호텔, 모텔, 펜션, 게스트하우스 등)
    const categories = [
      'AD5', // 숙박
    ];

    const kakaoApiKey = process.env.KAKAO_REST_API_KEY || 'YOUR_KAKAO_REST_API_KEY';
    
    // 카카오 로컬 API로 근처 숙박업소 검색
    try {
      const response = await axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
        headers: {
          'Authorization': `KakaoAK ${kakaoApiKey}`
        },
        params: {
          category_group_code: 'AD5',
          x: longitude,
          y: latitude,
          radius: searchRadius,
          sort: 'distance'
        }
      });

      const accommodations = response.data.documents.map(place => ({
        name: place.place_name,
        category: getCategoryName(place.category_name),
        address: place.address_name || place.road_address_name,
        distance: parseInt(place.distance),
        phone: place.phone,
        lat: place.y,
        lng: place.x,
        url: place.place_url
      }));

      res.json({ 
        success: true, 
        accommodations: accommodations.slice(0, 10) // 최대 10개
      });

    } catch (kakaoError) {
      // 카카오 API 실패 시 모의 데이터 반환
      console.log('⚠️ 카카오 API 사용 불가, 모의 데이터 반환');
      const mockAccommodations = generateMockAccommodations(latitude, longitude);
      res.json({ 
        success: true, 
        accommodations: mockAccommodations 
      });
    }

  } catch (error) {
    console.error('숙박업소 검색 오류:', error);
    res.status(500).json({ error: '검색 중 오류가 발생했습니다.' });
  }
});

// 카테고리 이름 변환
function getCategoryName(fullCategory) {
  if (fullCategory.includes('호텔')) return '🏨 호텔';
  if (fullCategory.includes('모텔')) return '🏩 모텔';
  if (fullCategory.includes('펜션')) return '🏡 펜션';
  if (fullCategory.includes('게스트하우스')) return '🏠 게스트하우스';
  if (fullCategory.includes('리조트')) return '🏖️ 리조트';
  return '🏨 숙박';
}

// 모의 숙박업소 데이터 생성
function generateMockAccommodations(lat, lng) {
  const types = ['호텔', '모텔', '펜션', '게스트하우스'];
  const names = [
    '그린', '블루', '선샤인', '문라이트', '스타', '오션', '마운틴', '레이크',
    '로즈', '가든', '스카이', '골든', '실버', '플라워', '리버', '힐'
  ];
  
  const accommodations = [];
  
  for (let i = 0; i < 8; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const distance = Math.floor(Math.random() * 1800) + 200; // 200m ~ 2000m
    
    // 거리에 따라 좌표 계산 (대략적)
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    
    accommodations.push({
      name: `${name}${type}`,
      category: getCategoryName(type),
      address: `근처 ${Math.floor(Math.random() * 500) + 1}번지`,
      distance: distance,
      phone: `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      lat: (lat + latOffset).toFixed(6),
      lng: (lng + lngOffset).toFixed(6)
    });
  }
  
  return accommodations.sort((a, b) => a.distance - b.distance);
}

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📸 포토스팟 커뮤니티 백엔드 서버`);
  console.log(`🌐 외부 접근 가능 (0.0.0.0:${PORT})`);
});
