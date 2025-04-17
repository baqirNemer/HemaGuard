import React from 'react';
import ResponsiveAppBar from "./components/Navbar";
import AnemiaDetectionContent from "./components/AnemiaDetectionContent";

const AnemiaDetection = () => {
  return (
    <>
      <ResponsiveAppBar />
      <AnemiaDetectionContent />
    </>
  );
};

export default AnemiaDetection;
