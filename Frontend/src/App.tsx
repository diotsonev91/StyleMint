// import { ThreeCanvas } from './components/three/ThreeCanvas'
import './App.css'
// import Overlay from './components/three/Overlay'

// function App() {

//   return (
//     <>
//         <ThreeCanvas></ThreeCanvas>
//         <Overlay/>
//     </>
//   )
// }

// export default App


//For later integrationuncomment the bellow and make the pages for canvas three js and then add in routes 

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./context/ThemeContext";
import { MainLayout } from "./components/layout/MainLayout";
import { AppRoutes } from "./routes/AppRoutes";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;

