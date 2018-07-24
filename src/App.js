import React, { Component } from 'react';
import Camera from './components/Camera/Camera';
import YoloResult from './components/YoloResult/YoloResult';
import { Webcam } from './webcam';
import * as tf from '@tensorflow/tfjs';
import yolo, { downloadModel } from 'tfjs-yolo-tiny';
import './App.css';

let model;
let webcam;
let webcamElem;


class App extends Component {
  constructor() {
    super();
    this.state = {
      result: ''
    }
    this.start();
  }

  async start() {
    try {
      model = await downloadModel();
      webcam = new Webcam(document.getElementById('webcam'));
      webcamElem = document.getElementById('webcam-wrapper');
      alert("Just a heads up! We'll ask to access your webcam so that we can " +
        "detect objects in semi-real-time. \n\nDon't worry, we aren't sending " +
        "any of your images to a remote server, all the ML is being done " +
        "locally on device, and you can check out our source code on Github.");
      await webcam.setup();
      this.run();
    } catch(e) {
      console.error(e);
    }
  }

  async run() {
    while (true) {
      this.clearRects();

      const inputImage = webcam.capture();

      const t0 = performance.now();

      const boxes = await yolo(inputImage, model);

      const t1 = performance.now();
      console.log("YOLO inference took " + (t1 - t0) + " milliseconds.");

      let yoloResult = '';
      boxes.forEach(box => {
        const {
          top, left, bottom, right, classProb, className,
        } = box;
        yoloResult = yoloResult + `${className} Confidence: ${Math.round(classProb * 100)}%`+'\n';
        this.drawRect(left, top, right-left, bottom-top,
          `${className} Confidence: ${Math.round(classProb * 100)}%`)
      });
      this.setState({result: yoloResult});
      await tf.nextFrame();
    }
  }

   clearRects() {
    const rects = document.getElementsByClassName('rect');
    while(rects[0]) {
      rects[0].parentNode.removeChild(rects[0]);
    }
  }

   drawRect(x, y, w, h, text = '', color = 'red') {
    const rect = document.createElement('div');
    rect.classList.add('rect');
    rect.style.cssText = `top: ${y}px; left: ${x}px; width: ${w}px; height: ${h}px; border-color: ${color};`;

    const label = document.createElement('div');
    label.classList.add('label');
    label.innerText = text;
    rect.appendChild(label);

    webcamElem.appendChild(rect);
  }

  render() {
  return (
    <div className="App">
        <h1>Hello Yolo!</h1>
        <Camera/>
        <YoloResult result={this.state.result}/>
      </div>
    );
  }
}

export default App;
