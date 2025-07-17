import { Camera } from "lucide-react";
import { useRef } from "react";




export const ProfilePictureUploader = ({ photo, setPhoto, isEditing }) => {
    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleClick = () => {
        if (!isEditing) return;
        fileInputRef.current.click();
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative group w-36 h-36">
                <img src={photo} alt="Foto de Perfil" className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg" />
                 {isEditing && (
                    <button onClick={handleClick} className="absolute inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                        <div className="text-white text-center">
                            <Camera className="w-8 h-8 mx-auto" />
                            <span className="text-sm font-semibold">Cambiar foto</span>
                        </div>
                    </button>
                 )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png" className="hidden"/>
            </div>
        </div>
    );
};
