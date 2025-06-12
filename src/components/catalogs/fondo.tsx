import React from "react";
// Importa la imagen directamente
import bgImage from '../../assets/bg-aisg.jpg';

const AISGBackground: React.FC<{
    children: React.ReactNode;
    overlay?: boolean;
    className?: string;
    style?: React.CSSProperties;
}> = ({ children, overlay = true, className = "", style = {} }) => (
    <div
        className={`min-h-screen w-full bg-cover bg-center relative ${className}`}
        style={{
            backgroundImage: `url(${bgImage})`,
            ...style,
        }}
    >
        {overlay && (
            <div className="absolute inset-0 bg-[#002057]/80 pointer-events-none z-0" />
        )}
        <div className="relative z-10">{children}</div>
    </div>
);

export default AISGBackground;