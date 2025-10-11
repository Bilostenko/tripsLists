import React from "react";
import logo from "../assets/interbilos_logo.png";
import npu_logo from "../assets/npuLogo.png";
import interpol_logo from "../assets/inteLogo.png";

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#eaedf1] px-10 py-3">
      <div className="flex items-center gap-4 text-[#101418]">
        <img
          src={interpol_logo}
          alt="Interpol Logo"
          className="w-20 h-20 object-contain"
        />
        <img
          src={npu_logo}
          alt="NPU Logo"
          className="w-20 h-20 object-contain"
        />
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <img
          src={logo}
          alt="InterBilos Logo"
          className="w-72 h-auto object-contain" 
        />
      </div>
    </header>
  );
};

export default Header;