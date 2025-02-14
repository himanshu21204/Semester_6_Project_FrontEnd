import React, { createContext, useEffect, useState } from 'react';
import { decodeJwt, getJWTFromSession } from '../Components/Login/GetAuth';

export const CounterContext = createContext();

export const CounterProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const jwt = getJWTFromSession();
    if (jwt) {
      const decodedUser = JSON.parse(decodeJwt(jwt));
      setUser(decodedUser);
      setIsLogin(true);
    }
  }, []);

  return (
    <CounterContext.Provider value={{user, isLogin }}>
      {children}
    </CounterContext.Provider>
  );
};
