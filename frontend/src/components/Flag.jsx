import React from "react";
import usFlag from "../assets/us-flag.svg";
import mxFlag from "../assets/mexico.png";
import euFlag from "../assets/europa.png";
import libraFlag from "../assets/Libra.png";
import jpFlag from "../assets/jp-flag.svg";
import chFlag from "../assets/ch-flag.svg";

export function Flag({ countryCode, className = "size-6 rounded-full overflow-hidden" }) {
  const code = countryCode?.toUpperCase();

  // Mapeamos el código de país al asset correspondiente (usando los PNGs que agregaste y SVGs locales)
  const flagMap = {
    US: usFlag,
    MX: mxFlag,
    EU: euFlag,
    UK: libraFlag,
    JP: jpFlag,
    CH: chFlag,
  };

  const src = flagMap[code];

  return (
    <div className={`relative shrink-0 select-none rounded-full overflow-hidden ${className}`}>
      {src ? (
        <img
          src={src}
          className="h-full w-full object-cover"
          alt={`${code} Flag`}
          draggable="false"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-indigo-900 text-[10px] font-bold text-white">
          {code || "?"}
        </div>
      )}
    </div>
  );
}
