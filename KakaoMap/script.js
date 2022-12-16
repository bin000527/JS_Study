const container = document.getElementById("map");
const map = new kakao.maps.Map(container, {
	center: new kakao.maps.LatLng(37.497934, 127.027616),
	level: 3,
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

const createMarkerImage = (isMyLocation = false) => {
	const imageSrc = (isMyLocation) ? "./markerImg/myLocation.png" : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

	const imageSize = new kakao.maps.Size(24, 35);
	const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

	return markerImage;
};

const createMarker = (place) => {
	const marker = new kakao.maps.Marker({
		map: map,
		position: place.latlng,
		title: place.title,
		image: (place.title === "현재 위치") ? createMarkerImage(true): createMarkerImage()
	});
	return marker;
};

const createCafeElement = () => {
	cafes.map((cafe) => {
		const marker = createMarker(cafe);
		const infowindow = new kakao.maps.InfoWindow({
			content: `<div style="padding:5px;font-size:12px;">
				<a href="https://place.map.kakao.com/${cafe.id}" target="_blank">${cafe.title}</a>
				</div>`,
			removable: true,
		});

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

const successGeolocation = (position) =>{
	const {latitude, longitude} = position.coords;
	const currentLatLng = new kakao.maps.LatLng(latitude, longitude);
	map.setCenter(currentLatLng);
	const marker = createMarker({latlng: currentLatLng, title: "현재 위치"});
	marker.setMap(map);
};

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

searchPlaceButton.addEventListener("click", () => {
	const inputText = document.getElementById("text-searchPlace").value;
	ps.keywordSearch(inputText, placesSearchCB); 
});
