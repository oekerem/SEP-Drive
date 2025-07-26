import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user: currentUser, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout(); // use context
        navigate('/login');
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#f0f0f0',
            borderBottom: '1px solid #ddd'
        }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                KILOMETERS
            </div>

            <div>
                {currentUser ? (
                    <>
                        <span style={{ marginRight: '10px' }}>
                            {currentUser.firstName} ({currentUser.username})
                        </span>

                        <Link to="/search"><button style={{ marginRight: '10px' }}>Suche</button></Link>
                        <Link to={`/profile/${currentUser.username}`}><button style={{ marginRight: '10px' }}>Profil</button></Link>

                        {currentUser.role === 'KUNDE' && (
                            <>
                                <Link to="/routeplanner"><button style={{ marginRight: '10px' }}>Route Planen</button></Link>
                                <Link to="/active-request"><button style={{ marginRight: '10px' }}>Aktive Fahrt</button></Link>
                                <Link to="/accepteddrivers"><button style={{ marginRight: '10px' }}>Fahrerangebote</button></Link>
                                <Link to="/customersimulation"><button style={{ marginRight: '10px' }}>Fahrtansicht</button></Link>
                            </>
                        )}

                        {currentUser.role === 'FAHRER' && (
                            <>
                                <Link to="/riderequestlist"><button style={{ marginRight: '10px' }}>Fahranfragen</button></Link>
                                <Link to="/driversimulation"><button style={{ marginRight: '10px' }}>Fahrtansicht</button></Link>
                            </>
                        )}

                        <Link to={currentUser.role === 'FAHRER' ? '/driver-dashboard' : '/customer-dashboard'}>
                            <button style={{ marginRight: '10px' }}>Dashboard</button>
                        </Link>

                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login"><button style={{ marginRight: '10px' }}>Login</button></Link>
                        <Link to="/register"><button>Registrieren</button></Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;
