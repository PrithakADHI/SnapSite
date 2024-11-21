import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Home from './Home/Home.jsx';
import SingleImage from './Image/SingleImage.jsx';

import LoginPage from './Authentication/login.jsx';
import RegisterPage from './Authentication/register.jsx';
import CreateImage from './Create/CreateImage.jsx';
import Result from './Search/Result.jsx';
import EditImagePage from './Edit/Edit.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/image' element={<SingleImage />}/>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/create' element={<CreateImage />} />
        <Route path='/edit/:_id' element={<EditImagePage />}/>
        <Route path='/results' element={<Result />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;