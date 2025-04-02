# 💬 L-TALK

**실시간 소통과 관리 기능이 포함된 채팅 애플리케이션**

## 📌 프로젝트 소개

**L-TALK**은 1:1 및 그룹 채팅, 친구 관리, 이미지 업로드 등 다양한 기능을 갖춘 **JWT 기반 실시간 채팅 웹 앱**입니다. 유저 친화적인 UI와 강력한 실시간 기능을 제공합니다.

🚀 **배포 주소**: [https://l-talk.vercel.app](https://l-talk.vercel.app)

## ✨ 주요 기능

### 💬 채팅 기능

- 실시간 채팅 (Socket.IO 기반)
- 1:1 및 그룹 채팅방 생성
- 채팅방 내 유저 리스트 보기
- 채팅 중 이미지 업로드
- 키워드로 채팅방 검색 기능

### 🧑‍🤝‍🧑 친구 관리

- 친구 목록 보기
- 친구 추가 기능

### 🖼 프로필/방 이미지 관리

- 프로필 이미지 업로드 및 변경
- 채팅방 이미지 업로드 및 변경

### 🗂 채팅방 미디어/참가자 보기

- 채팅방에 업로드된 미디어 확인
- 참가자 목록 확인 페이지 제공

## 💠 기술 스택

### Frontend

- **React + Vite**
- **Tailwind CSS** (유틸리티 기반 스타일링)
- **JWT** (인증 및 세션 관리)
- **Socket.IO Client**

### Backend

- **Express.js**
- **MongoDB + Mongoose**
- **JWT 인증**
- **Socket.IO** (실시간 통신)
- **Multer**를 이용한 이미지 업로드 (서버 로컬 저장)

### 기타

- **AWS EC2 + Nginx + HTTPS**

## 🔒 보안

- JWT 기반 인증 (Access/Refresh 관리)
- HTTPOnly 쿠키로 보안 강화
- CORS 설정 적용

## 🚀 시작 방법

```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd server
npm install
npm run dev
```

## 🔗 GitHub

[https://github.com/lkj1313/mern-chat-app](https://github.com/lkj1313/mern-chat-app)

---
