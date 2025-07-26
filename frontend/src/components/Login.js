import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            navigate(user.role === 'FAHRER' ? '/driver-dashboard' : '/customer-dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Call AuthService to login / Edited now using context
            const user = await login(username, password);

            // Check user role and redirect accordingly
            if (user.role === 'FAHRER') {
                navigate('/driver-dashboard');
            } else if (user.role === 'KUNDE') {
                navigate('/customer-dashboard');
            } else {
                // Handle unexpected roles
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Nutzername:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Passwort:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>
                Kein Account? <button onClick={() => navigate('/register')}>Registrieren</button>
            </p>
        </div>
    );
};

export default Login;