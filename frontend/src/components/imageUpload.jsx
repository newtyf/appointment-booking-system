import { useState } from "react";

export const ImageUpload = () => {
  // State variables for managing component data
  const [selectedFile, setSelectedFile] = useState(null); // Stores the selected image file object
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // Stores the URL for the local image preview
  const [processedImageUrl, setProcessedImageUrl] = useState(null); // Stores the URL of the image returned by the API
  const [selectedHairColor, setSelectedHairColor] = useState(""); // Stores the currently selected hair color
  const [isLoading, setIsLoading] = useState(false); // Boolean to indicate if an API call is in progress
  const [errorMessage, setErrorMessage] = useState(""); // Stores any error messages to display

  // Define hair color options
  const hairColors = [
    { id: "black", label: "Negro", promptValue: "black" },
    { id: "blonde", label: "Rubio", promptValue: "blonde" },
    { id: "brown", label: "Castaño", promptValue: "brown" },
    { id: "red", label: "Rojo", promptValue: "red" },
    { id: "blue", label: "Azul", promptValue: "blue" },
  ];

  // Handler for file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the first selected file
    setSelectedFile(file); // Set the file in state
    setProcessedImageUrl(null); // Clear any previously processed image

    if (file) {
      // Create a FileReader to display a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result); // Set the image preview URL
      };
      reader.readAsDataURL(file); // Read the file as a Data URL
    } else {
      setImagePreviewUrl(null); // Clear preview if no file is selected
    }
    setErrorMessage(""); // Clear any previous error messages
  };

  // Handler for hair color radio button change
  const handleColorChange = (event) => {
    setSelectedHairColor(event.target.value); // Set the selected hair color in state
    setErrorMessage(""); // Clear any previous error messages
  };

  // Handler for form submission (API call)
  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage("Por favor, selecciona una imagen primero.");
      return;
    }
    if (!selectedHairColor) {
      setErrorMessage("Por favor, selecciona un color de cabello.");
      return;
    }

    setIsLoading(true); // Show the loader
    setErrorMessage(""); // Clear previous errors

    const formData = new FormData(); // Create FormData object for multipart/form-data
    formData.append("file", selectedFile); // Append the image file
    // Construct the prompt for the API based on the selected hair color
    formData.append("prompt", `change hair color to ${selectedHairColor}`);

    try {
      // Make the API call to your FastAPI endpoint
      const response = await fetch("/api/ai/process-image", {
        method: "POST",
        body: formData, // Send FormData as the body
      });

      if (!response.ok) {
        // If response is not OK (e.g., 4xx or 5xx status)
        const errorData = await response.json(); // Parse error response
        throw new Error(errorData.detail || "Error al procesar la imagen.");
      }

      const data = await response.json(); // Parse successful response
      setProcessedImageUrl(data.image_url); // Set the URL of the processed image
      setImagePreviewUrl(null); // Clear the original preview
      console.log("Imagen procesada:", data.image_url);
    } catch (error) {
      console.error("Error al enviar la imagen:", error);
      setErrorMessage(`Error: ${error.message}`); // Display error message
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center p-4 font-sans'>
      <div className='bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full flex flex-col md:flex-row gap-8 items-center justify-center'>
        {/* Left Section: Image Upload and Preview */}
        <div className='flex-2 w-full flex flex-col items-center'>
          <h2 className='text-3xl font-bold text-gray-800 mb-6 text-center'>
            Editor de Color de Cabello
          </h2>

          <label
            htmlFor='image-upload'
            className='w-full cursor-pointer bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 ease-in-out text-center shadow-md mb-6'
          >
            {selectedFile ? "Cambiar Imagen" : "Seleccionar Imagen"}
            <input
              id='image-upload'
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
            />
          </label>

          <div
            className='w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden relative'
            style={{ minHeight: "250px", aspectRatio: "1/1" }}
          >
            {isLoading ? (
              <div className='flex flex-col items-center justify-center p-4'>
                <div className='animate-spin rounded-full h-16 w-12 border-b-4 border-purple-500 mb-3'></div>
                <p className='text-gray-600'>Procesando imagen...</p>
              </div>
            ) : processedImageUrl ? (
              <img
                src={processedImageUrl}
                alt='Imagen Procesada'
                className='max-w-full max-h-full object-contain rounded-xl'
              />
            ) : imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt='Previsualización de Imagen'
                className='max-w-full max-h-full object-contain rounded-xl'
              />
            ) : (
              <p className='text-gray-500 text-center p-4'>
                Sube una imagen para ver la previsualización aquí.
              </p>
            )}
          </div>
          {errorMessage && (
            <p className='text-red-600 mt-4 text-center'>{errorMessage}</p>
          )}
        </div>

        {/* Right Section: Hair Color Selection and Submit */}
        <div className='flex-1 w-full md:pl-8 border-t md:border-t-0 md:border-l border-gray-200 pt-8 md:pt-0'>
          <h3 className='text-2xl font-semibold text-gray-700 mb-5 text-center md:text-left'>
            Selecciona un Color de Cabello
          </h3>
          <div className='flex flex-wrap gap-4 justify-center md:justify-start mb-8'>
            {hairColors.map((color) => (
              <label
                key={color.id}
                className={`flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition duration-200 ease-in-out shadow-sm
                  ${
                    selectedHairColor === color.promptValue
                      ? "bg-blue-100 border-2 border-purple-500"
                      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  }`}
              >
                <input
                  type='radio'
                  name='hairColor'
                  value={color.promptValue}
                  checked={selectedHairColor === color.promptValue}
                  onChange={handleColorChange}
                  className='form-radio h-5 w-5 text-purple-600 border-gray-300 focus:ring-purple-500'
                />
                <span className='text-lg text-gray-700 font-medium'>
                  {color.label}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedFile || !selectedHairColor || isLoading}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-xl transition duration-300 ease-in-out shadow-lg
              ${
                !selectedFile || !selectedHairColor || isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700 transform hover:scale-105"
              }`}
          >
            {isLoading ? "Procesando..." : "Aplicar Color"}
          </button>
        </div>
      </div>
    </div>
  );
};
