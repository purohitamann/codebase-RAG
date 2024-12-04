import { createContext, useContext, useState } from "react";

const DataContext = createContext({
  data: {
    username: "",
    groq: "",
    pine_cone_key: "",
  },
  setData: () => { },
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState(null);

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
