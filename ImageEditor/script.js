const get = (element) => document.querySelector(element);

class PhotoEditor{
	constructor() {
		this.container = get("main");

		//원본 이미지 캔버스
		this.canvas = get("canvas");
		//캔버스 기본 크기
		this.width = 300; 
		this.height = 300;
		this.minSize = 20; //크롭할 최소 사이즈
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		//캔버스 위에 그려질 내용 ( 크롭할 영역을 나타냄 )
		this.ctx = this.canvas.getContext("2d"); 
		this.ctx.lineWidth = 4;
		this.ctx.strokeStyle = "#ff0000";

		//크롭할 이미지의 시작지점 좌표
		this.sourceX;
		this.sourceY;
		this.sourceWidth; //폭

		//편집된 이미지 영역
		this.targetImage = get(".image_wrap");
		this.targetCanvas = document.createElement("canvas"); //편집된 이미지 캔버스 생성
		this.targetCtx = this.targetCanvas.getContext("2d");
		//편집된 이미지 크기
		this.targetWidth; 
		this.targetHeight;

		this.img = new Image();

		this.btnFlip = get(".btn_flip");
		this.btnSepia = get(".btn_sepia");
		this.btnGray = get(".btn_gray");
		this.btnSave = get(".btn_save");

		this.fileDrag = get(".drag_area");
		this.fileInput = get(".drag_area input");

		this.fileImage = get(".fileImage");
		
		this.drawEvent(); //크롭 이벤트
		this.clickEvent(); //버튼 클릭 이벤트
		this.fileEvent(); //파일 변경 이벤트
	}

	drawEvent(){
		const canvasX = this.canvas.getBoundingClientRect().left; //캔버스 시작 좌표
		const canvasY = this.canvas.getBoundingClientRect().top;
		let sX, sY, eX, eY; //크롭 시작, 끝 좌표
		let drawStart = false;
        
		this.canvas.addEventListener("mousedown", (e) => {
			sX = parseInt(e.clientX - canvasX, 10);
			sY = parseInt(e.clientY - canvasY, 10);
			drawStart = true;
		});

		this.canvas.addEventListener("mousemove", (e) => {
			if(!drawStart) return;
			eX = parseInt(e.clientX - canvasX, 10);
			eY = parseInt(e.clientY - canvasY, 10);
			this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
			this.ctx.strokeRect(sX, sY, eX-sX, eY-sY);
		});

		this.canvas.addEventListener("mouseup", () => {
			drawStart = false;
			if(Math.abs(eX- sX) < this.minSize || Math.abs(eY-sY) < this.minSize) return;
			this.drawOutput(sX, sY, eX-sX, eY-sY);
			this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
		});
	}

	drawOutput(x, y, width, height){
		this.targetImage.innerHTML = "";
		if(Math.abs(width) <= Math.abs(height)){
			//크기가 더 큰 높이를 캔버스의 높이로 지정
			this.targetHeight = this.height;
			//가로 폭을 (그림의 높이/캔버스의 높이) 만큼 조절
			this.targetWidth = (this.targetHeight * width) / height;
		} else {
			this.targetWidth = this.width;
			this.targetHeight = (this.targetWidth * height) / width;
		}
		this.targetCanvas.width = this.targetWidth;
		this.targetCanvas.height = this.targetHeight;

		this.img.src = this.fileImage.getAttribute("src");

		this.img.addEventListener("load", () => {
			//원본이미지 폭 / 캔버스 폭 
			//클릭시점의 x, y좌표는 캔버스 크기에 맞춰졌을 때의 좌표이므로 원본 img크기일때의 좌표로 조정하기 위함
			const buffer = this.img.width / this.width;
			this.sourceX = x*buffer;
			this.sourceY = y*buffer;
			this.sourceWidth = width*buffer;
			this.sourceHeight = height*buffer;
			this.targetCtx.drawImage(
				this.img,
				this.sourceX,
				this.sourceY,
				this.sourceWidth,
				this.sourceHeight,
				0,
				0,
				this.targetWidth,
				this.targetHeight
			);
		});
        
		this.targetImage.appendChild(this.targetCanvas);
	}

	clickEvent() {
		this.btnFlip.addEventListener("click", this.flipEvent.bind(this));
		this.btnSepia.addEventListener("click", this.sepiaEvent.bind(this));
		this.btnGray.addEventListener("click", this.grayEvent.bind(this));
		this.btnSave.addEventListener("click", this.download.bind(this));
	}
    
	flipEvent(){ //좌우 반전
		this.targetCtx.translate(this.targetWidth, 0);
		this.targetCtx.scale(-1, 1);
		this.targetCtx.drawImage(
			this.img,
			this.sourceX,
			this.sourceY,
			this.sourceWidth,
			this.sourceHeight,
			0,
			0,
			this.targetWidth,
			this.targetHeight
		);
	}

	sepiaEvent() { //세피아 필터
		this.targetCtx.clearRect(0,0,this.targetWidth, this.targetHeight);
		this.targetCtx.filter = "sepia(1)";
		this.targetCtx.drawImage(
			this.img,
			this.sourceX,
			this.sourceY,
			this.sourceWidth,
			this.sourceHeight,
			0,
			0,
			this.targetWidth,
			this.targetHeight
		);
	}

	grayEvent(){ //그레이 필터
		this.targetCtx.clearRect(0,0,this.targetWidth, this.targetHeight);
		this.targetCtx.filter = "grayscale(1)";
		this.targetCtx.drawImage(
			this.img,
			this.sourceX,
			this.sourceY,
			this.sourceWidth,
			this.sourceHeight,
			0,
			0,
			this.targetWidth,
			this.targetHeight
		);
	}

	download() { //저장
		const url = this.targetCanvas.toDataURL();
		const downloader = document.createElement("a");
		downloader.style.display = "none";
		downloader.setAttribute("href", url);
		downloader.setAttribute("download", "canvas.png");
		this.container.appendChild(downloader);
		downloader.click();
		setTimeout(() => {
			this.container.removeChild(downloader);
		}, 100);
	}

	fileEvent(){ //파일 변경
		this.fileInput.addEventListener("change", (event) => {
			const fileName = URL.createObjectURL(event.target.files[0]);
			const img = new Image();
			img.addEventListener("load", (e) => {
				this.width = e.path[0].naturalWidth;
				this.height = e.path[0].naturalHeight;
			});
			this.fileImage.setAttribute("src", fileName);
			img.setAttribute("src", fileName);
		});
	}
}


new PhotoEditor();