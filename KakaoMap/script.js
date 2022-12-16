//지도를 불러올 div영역
const container = document.getElementById("map");

//container에 지도 생성
const map = new kakao.maps.Map(container, {
	center: new kakao.maps.LatLng(37.497934, 127.027616), // 설정한 위도와 경도를 지도의 중심으로 설정
	level: 3, //지도의 확대 레벨
});

//***여러개의 마커 표시하기
const markCafesButton = document.getElementById("btn-markCafes");

const cafes = [
	{
		id: 7977521,
		title: "스타벅스 강남삼성타운점",
		latlng: new kakao.maps.LatLng(37.495528, 127.027760)
	}, 
	{
		id: 8263107,
		title: "던킨 라이브 강남점",
		latlng: new kakao.maps.LatLng(37.496037, 127.028179)
	}, 
	{
		id:7961654,
		title: "스타벅스 몬테소리점",
		latlng: new kakao.maps.LatLng(37.498205, 127.026905)
	}
];

//마커 이미지 생성 함수
//isMyLocation: 내위치를 표시하는지 아닌지 ( 내 위치를 표시할 경우 'MY'마커 이미지 )
const createMarkerImage = (isMyLocation = false) => {
	const imageSrc = (isMyLocation) ? "./markerImg/myLocation.png" : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
	const imageSize = new kakao.maps.Size(24, 35);
	const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

	return markerImage;
};

//마커 생성 함수 ( 표시할 장소 객체(place)를 인자로 받아옴 )
const createMarker = (place) => {
	const marker = new kakao.maps.Marker({
		map: map,
		position: place.latlng,
		title: place.title,
		image: (place.title === "현재 위치") ? createMarkerImage(true): createMarkerImage()
	});
	return marker;
};

//각 카페에 대한 요소 생성 함수 => 마커 표시
const createCafeElement = () => {
	cafes.map((cafe) => {
		const marker = createMarker(cafe);
		//카페 이름과 정보페이지 링크가 담긴 인포윈도우 생성
		const infowindow = new kakao.maps.InfoWindow({
			content: `<div style="padding:5px;font-size:12px;">
				<a href="https://place.map.kakao.com/${cafe.id}" target="_blank">${cafe.title}</a>
				</div>`,
			removable: true, //삭제할 수 있는 'x'표시
		});

		//마커를 클릭했을 때 인포윈도우가 나타나도록 클릭리스너 추가
		kakao.maps.event.addListener(marker, "click", () => {
			infowindow.open(map, marker);
		});
	});

};

createCafeElement();
markCafesButton.addEventListener("click", () => {
	map.setCenter(new kakao.maps.LatLng(37.497934, 127.027616));
	createCafeElement();
});

//***현재 위치 가져오기
const getLocationButton = document.getElementById("btn-getLocation");

//geoLocation 불러오기 성공했을 때 실행되는 함수
const successGeolocation = (position) =>{
	const {latitude, longitude} = position.coords;
	//불러온 위도와 경도 정보를 카카오 맵에 이용할 수 있도록 객체화
	const currentLatLng = new kakao.maps.LatLng(latitude, longitude);
	map.setCenter(currentLatLng);
	const marker = createMarker({latlng: currentLatLng, title: "현재 위치"});
	marker.setMap(map);
};

//geoLocation 불러오기 실패했을 때 실행되는 함수
const errorGeolocation = (error) => {
	if(error.code === 1){
		alert("위치 정보를 허용해주세요.");
	} else if(error.code === 2){
		alert("사용할 수 없는 위치입니다.");
	} else if(error.code === 3){
		alert("타임아웃이 발생했습니다.");
	} else {
		alert("오류가 발생했습니다.");
	}
};

//Geolocation API를 이용하여 사용자의 위치 검색
const getLocation = () => {
	if("geolocation" in navigator){
		navigator.geolocation.getCurrentPosition(
			successGeolocation,
			errorGeolocation
		);
	} else{
		alert("지도 api 사용 불가");
	}
};

getLocationButton.addEventListener("click", () => {
	getLocation();
});

//***장소 검색하기
const searchPlaceButton = document.getElementById("btn-searchPlace");

//services 라이브러리를 이용하여 장소 검색 서비스 객체 생성
const ps = new kakao.maps.services.Places(); 

//콜백함수 인자로 data(결과 목록), status(응답 코드), pagination(pagination 객체)
const placesSearchCB = (data, status) => {
	if(status === kakao.maps.services.Status.OK){
		//LatLngBounds() : 사각영역정보를 표현하는 객체를 생성
		const bounds = new kakao.maps.LatLngBounds();

		for(let i = 0; i<data.length; i++){
			displayMarker(data[i]);
			//extend : 인수로 주어진 좌표를 포함하도록 영역 정보를 확장
			bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
		}

		map.setBounds(bounds);
	}
};

const displayMarker = (place) =>{
	const infowindow = new kakao.maps.InfoWindow({removable: true});
	const marker = new kakao.maps.Marker({
		map: map,
		position: new kakao.maps.LatLng(place.y, place.x)
	});

	kakao.maps.event.addListener(marker, "click", () => {
		infowindow.setContent("<div style=\"padding:5px;font-size:12px;\">" + place.place_name + "</div>");
		infowindow.open(map, marker);
	});
};

//키워드를 입력받아 검색하도록 함.
searchPlaceButton.addEventListener("click", () => {
	const inputText = document.getElementById("text-searchPlace").value;
	ps.keywordSearch(inputText, placesSearchCB); 
});
