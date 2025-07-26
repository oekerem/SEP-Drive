import React, { useEffect, useRef, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import CustomerDashboard from './components/CustomerDashboard';
import DriverDashboard from './components/DriverDashboard';
import RoutePlanner from "./components/RoutePlanner";
import Profile from './components/Profile';
import Search from "./components/Search";
import ActiveRide from "./components/ActiveRide";
import AcceptedDriversList from "./components/AcceptedDriversList";
import RideRequestList from "./components/RideRequestList";
import { connectWebSocket, unsubscribe, subscribe,} from './websocket/WebSocketService';
import DriverSimulation from "./components/DriverSimulation";
import CustomerSimulation from "./components/CustomerSimulation";
import RideHistory from "./components/RideHistory";
import StatusMonitor from "./components/StatusMonitor";
import { AuthContext } from "./contexts/AuthContext";
import Statistics from "./components/Statistics";
import Chat from "./components/Chat"


const App = () => {
    const { user } = useContext(AuthContext);

    const hasSubscribedRef = useRef(false)

    useEffect(() => {
        if (!user || hasSubscribedRef.current) return;

        connectWebSocket(() => {
            const topic = `/topic/offer/${user.username}`;

            subscribe(topic, () => {
                alert('Neues Fahrangebot erhalten');
            });

            hasSubscribedRef.current = true;
        });

        return () => {
            if (user) {
                unsubscribe(`/topic/offer/${user.username}`);
                hasSubscribedRef.current = false;
            }
        };
    }, [user]);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/driversimulation" element={<DriverSimulation />} />
                <Route path="/customersimulation" element={<CustomerSimulation />} />
                <Route path="/status" element={<StatusMonitor />} />

                <Route
                    path="/customer-dashboard"
                    element={
                        <PrivateRoute roles={['KUNDE']}>
                            <CustomerDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/routeplanner"
                    element={
                        <PrivateRoute roles={['KUNDE']}>
                            <RoutePlanner />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/riderequestlist"
                    element={
                        <PrivateRoute roles={['FAHRER']}>
                            <RideRequestList />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/accepteddrivers"
                    element={
                        <PrivateRoute roles={['KUNDE']}>
                            <AcceptedDriversList />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/active-request"
                    element={
                        <PrivateRoute roles={['KUNDE']}>
                            <ActiveRide />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/driver-dashboard"
                    element={
                        <PrivateRoute roles={['FAHRER']}>
                            <DriverDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile/:username"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            {user?.role === 'FAHRER' ? (
                                <DriverDashboard />
                            ) : (
                                <CustomerDashboard />
                            )}
                        </PrivateRoute>
                    }
                />
                <Route path="/search" element={<Search />} />
                <Route path={"/ride-history"} element={<RideHistory/>}/>
                <Route path={"/statistics"} element={<Statistics/>}/>
                <Route path={"/chat/:driveOfferId"} element={<Chat/>}/>


            </Routes>
                <StatusMonitor />
        </Router>
    );
};

export default App;
