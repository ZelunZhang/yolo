import React from 'react';
const Camera = () => {
  return (
    <div class="center">
      <div id="webcam-wrapper">
        <video autoPlay playsInline muted
          id="webcam" width="416" height="416">
        </video>
      </div>
    </div>
  );
}

export default Camera;
