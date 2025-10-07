import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";
import Sidebar from "../components/sidebar/Sidebar"; // Assuming you have a sidebar
import Loader from "../components/loader/Loader";   // Assuming you have a loader

export default function DistressFormPage() {
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    intensity: "5", // Default intensity
    policehelp: false,
    firehelp: false,
    ambulancehelp: false,
    otherhelp: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Get user's current location when the component mounts
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location. Please enable location services.");
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentLocation) {
      alert("Fetching your location, please wait a moment and try again.");
      return;
    }
    setLoading(true);

    let imageUrl = "";
    // Step 1: Upload image if one is selected
    if (imageFile) {
      try {
        const storage = getStorage();
        const imageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Error uploading image: ", error);
        setLoading(false);
        alert("Failed to upload image. Please try again.");
        return;
      }
    }

    // Step 2: Prepare the data with the correct types
    const reportData = {
      ...formValues,
      title: formValues.title, // Correct field name
      intensity: Number(formValues.intensity), // Convert to Number
      datetime: serverTimestamp(), // Use Firestore's server Timestamp
      location: currentLocation,
      imageUrl: imageUrl, // Single, consolidated image URL field
      status: "NEW", // Default status
    };
    
    // Step 3: Add the document to Firestore
    try {
      const db = getFirestore();
      const docRef = await addDoc(collection(db, "fire"), reportData);
      console.log("Document written with ID: ", docRef.id);
      alert("Report submitted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Report an Incident</h1>
            <p className="text-gray-500">Please fill out all the fields to the best of your ability.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formValues.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formValues.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="intensity" className="block text-sm font-medium text-gray-700">
                Intensity: <span className="font-bold text-red-600">{formValues.intensity}</span>
              </label>
              <input
                type="range"
                name="intensity"
                id="intensity"
                min="1"
                max="10"
                value={formValues.intensity}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Required Assistance</h3>
              <div className="flex items-center space-x-6">
                {['policehelp', 'ambulancehelp', 'firehelp', 'otherhelp'].map((helpType) => (
                  <label key={helpType} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name={helpType}
                      checked={formValues[helpType]}
                      onChange={handleChange}
                      className="h-5 w-5 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="capitalize text-gray-700">{helpType.replace('help', '')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Attach an Image</label>
                <input
                    type="file"
                    name="imageFile"
                    id="imageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={loading || !currentLocation}
                className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
              >
                {loading ? <Loader /> : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}