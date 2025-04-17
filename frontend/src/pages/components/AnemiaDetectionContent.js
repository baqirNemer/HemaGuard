import React, { useState } from "react";
import axios from "axios";
import "./AnemiaDetectionContent.css";

const AnemiaDetectionContent = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [detections, setDetections] = useState([]);
  const [classificationImageUrl, setClassificationImageUrl] = useState("");
  const [detectionImageUrl, setDetectionImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDetectionSection, setShowDetectionSection] = useState(false); // New state to control visibility

  const clearSections = () => {
    setResult("");
    setDetections([]);
    setClassificationImageUrl("");
    setDetectionImageUrl("");
    setError("");
    setShowDetectionSection(false); // Hide the detection section
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    clearSections(); // Clear the sections when a new image is uploaded
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
      setClassificationImageUrl(data.uploaded_image_url || "");
      setResult(data.result || "");
      setShowDetectionSection(true); // Show detection section after response

      if (data.detection) {
        setDetectionImageUrl(data.detection.annotated_image_url);
        setDetections(data.detection.detections);
      }
    } catch (error) {
      setError("Failed to process the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anemia-detection">
      <h1>Anemia Detection</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageChange} accept="image/*" />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Upload"}
        </button>
      </form>

      <div className="sections-container">
        {classificationImageUrl && (
          <div className="classification-section">
            <h2>Classification</h2>
            <img src={classificationImageUrl} alt="Uploaded" className="preview-image" />
            <h4>Result: {result}</h4>
          </div>
        )}

        {result === "blood" || result === "non-blood"? (
          <div className="arrow-indicator">→</div>
        ) : null}

        {showDetectionSection && (
          <div className="detection-section">
            {result === "blood" && detectionImageUrl ? (
              <>
                <h2>Detection & Masks</h2>
                <img src={detectionImageUrl} alt="Detection Result" className="preview-image" />
                {detections.some((det) => det.class_id === 3) ? (
                  <h4>Anemia detected (Sickle Cells found).</h4>
                ) : (
                  <h4>Normal (No Sickle Cells detected).</h4>
                )}
              </>
            ) : (
              <h4>Please upload a valid image.</h4>
            )}
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default AnemiaDetectionContent;
