import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";
import Sidebar from "../components/sidebar/Sidebar";
import Loader from "../components/loader/Loader";

// --- Helper Icon Components ---
const MenuIcon = () => ( <svg className="w-6 h-6 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> );
const CameraIcon = () => ( <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const UploadIcon = () => ( <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> );


export default function DistressFormPage() {
    const [formValues, setFormValues] = useState({ title: "", description: "", intensity: "5", policehelp: false, firehelp: false, ambulancehelp: false, otherhelp: false });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('FETCHING'); // ✅ New state for location feedback
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setLocationStatus('FETCHING');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                setLocationStatus('SUCCESS'); // ✅ Set status to success
            },
            (error) => {
                console.error("Error getting location:", error);
                setLocationStatus('ERROR'); // ✅ Set status to error
            },
            {
                enableHighAccuracy: true, // Ask for the best possible location
                timeout: 10000,           // Stop trying after 10 seconds
                maximumAge: 0             // Don't use a cached location
            }
        );
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormValues(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // The submit button is already disabled if location is not available
        setLoading(true);
        // ... (rest of the submit logic is the same)
        let imageUrl = "";
        if (imageFile) {
            try {
                const storage = getStorage();
                const imageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            } catch (error) { console.error("Error uploading image: ", error); setLoading(false); alert("Failed to upload image."); return; }
        }
        const reportData = { ...formValues, intensity: Number(formValues.intensity), datetime: serverTimestamp(), location: currentLocation, imageurl: imageUrl, status: "NEW" };
        try {
            const db = getFirestore();
            await addDoc(collection(db, "fire"), reportData);
            alert("Report submitted successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error adding document: ", error); alert("Failed to submit report.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Helper component to show location status message
    const LocationStatus = () => {
        switch (locationStatus) {
            case 'FETCHING':
                return <p className="text-center text-sm text-yellow-600">Acquiring your location... please wait.</p>;
            case 'SUCCESS':
                return <p className="text-center text-sm text-green-600">Location acquired successfully!</p>;
            case 'ERROR':
                return <p className="text-center text-sm text-red-600">Failed to get location. Please check browser permissions and enable GPS.</p>;
            default:
                return null;
        }
    };

    return (
        <main className="flex bg-slate-100 min-h-screen">
            <div className="hidden lg:block w-64 flex-shrink-0"><Sidebar /></div>
            {isSidebarOpen && ( <div className="lg:hidden fixed inset-0 z-40"><div className="absolute inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div><div className="relative w-64 h-full bg-slate-800 z-50"><Sidebar /></div></div> )}
            
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
                <header className="flex items-center gap-4 mb-6">
                    <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><MenuIcon /></button>
                    <div><h1 className="text-2xl font-bold text-gray-800">Report an Incident</h1></div>
                </header>
                
                <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <div className="mb-6">
                        <LocationStatus /> {/* ✅ Display the status message */}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ... (rest of the form is the same) */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" id="title" required value={formValues.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"/>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" id="description" rows={3} value={formValues.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"/>
                        </div>
                        <div>
                            <label htmlFor="intensity" className="block text-sm font-medium text-gray-700">Intensity: <span className="font-bold text-red-600">{formValues.intensity}</span></label>
                            <input type="range" name="intensity" id="intensity" min="1" max="10" value={formValues.intensity} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"/>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Required Assistance</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['policehelp', 'ambulancehelp', 'firehelp', 'otherhelp'].map((helpType) => (
                                    <label key={helpType} className="flex items-center space-x-2">
                                        <input type="checkbox" name={helpType} checked={formValues[helpType]} onChange={handleChange} className="h-5 w-5 rounded text-red-600 focus:ring-red-500"/>
                                        <span className="capitalize text-gray-700">{helpType.replace('help', '')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700 mb-2">Attach Evidence</span>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input type="file" id="cameraInput" accept="image/*" capture="camera" onChange={handleFileChange} className="hidden"/>
                                <input type="file" id="uploadInput" accept="image/*" onChange={handleFileChange} className="hidden"/>
                                <label htmlFor="cameraInput" className="flex-1 inline-flex items-center justify-center py-3 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                    <CameraIcon /> Take Photo
                                </label>
                                <label htmlFor="uploadInput" className="flex-1 inline-flex items-center justify-center py-3 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                    <UploadIcon /> Upload from Gallery
                                </label>
                            </div>
                            {imagePreview && (
                                <div className="mt-4">
                                    <img src={imagePreview} alt="Image preview" className="w-full max-w-xs mx-auto rounded-lg shadow-md" />
                                </div>
                            )}
                        </div>
                        <div className="text-right pt-4">
                            {/* ✅ Button is now disabled based on location *status* */}
                            <button type="submit" disabled={loading || locationStatus !== 'SUCCESS'} className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400">
                                {loading ? <Loader /> : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}