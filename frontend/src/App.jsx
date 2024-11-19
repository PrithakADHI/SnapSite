import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Home from './Home/Home.jsx';
import SingleImage from './Image/SingleImage.jsx';

import LoginPage from './Authentication/login.jsx';
import RegisterPage from './Authentication/register.jsx';
import CreateImage from './Create/CreateImage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/image' element={<SingleImage />}/>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/create' element={<CreateImage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;