import React, { createContext, useState } from 'react';
import Cookies from 'js-cookie';
// Global context oluşturuluyor
export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {

    const [globalString, setGlobalString] = useState();

    return (
        <GlobalContext.Provider value={{ globalString, setGlobalString }}>
            {children}
        </GlobalContext.Provider>
    );
};