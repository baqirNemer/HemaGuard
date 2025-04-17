import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import crossImage from './images/cross.png'; 
import ContainedButton from './Button_nav';

function About() {
    return (
        <div id="welcome" className="container py-5" > 
            <div className="row">
                <div className="col-md-6 d-flex flex-column justify-content-center align-items-center" style={{ marginTop: '80px' }}>
                    <h1 className="text-center">ABOUT US</h1>
                    <h3 className="text-center">Empowering Healthcare Through Technology</h3>
                    <p className="text-center">
                        At OurHealth, we are on a mission to transform healthcare by leveraging technology and innovation. With over two decades of experience, we have been at the forefront of developing cutting-edge solutions that revolutionize how medical records and health histories are managed and accessed.

                        Our platform ensures the seamless and secure storage of patient data, facilitating better coordination among healthcare providers and empowering patients to actively participate in their healthcare journey. By harnessing the power of data analytics and artificial intelligence, we deliver personalized insights that enhance clinical decision-making and improve patient outcomes.

                        We believe in transparency, integrity, and patient-centric care. Our commitment is to build a connected healthcare ecosystem that fosters collaboration and drives continuous improvement in healthcare delivery.

                        Join us in shaping the future of healthcare. Together, we can make a difference.
                    </p>
                    <ContainedButton to="/About">Read More</ContainedButton>
                </div>
                <div className="col-md-6">
                    <img id="about" src={crossImage} className="img-fluid" alt="Cross Image1" />
                </div>
            </div>
        </div>
    );
}

export default About;
