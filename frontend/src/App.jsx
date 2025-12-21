import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GroupList from './pages/GroupList';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails';
import AddExpense from './pages/AddExpense';
import PersonalDashboard from './pages/PersonalDashboard';
import BillUpload from './pages/BillUpload';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="container mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/groups" element={<GroupList />} />
              <Route path="/groups/create" element={<CreateGroup />} />
              <Route path="/groups/:id" element={<GroupDetails />} />
              <Route path="/groups/:id/add-expense" element={<AddExpense />} />
              <Route path="/personal" element={<PersonalDashboard />} />
              <Route path="/scan" element={<BillUpload />} />
            </Routes>
          </div>
        </Router>
        <ToastContainer />
      </AuthProvider>
    </>
  );
}

export default App;
