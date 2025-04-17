import React from 'react';
import { Carousel as BootstrapCarousel } from 'react-bootstrap';

import h1Image from './images/carousel1.png';
import h2Image from './images/carousel2.png';

const captionStyle = {
  position: 'absolute',
  left: '0',
  bottom: '0',
  width: '100%',
  textAlign: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(8px)', 
  padding: '20px',
  color: 'white',
};

function Carousel() {
  return (
    <BootstrapCarousel>
      <BootstrapCarousel.Item>
        <img
          className="d-block w-100"
          src={h1Image}
          alt="First slide"
        />
        <div style={captionStyle}>
          <h2>Connect with your profile anywhere</h2>
          <h4>Access and manage your profile from any device, seamlessly.</h4>
          <br/>
        </div>
      </BootstrapCarousel.Item>
      <BootstrapCarousel.Item>
        <img
          className="d-block w-100"
          src={h2Image}
          alt="Second slide"
        />
        <div style={captionStyle}>
          <h2>Stay updated to your health record</h2>
          <h4>Keep track of your health records and updates in real-time.</h4>
          <br/>
        </div>
      </BootstrapCarousel.Item>
    </BootstrapCarousel>
  );
}

export default Carousel;
