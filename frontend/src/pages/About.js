import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ResponsiveAppBar from './components/Navbar';

function About() {
    return (
        <div>
            <ResponsiveAppBar />
            <div className="container py-5">
                <div className="row">
                    {/* Left Column: Text Content */}
                    <div className="d-flex flex-column justify-content-center align-items-center">
                        <h1 className="text-center mb-4">ABOUT US</h1>
                        <div className="text-center">
                            <h2 className="mb-3">Empowering Healthcare Through Technology</h2>
                            <p>
                                At OurHealth, we are dedicated to revolutionizing the landscape of healthcare through innovative technologies and a steadfast commitment to patient-centered care. With a legacy spanning over two decades, OurHealth has been at the forefront of transforming the way medical records and health histories are managed and accessed, ultimately enhancing patient outcomes and improving healthcare delivery.
                            </p>
                            <p>
                                Our mission is clear: to empower individuals to take control of their health by providing them with secure and comprehensive tools to manage their medical records. We believe in leveraging the power of data and technology to drive informed decision-making and ensure continuity of care.
                            </p>
                            <p>
                                OurHealth's platform integrates cutting-edge technologies, including artificial intelligence and data analytics, to derive actionable insights from vast amounts of healthcare data. By harnessing these technologies, we enable healthcare providers to deliver personalized and effective care tailored to each patient's unique needs.
                            </p>
                            <p>
                                Central to our philosophy is a patient-centric approach. We understand that each individual's health journey is unique, and our platform is designed to put patients at the center of their care experience. Patients have the ability to access their medical records securely, communicate with their healthcare providers, and actively participate in treatment decisions.
                            </p>
                            <p>
                                We facilitate seamless coordination among healthcare providers, ensuring that critical medical information is shared securely and efficiently. Our platform breaks down silos and enables collaborative care, leading to better outcomes and improved patient satisfaction.
                            </p>
                            <p>
                                At OurHealth, data security and privacy are paramount. We adhere to the highest standards of security protocols to protect sensitive patient information. Our commitment to privacy ensures that patients can trust our platform with their most personal health data.
                            </p>
                            <p>
                                Join us in shaping the future of healthcare. Together, we can empower individuals, enhance care delivery, and improve health outcomes for all.
                            </p>
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
    );
}

export default About;
