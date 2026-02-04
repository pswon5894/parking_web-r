db에서 location 객체 리터럴에서 _id가 왜 생겼을까?

Mongoose 특유의 기본 동작 때문

왜 location 안에 _id가 생겼을까?

Mongoose는 객체(Object)를 서브도큐먼트(subdocument) 로 인식하면,
👉 자동으로 _id를 하나 붙입니다.

location: {
  type: {
    lat: Number,
    lng: Number
  },
  required: false
}

이 구조는 Mongoose 입장에서는:

location = 중첩된 document

중첩 document ⇒ _id 자동 생성 (기본값)

그래서 DB에는 이렇게 들어간 거예요:

location: {
  lat: 37.2658,
  lng: 126.9591,
  _id: ObjectId("69829db7...")
}

이거 정상인가요?

네, 완전 정상입니다.
Mongoose는 원래:

배열 안의 객체

단일 중첩 객체
모두에 _id를 자동으로 붙입니다.


_id 안 생기게 하려면?

서브도큐먼트에서 _id: false를 명시하면 됩니다.

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
    _id: false
  },
  parktime: { type: Date, default: Date.now },
  imageBase64: { type: String }
});


location: {
  lat: 37.2658,
  lng: 126.9591
}


언제 _id가 필요한가?

location을 독립적으로 수정/참조할 때

배열로 여러 location을 관리할 때

그 외 단순 좌표 저장용이면 _id 없는 게 보통 더 깔끔해요.