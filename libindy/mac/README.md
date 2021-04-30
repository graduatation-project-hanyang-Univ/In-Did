# Mac에서 Indy-SDK 연동하기

nvm , Node 모두 설치 후 Indy-SDK 연동을 위해 실시합니다.(첫 페이지 설명)

</br>
https://repo.sovrin.org/macos/libindy/master/1.15.0-1628/ </br>
해당 URL에서 전체 파일을 받을 수 있습니다.

<br></br>
https://www.npmjs.com/package/indy-sdk#installing 에서 
</br>installing방법을 확인할 수 있습니다. </br>
(환경변수를 lib폴더를 가르키도록 바꾸거나, system library에 libindy.dylib을 넣으면 됩니다.) </br>
python의 버전과 c++의 버전을 잘 살펴주세요.

<br></br>
이후 해당 명령어로 indy-sdk를 설치할 수 있습니다.
```
$ npm install --save indy-sdk
```
