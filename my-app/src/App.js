import ClientPage from "./components/ClientPage";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import SignUpDriver from "./components/SignUpDriver";
import DriverPage from "./components/DriverPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import FeedBackHeader from "./components/FeedbackHeader";
import NewFeedBack from "./components/Feedback/NewFeedback";
import AnotherFeedback from "./components/Feedback/AnotherFeedback";
import MyFeedback from "./components/Feedback/MyFeedback";
import ProfilePage from "./components/Profile/ProfilePage";
import { GlobalProvider } from "./components/GlobalContext";
import Users from "./components/Users/Users";
import Order from "./components/Order/Order";
import AddOrder from "./components/AddOrder/AddOrder";
import DriverOrder from "./components/DriverOrder/DriverOrder";
import UpdateOrder from "./components/UpdateOrder/UpdateOrder";
import Balance from "./components/Balance/Balance";
import History from "./components/History/History";
import Message from "./components/Message/Message";
import SignUpAdmin from "./components/SignUpAdmin";
import AdminPage from "./components/AdminPage/AdminPage";
import AdminFeedbacks from "./components/Admin/AdminFeedbacks";
import AdminProfile from "./components/Admin/AdminProfile";
import AdminOrders from "./components/Admin/AdminOrders";
import AdminPrice from "./components/Admin/AdminPrice";
import AdminComplaints from "./components/Admin/AdminComplaints";
import AdminHeader from "./components/Admin/AdminHeader";
import AdminAllUsers from "./components/Admin/AdminAllUsers";
import AdminAllDriver from "./components/Admin/AdminAllDriver";
import AdminAllClient from "./components/Admin/AdminAllClient";
import AllAdmin from "./components/Admin/AllAdmin";
import AdminFinishedOrders from "./components/Admin/AdminFinishedOrders";
import AdminAcceptedOrders from "./components/Admin/AdminAcceptedOrders";
import AdminUnAcceptedOrders from "./components/Admin/AdminUnAcceptedOrders";
import Card from "./components/Card/Card";
import AddBalance from "./components/AddBalance/AddBalance";
import RateStar from "./components/RateStar/RateStar";
import CheckCode from "./components/CheckCode/CheckCode";
import CheckCodeAdmin from "./components/CheckCode/CheckCodeAdmin";
import CheckCodeDriver from "./components/CheckCode/CheckCodeDriver";
import Rating from "./components/Rating/Rating";

function App() {
  return (
    <GlobalProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signUpDriver" element={<SignUpDriver />} />
          <Route path="/signUpAdmin" element={<SignUpAdmin />} />
          <Route path="/driver" element={<DriverPage />} />
          <Route path="/client" element={<ClientPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/feedback" element={<NewFeedBack />} />
          <Route path="/adminFeedback" element={<AdminFeedbacks />} />
          <Route path="/new-feedback" element={<NewFeedBack />} />
          <Route path="/my-feedback" element={<MyFeedback />} />
          <Route path="/another-feedback" element={<AnotherFeedback />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/adminProfile" element={<AdminProfile />} />
          <Route path="/users" element={<Users />} />
          <Route path="/adminUsers" element={<AdminAllUsers />} />
          <Route path="/clientOrders" element={<Order />} />
          <Route path="/driverOrders" element={<DriverOrder />} />
          <Route path="/adminOrders" element={<AdminOrders />} />
          <Route path="/clientOrders/:id" element={<UpdateOrder />} />
          <Route path="/history" element={<History />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/message" element={<Message />} />
          <Route path="/adminPrice" element={<AdminPrice />} />
          <Route path="/adminComplaints" element={<AdminComplaints />} />
          <Route path="/adminAllUsers" element={<AdminAllUsers />} />
          <Route path="/adminAllDriver" element={<AdminAllDriver />} />
          <Route path="/adminAllClient" element={<AdminAllClient />} />
          <Route path="/allAdmin" element={<AllAdmin />} />
          <Route path="/finishedOrders" element={<AdminFinishedOrders />} />
          <Route path="/acceptedOrders" element={<AdminAcceptedOrders />} />
          <Route path="/unAcceptedOrders" element={<AdminUnAcceptedOrders />} />
          <Route path="/card" element={<Card />} />
          <Route path="/addBalance" element={<AddBalance />} />
          <Route path="/rateStar" element={<RateStar />} />
          <Route path="/checkCode" element={<CheckCode />} />
          <Route path="/checkCodeAdmin" element={<CheckCodeAdmin />} />
          <Route path="/checkCodeDriver" element={<CheckCodeDriver />} />
          <Route path="/rating" element={<Rating />} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </GlobalProvider>
  );
}

export default App;
