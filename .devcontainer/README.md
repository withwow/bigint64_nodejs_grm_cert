# BigInt64 Node.js Template - Dev Container

이 프로젝트는 VS Code Dev Container를 사용하여 개발 환경을 구성합니다.

## 사용 방법

### 1. Dev Container로 열기

1. VS Code에서 프로젝트 폴더를 엽니다
2. 명령 팔레트를 엽니다 (Cmd+Shift+P / Ctrl+Shift+P)
3. "Dev Containers: Reopen in Container" 를 선택합니다
4. 컨테이너가 빌드되고 시작될 때까지 기다립니다

### 2. 기존 Docker 컨테이너 사용 중인 경우

현재 다음 명령으로 컨테이너가 실행 중이라면:
```bash
docker run --name bigint64_nodejs_template -it -p 3502:3502 -v /Users/yankim/Documents/MyCom/bigint64/bigint64_nodejs_template:/root/app --network mynet node:24
```

먼저 기존 컨테이너를 중지하고 제거해야 합니다:
```bash
docker stop bigint64_nodejs_template
docker rm bigint64_nodejs_template
```

그런 다음 VS Code에서 Dev Container로 다시 열면 됩니다.

### 3. 애플리케이션 실행

Dev Container 내부에서:
```bash
# 개발 모드로 실행 (nodemon 사용)
npm run dev

# 프로덕션 모드로 실행
npm start
```

## 포트

- **3502**: 애플리케이션 포트

## 네트워크

- **mynet**: Docker 네트워크 (다른 컨테이너와 통신용)
