import React, { useState } from "react";
import axios from "axios";
import "./AnemiaDetectionContent.css";

const AnemiaDetectionContent = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [detections, setDetections] = useState([]);
  const [classificationImageUrl, setClassificationImageUrl] = useState("");
  const [detectionImageUrl, setDetectionImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearSections = () => {
    setResult("");
    setConfidence(0);
    setDetections([]);
    setClassificationImageUrl("");
    setDetectionImageUrl("");
    setError("");
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    clearSections();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await axios.post("http://127.0.0.1:5001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;
      
      // Set classification results
      setClassificationImageUrl(data.uploaded_file_url || data.uploaded_image_url || "");
      setResult(data.result || "");
      setConfidence(data.confidence || 0);

      // Set detection results if available
      if (data.detection) {
        setDetectionImageUrl(data.detection.annotated_image_url);
        setDetections(data.detection.detections || []);
      }
    } catch (error) {
      setError("Failed to process the image. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anemia-detection">
      <h1>Anemia Detection</h1>
      
      {/* Upload Section */}
      <div className="upload-section">
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleImageChange} accept="image/*" />
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Upload"}
          </button>
        </form>
      </div>

      {/* Results Container */}
      {(classificationImageUrl || result) && (
        <div className="results-container">
          <div className="sections-container">
            
            {/* Step 1: Original Image & Classification */}
            {classificationImageUrl && (
              <div className="classification-section">
                <h2>Step 1: Classification</h2>
                <div className="image-container">
                  <img src={classificationImageUrl} alt="Uploaded Image" className="preview-image" />
                </div>
                <div className="result-info">
                  <h3>Result: <span className={`result-label ${result}`}>{result}</span></h3>
                  {confidence > 0 && (
                    <p>Confidence: {confidence.toFixed(2)}%</p>
                  )}
                </div>
              </div>
            )}

            {/* Arrow Indicator */}
            {result && (
              <div className="arrow-container">
                <div className="arrow-indicator">→</div>
                <p className="step-info">
                  {result === "blood" ? "Blood detected" : "Non-blood detected"}
                </p>
              </div>
            )}

            {/* Step 2: Detection & Segmentation */}
            {result && (
              <div className="detection-section">
                <h2>Step 2: Detection & Masks</h2>
                {result === "blood" && detectionImageUrl ? (
                  <div className="detection-container">
                    <div className="image-container">
                      <img src={detectionImageUrl} alt="Detection Result" className="preview-image" />
                    </div>
                    <div className="detection-info">
                      {detections.some((det) => det.class_id === 3) ? (
                        <h3 className="anemia-positive">🔴 Anemia Detected</h3>
                      ) : (
                        <h3 className="anemia-negative">🟢 Normal Blood Cells</h3>
                      )}
                    </div>
                  </div>
                ) : result === "blood" ? (
                  <div className="processing-state">
                    <p>Processing blood image for cell detection...</p>
                  </div>
                ) : (
                  <div className="non-blood-state">
                    <p>⚠️ Non-blood image detected</p>
                    <p>Please upload a blood smear image for analysis</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-container">
          <p className="error-message">❌ {error}</p>
        </div>
      )}
    </div>
  );
};

export default AnemiaDetectionContent;
