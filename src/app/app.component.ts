import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as mobilenet from '@tensorflow-models/mobilenet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  public modelLoaded: boolean = false;
  public title: string = 'Image Classification';
  public introline: string = '(using TensorFlow.js with MobileNet Model)';
  public imgBtnStatus: boolean = true;
  public webBtnStatus: boolean = false;
  public imageElement: any;
  public imageSrc: any = 'assets/cat.jpg';
  public imageWidth: number = 400;
  public imageHeight: number = 300;
  @ViewChild('videoElement', {static: false}) videoElement: ElementRef;
  public video: any;
  public videoWidth: number = 400;
  public videoHeight: number = 300;
  public videoStream: any;
  @ViewChild("videoCanvas", {static: false}) videoCanvas: ElementRef;
  public videoCanvasWidth: number = 400;
  public videoCanvasHeight: number = 300;
  public canvasContext: any;
  public model: any;
  public prediction: any;
  public fileName: string = 'No File Chosen';
  public fileError: boolean = false;

  public async ngOnInit() {
    this.model = await mobilenet.load();
    this.modelLoaded = true;
    console.log('Model Loaded...!');
  }

  public imageMode() {
    if (!this.imgBtnStatus) {
      this.imageSrc = 'assets/white.jpg';
      this.prediction = [];
      this.imgBtnStatus = true;
      this.webBtnStatus = false;
      this.stopVideo();
    }
  }

  public videoMode() {
    if (!this.webBtnStatus) {
      this.imageSrc = 'assets/white.jpg';
      this.prediction = [];
      this.webBtnStatus = true;
      this.imgBtnStatus = false;
      this.video = this.videoElement.nativeElement;
      this.initCamera({ video: true, audio: false });
    }
  }

  public initCamera(config:any) {
    var browser = <any>navigator;
    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);
    browser.mediaDevices.getUserMedia(config).then((stream: any) => {
      if(!stream.stop && stream.getTracks) {
        stream.stop = function(){
          this.getTracks().forEach(function (track: any) {
            track.stop();
          });
        };
      }
      this.videoStream = stream;
      try {
        this.video.srcObject = this.videoStream;
      } catch(err) {
        this.video.src = window.URL.createObjectURL(this.videoStream);
      }
      this.video.play();
    });
  }

  public stopVideo() {
    this.videoStream.stop();
  }

  public async snapPhoto() {
    this.canvasContext = await this.videoCanvas.nativeElement.getContext("2d").drawImage(this.videoElement.nativeElement, 0, 0, this.videoCanvasWidth, this.videoCanvasHeight);
    this.imageSrc = await this.videoCanvas.nativeElement.toDataURL("image/jpeg");
    this.predict();
  }

  public async predict() {
    if (this.model) {
      if (this.imageSrc !== 'assets/white.jpg') {
        this.imageElement = document.getElementById('image');
        this.prediction = await this.model.classify(this.imageElement);
        console.log(this.prediction);
      }
    }
  }

  public browseFile(files: any) {
    if (files.length === 0) {
      return;
    } else {
      let mimeType = files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        this.fileError = true;
        return;
      } else {
        this.fileError = false;
        this.fileName = files[0].name;
        let reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          this.imageSrc = reader.result;
        }
      }
    }
  }

}
