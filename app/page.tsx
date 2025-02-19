// frontend/pages/index.js
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function Home() {
  // State variables to handle file, preview, results, and UI loading
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('classify');
  const [loading, setLoading] = useState(false);

  // Handle file drop using react-dropzone
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Handle the processing button click
  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      let endpoint = '';
      // Determine which API endpoint to call based on the active tab
      if (activeTab === 'classify')
        endpoint = 'http://localhost:8000/predict/classify';
      else if (activeTab === 'detect')
        endpoint = 'http://localhost:8000/predict/detect';
      else if (activeTab === 'segment')
        endpoint = 'http://localhost:8000/predict/segment';

      // Call the backend API
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error processing file", error);
      setResult({ error: "Failed to process file" });
    }
    setLoading(false);
  };

  // Function to render results based on the selected tab
  const renderResult = () => {
    if (!result) return null;
    if (result.error) return <div className="text-red-500">{result.error}</div>;

    if (activeTab === 'classify') {
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-xl font-bold">Classification Result</h3>
          <p>
            Prediction: <span className="font-semibold">{result.prediction}</span>
          </p>
          <p>
            Confidence: <span className="font-semibold">{result.confidence}</span>
          </p>
        </div>
      );
    } else if (activeTab === 'detect') {
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-xl font-bold">Detection Results</h3>
          {result.detections.map((det, idx) => (
            <div key={idx} className="border p-2 my-2 rounded">
              <p>
                Object: <span className="font-semibold">{det.object}</span>
              </p>
              <p>
                Confidence: <span className="font-semibold">{det.confidence}</span>
              </p>
              <p>
                Bounding Box: <span className="font-semibold">{det.bbox.join(", ")}</span>
              </p>
            </div>
          ))}
        </div>
      );
    } else if (activeTab === 'segment') {
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-xl font-bold">Segmentation Result</h3>
          <p>{result.message}</p>
          <p>
            Mask File: <span className="font-semibold">{result.mask}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 flex flex-col items-center py-10">
      <div className="bg-white rounded-xl shadow-2xl w-11/12 md:w-2/3 p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          AI Image & Video Processing
        </h1>

        {/* Navigation Tabs */}
        <div className="flex justify-around mb-6">
          {['classify', 'detect', 'segment'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setResult(null);
              }}
              className={`px-5 py-2 rounded-full transition-colors font-medium ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-800 hover:bg-blue-100'
              }`}
            >
              {tab === 'classify'
                ? 'Classification'
                : tab === 'detect'
                ? 'Object Detection'
                : 'Segmentation'}
            </button>
          ))}
        </div>

        {/* Drag & Drop Upload Area */}
        <div
          {...getRootProps()}
          className="border-4 border-dashed border-gray-300 p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors rounded-xl"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-2xl text-gray-600">Drop the file here ...</p>
          ) : (
            <p className="text-2xl text-gray-600">
              Drag & drop an image or video here, or click to select file
            </p>
          )}
        </div>

        {/* File Preview */}
        {preview && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Preview:</h3>
            {selectedFile.type.startsWith('image') ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-xl shadow-lg"
              />
            ) : (
              <video controls src={preview} className="max-h-64 mx-auto rounded-xl shadow-lg"></video>
            )}
          </div>
        )}

        {/* Process Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition duration-200"
          >
            {loading ? 'Processing...' : 'Process'}
          </button>
        </div>

        {/* Display API Results */}
        {renderResult()}
      </div>
    </div>
  );
}
