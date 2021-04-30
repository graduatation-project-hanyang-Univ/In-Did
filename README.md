# In-Did

# 지켜야 할 명세
- 커밋 로그, 브랜치 작성
  : prefix로 이슈명 (DP-1 등) 붙이면서 작성

- 테스트 파일 작성
  : *.spec.js 파일명으로 테스트 파일 작성




# 버젼
- node 12.22.1 사용 (바로 다운받지 말고 nvm 다운받아서 노드 버전 관리하는 것을 추천)
- indy-sdk 1.15.0-dev-1628 사용하므로, libindy도 완전히 동일하게 다운받아야한다.

# indy-sdk 연동
- 참고 : https://github.com/hyperledger/indy-sdk/blob/master/wrappers/nodejs/README.md

## 윈도우
1. 파이썬, c++ 설치
2. nodye-gyp 글로벌로 설치 (아래 쉘 참조)
3. libindy 설치 (https://repo.sovrin.org/windows/libindy/master/1.15.0-1628/)
4. 환경변수 LD_LIBRARY_PATH 설정 (lib 폴더 바라보게)
    - 현재 윈도우는 해당 프로젝 libindy 폴더에 설치해놨기 때문에, 절대경로로 libindy/window/lib 바라보게 설정해야 한다
5. 아래 쉘 대로 실행   

## macOS
- 동일하게 위에 참조해서 하면 될듯 (살짝 과정 다르니 indy-sdk 연동에 참조부분 링크 들어가서 참고)
- libindy는 여기서 다운 가능 https://repo.sovrin.org/macos/libindy/master/1.15.0-1628/


```shell
npm install -g node-gyp
npm i
```


# indy-node 연동 
- 로컬 테스트 환경 구축 위함

## 미리 해야될 것
1. 도커 설치

## 과정
1. /config/indy-pool.dockerfile 을 통해 도커 이미지 생성
2. 만든 이미지를 통해 컨테이너 생성 및 실행
3. 실제 환경 구축에 관해서는 
   - /indy-template/write-did-and-query-verkey/writeDidAndQueryVerkey.js 여기 부분 참조하면서 진행하면 될듯.

```shell
$ docker build -f config/indy-pool.dockerfile -t indy_pool . # 이미지생성
$ docker run --name indy_pool -itd -p 9701-9708:9701-9708 indy_pool # 컨테이너 생성

$ npm rum leder:start  # 컨테이너 실행 (package.json 확인) 
$ npm run leder:stop   # 컨테이너 종료 (package.json 확인)
```


