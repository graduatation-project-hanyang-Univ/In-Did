# In-Did

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

- 커밋 로그, 브랜치 작성
: prefix로 이슈명 (DP-1 등) 붙이면서 작성
